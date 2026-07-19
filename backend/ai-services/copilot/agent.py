from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from shared.llm import get_llm
from copilot.tools import TOOLS, TOOL_LABELS

SYSTEM_PROMPT = """You are the Fintel Copilot, an AI assistant embedded inside Fintel, an AI-powered banking intelligence platform used by risk, credit, compliance, and fraud teams.

You help users understand what they're looking at and answer questions about banking risk, credit, fraud, AML, and compliance concepts. When asked to summarize the current page, base the summary only on the page context given to you below — never invent specific numbers or data you were not given. If you lack enough context to answer specifically, say so and answer generally instead.

You also have tools available to run real banking analyses: fraud check, credit evaluation, risk analysis, compliance transaction screening, AML narrative analysis, AML customer screening, loan portfolio monitoring, and report generation. Only call a tool once the user has explicitly given you ALL of its required information in the conversation — never guess, assume, or fill in default values. If something required is missing, ask the user for exactly the missing pieces in plain text instead of calling the tool.

Be concise. Use correct banking terminology."""


def _build_system_prompt(page):
    text = SYSTEM_PROMPT
    if page.get("title"):
        text += f"\n\nThe user is currently on the '{page['title']}' page. {page.get('description', '')}"
    return text


def _missing_required_fields(tool, args):
    required = tool.args_schema.model_json_schema().get("required", [])
    return [f for f in required if args.get(f) in (None, "")]


def _format_args(args):
    lines = []
    for k, v in args.items():
        label = k.replace('_', ' ').title()
        if isinstance(v, list) and v and isinstance(v[0], dict):
            lines.append(f"- {label}:")
            for item in v:
                item_str = ", ".join(f"{ik.replace('_', ' ').title()}: {iv}" for ik, iv in item.items())
                lines.append(f"    • {item_str}")
        elif isinstance(v, dict):
            dict_str = ", ".join(f"{ik.replace('_', ' ').title()}: {iv}" for ik, iv in v.items())
            lines.append(f"- {label}: {dict_str}")
        else:
            lines.append(f"- {label}: {v}")
    return "\n".join(lines)


def run_copilot_chat(request: dict):
    message = request.get("message", "")
    page = request.get("page") or {}
    history = (request.get("history") or [])[-6:]
    pending_action = request.get("pending_action")
    confirm = request.get("confirm", False)

    # User already confirmed a previously-proposed action — execute it now, no LLM round-trip needed.
    if confirm and pending_action and pending_action.get("name") in TOOLS:
        name = pending_action["name"]
        args = pending_action.get("args", {})
        result = TOOLS[name].invoke(args)
        return {"type": "result", "tool": name, "label": TOOL_LABELS[name], "args": args, "result": result}

    messages = [SystemMessage(content=_build_system_prompt(page))]
    for turn in history:
        role, text = turn.get("role"), turn.get("text", "")
        if role == "user":
            messages.append(HumanMessage(content=text))
        elif role == "ai":
            messages.append(AIMessage(content=text))
    messages.append(HumanMessage(content=message))

    llm = get_llm().bind_tools(list(TOOLS.values()))
    response = llm.invoke(messages)

    if response.tool_calls:
        call = response.tool_calls[0]
        name, args = call["name"], call["args"]
        tool = TOOLS.get(name)
        if tool and not _missing_required_fields(tool, args):
            confirm_msg = f"I'm about to run **{TOOL_LABELS[name]}** with:\n{_format_args(args)}\n\nProceed?"
            return {"type": "confirm", "tool": name, "label": TOOL_LABELS[name], "args": args, "message": confirm_msg}

    return {"type": "chat", "answer": response.content or "I need a bit more information to help with that — could you share the missing details?"}
