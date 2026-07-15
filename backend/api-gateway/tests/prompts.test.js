const { getPrompt, VARIANTS } = require('../src/lib/prompts');

const FRAUD_INPUT = { amount: 500, hour: 14, frequency_24h: 2, is_foreign: false, distance_from_home: 5 };
const CREDIT_INPUT = { age: 35, income: 90000, loan_amount: 250000, credit_score: 720, employment_years: 8, missed_payments: 0, debt_to_income: 0.32 };
const RISK_INPUT = { total_assets: 4200, loan_portfolio: 2840, npa_amount: 68, tier1_capital: 387 };

describe('Prompt Library — getPrompt', () => {
  test('generates fraud zero-shot prompt', () => {
    const p = getPrompt('fraud', 'zero_shot', FRAUD_INPUT);
    expect(p).toContain('fraud detection');
    expect(p).toContain('fraud_score');
    expect(p).toContain('recommendation');
    expect(p).toContain('"amount": 500');
  });

  test('fraud few-shot prompt contains labeled examples', () => {
    const p = getPrompt('fraud', 'few_shot', FRAUD_INPUT);
    expect(p).toContain('EXAMPLE 1');
    expect(p).toContain('EXAMPLE 2');
    expect(p).toContain('EXAMPLE 3');
    expect(p).toContain('NEW TRANSACTION TO CLASSIFY');
    expect(p).toContain('"amount": 500');
  });

  test('fraud few-shot examples cover low/medium/high risk', () => {
    const p = getPrompt('fraud', 'few_shot', FRAUD_INPUT);
    expect(p).toMatch(/fraud_score.*0\.03/);   // low
    expect(p).toMatch(/fraud_score.*0\.41/);   // medium
    expect(p).toMatch(/fraud_score.*0\.94/);   // high
  });

  test('fraud chain-of-thought prompt has step-by-step structure', () => {
    const p = getPrompt('fraud', 'cot', FRAUD_INPUT);
    expect(p).toContain('Step 1');
    expect(p).toContain('Step 2');
    expect(p).toContain('Step 6');
    expect(p).toContain('Composite score');
  });

  test('credit zero-shot prompt contains 5Cs signals', () => {
    const p = getPrompt('credit', 'zero_shot', CREDIT_INPUT);
    expect(p).toContain('credit underwriter');
    expect(p).toContain('decision');
  });

  test('credit few-shot has approve/conditional/decline examples', () => {
    const p = getPrompt('credit', 'few_shot', CREDIT_INPUT);
    expect(p).toContain('APPROVED');
    expect(p).toContain('CONDITIONALLY_APPROVED');
    expect(p).toContain('DECLINED');
    expect(p).toContain('NOW EVALUATE');
  });

  test('credit CoT prompt uses 5Cs framework', () => {
    const p = getPrompt('credit', 'cot', CREDIT_INPUT);
    expect(p).toContain('CHARACTER');
    expect(p).toContain('CAPACITY');
    expect(p).toContain('CAPITAL');
    expect(p).toContain('CONDITIONS');
  });

  test('risk few-shot has well-capitalised and stressed examples', () => {
    const p = getPrompt('risk', 'few_shot', RISK_INPUT);
    expect(p).toContain('EXAMPLE');
    expect(p).toContain('Basel III');
    expect(p).toContain('overall_risk');
  });

  test('compliance few-shot contains CTR and SAR examples', () => {
    const p = getPrompt('compliance', 'few_shot', 'What are CTR requirements?');
    expect(p).toContain('CTR');
    expect(p).toContain('SAR');
    expect(p).toContain('31 CFR');
  });

  test('falls back to zero_shot when variant not found', () => {
    const p = getPrompt('fraud', 'nonexistent_variant', FRAUD_INPUT);
    expect(typeof p).toBe('string');
    expect(p.length).toBeGreaterThan(50);
  });

  test('throws for unknown domain', () => {
    expect(() => getPrompt('unknown_domain', 'zero_shot', {})).toThrow('Unknown domain');
  });

  test('all prompt outputs are non-empty strings', () => {
    for (const [domain, variants] of Object.entries(VARIANTS)) {
      for (const [variant] of Object.entries(variants)) {
        const input = domain === 'compliance' || domain === 'aml' ? 'test question' : {};
        const p = getPrompt(domain, variant, input);
        expect(typeof p).toBe('string');
        expect(p.length).toBeGreaterThan(30);
      }
    }
  });
});
