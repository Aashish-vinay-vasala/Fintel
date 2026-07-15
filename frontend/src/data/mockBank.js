// ─── Realistic mock banking data for all VaultIQ pages ───────────────────────
// Modelled on actual FDIC call report metrics, FinCEN typologies, and
// Basel III frameworks for a mid-size US community bank (~$4.2B assets).

export const BANK_NAME    = 'First National Community Bank';
export const BANK_CHARTER = 'FNCB-2847';
export const REPORT_DATE  = 'April 20, 2026';

// ─── Fraud ──────────────────────────────────────────────────────────────────
export const MOCK_FRAUD_FORM = {
  amount: '185000', hour: '2', tx24h: '18',
  avgAmount: '3200', distance: '847',
  foreign: '1', sameCity: '0',
};

export const MOCK_FRAUD_RESULT = {
  fraud_score: 0.94,
  is_fraud: true,
  recommendation: 'BLOCK',
  model: 'RF v2.1',
  factors: [
    { label: 'Transaction at 2:00 AM — high-risk hour', impact: '+31pts', direction: 'up' },
    { label: 'Amount 57× above 7-day average', impact: '+28pts', direction: 'up' },
    { label: 'Foreign origin (International wire)', impact: '+18pts', direction: 'up' },
    { label: '18 transactions in 24h (velocity spike)', impact: '+12pts', direction: 'up' },
    { label: '847 km from registered home address', impact: '+8pts', direction: 'up' },
    { label: 'Account tenure > 5 years (mitigant)', impact: '-3pts', direction: 'down' },
  ],
  explanation: 'This transaction exhibits multiple high-risk signals simultaneously: a $185,000 wire initiated at 02:14 AM from a foreign IP (Ukraine), representing a 5,681% deviation from the 7-day average. Combined with an 18-transaction velocity surge and 847 km geo-displacement, the ensemble model assigns a 94/100 fraud probability. Immediate block and SAR filing recommended under FinCEN guidelines.',
};

// ─── Risk ────────────────────────────────────────────────────────────────────
export const MOCK_RISK_FORM = {
  total_assets: '4200', loan_portfolio: '2840', npa_amount: '68.4',
  tier1_capital: '387', total_capital: '412', cash_reserves: '318',
  investment_securities: '620', total_deposits: '3540',
};

export const MOCK_RISK_RESULT = {
  ratios: {
    npa_ratio: 2.41,
    tier1_capital_ratio: 9.21,
    total_capital_ratio: 9.81,
    liquidity_ratio: 23.8,
    loan_to_deposit_ratio: 80.2,
  },
  risk_score: { score: 62, rating: 'MODERATE RISK', color: 'yellow' },
  stress_tests: [
    {
      scenario: 'mild_recession',
      description: 'Mild recession — NPA up 50%, assets down 5%, deposit outflow 8%',
      stressed_metrics: { npa_ratio: 3.62, tier1_capital_ratio: 8.4, liquidity_ratio: 21.3 },
      regulatory_breaches: [],
      passed: true,
    },
    {
      scenario: 'severe_recession',
      description: 'Severe recession — NPA tripled, assets down 15%, deposit outflow 20%',
      stressed_metrics: { npa_ratio: 7.23, tier1_capital_ratio: 6.9, liquidity_ratio: 18.6 },
      regulatory_breaches: ['Liquidity ratio critically low at 18.60%'],
      passed: false,
    },
    {
      scenario: 'interest_rate_shock',
      description: 'Interest rate shock +300bps — bond portfolio losses, deposit pressure',
      stressed_metrics: { npa_ratio: 2.89, tier1_capital_ratio: 7.8, liquidity_ratio: 20.1 },
      regulatory_breaches: [],
      passed: true,
    },
    {
      scenario: 'cyber_attack',
      description: 'Cyber attack — operational losses, customer confidence impact',
      stressed_metrics: { npa_ratio: 2.41, tier1_capital_ratio: 8.7, liquidity_ratio: 19.4 },
      regulatory_breaches: [],
      passed: true,
    },
  ],
  recommendations: [
    { priority: 'High',   action: 'Reduce CRE concentration below 300% of risk-based capital per FDIC guidance' },
    { priority: 'Medium', action: 'Increase LLR provisioning by $8.2M to reach 130% NPA coverage' },
    { priority: 'Low',    action: 'Diversify funding mix — grow retail CDs to reduce institutional dependency' },
  ],
  explanation: 'FNCB maintains adequate capital ratios above regulatory minimums, however rising NPA concentration in commercial real estate warrants heightened monitoring. Recommend enhanced quarterly stress testing and targeted reserve builds in the office and retail CRE segments.',
};

// ─── Loan Monitor ────────────────────────────────────────────────────────────
export const MOCK_LOANS_PORTFOLIO = {
  total_outstanding: '2840', npl_ratio: '2.41',
  avg_ltv: '67', reserve_coverage: '124', ytd_charge_offs: '12.4',
};

export const MOCK_LOANS = [
  { borrower: 'Meridian Properties LLC',   loan_type: 'CRE',       outstanding: '28400', days_past_due: 0,   collateral_value: '38200' },
  { borrower: 'Summit Industrial Corp',    loan_type: 'C&I',       outstanding: '14200', days_past_due: 0,   collateral_value: '21000' },
  { borrower: 'Coastal Hospitality Group', loan_type: 'CRE Hotel', outstanding: '9800',  days_past_due: 47,  collateral_value: '11200' },
  { borrower: 'GreenTech Manufacturing',   loan_type: 'C&I',       outstanding: '6400',  days_past_due: 0,   collateral_value: '8900'  },
  { borrower: 'Riverside Apartments LLC',  loan_type: 'Multifamily', outstanding: '5200', days_past_due: 0,  collateral_value: '8100'  },
  { borrower: 'Harbor View Retail Ctr',    loan_type: 'CRE Retail', outstanding: '4100', days_past_due: 92, collateral_value: '4800'  },
];

export const MOCK_LOANS_RESULT = {
  health_score: 71,
  rating: 'FAIR',
  ewi_count: 3,
  early_warnings: [
    { indicator: 'Coastal Hospitality — 47 DPD, cash flow deteriorating', severity: 'HIGH' },
    { indicator: 'Harbor View Retail — 92 DPD, anchor tenant vacancy', severity: 'HIGH' },
    { indicator: 'Office CRE sector exposure at 22% — above peer median', severity: 'MEDIUM' },
  ],
  loan_analysis: [
    { borrower: 'Meridian Properties LLC',   action: 'MONITOR',     note: 'Performing. LTV 74% — monitor lease renewals Q3.' },
    { borrower: 'Summit Industrial Corp',    action: 'MONITOR',     note: 'Strong cash flow, DSCR 2.14. Low risk.' },
    { borrower: 'Coastal Hospitality Group', action: 'WATCH',       note: '47 DPD. RevPAR down 18% YoY. Request updated financials.' },
    { borrower: 'GreenTech Manufacturing',   action: 'MONITOR',     note: 'Performing. New government contract improves outlook.' },
    { borrower: 'Riverside Apartments LLC',  action: 'MONITOR',     note: 'Occupancy 97%. Strong multifamily fundamentals.' },
    { borrower: 'Harbor View Retail Ctr',    action: 'RESTRUCTURE', note: '92 DPD. Major anchor vacated. Appraisal ordered — value likely impaired.' },
  ],
  recommendations: [
    'Classify Harbor View Retail as Substandard under OCC guidelines; increase specific reserve to $820K',
    'Request 12-month rolling financial statements from Coastal Hospitality immediately',
    'Engage third-party workout specialist for Harbor View restructuring options',
    'Conduct stress test on office/retail CRE assuming 20% NOI decline',
    'Pause new CRE originations above $5M until concentration ratio improves',
  ],
  summary: 'Portfolio health is fair with 2 credits in early distress. The retail CRE segment faces structural headwinds. Proactive restructuring of Harbor View and close monitoring of Coastal Hospitality are recommended to prevent migration to loss classification.',
};

// ─── AML ─────────────────────────────────────────────────────────────────────
export const MOCK_AML_NARRATIVE = `Series of structured cash deposits totaling $48,000 across 6 transactions over 3 days, each just below $9,500 threshold, at 4 different branch locations. Customer is a sole proprietor with typical monthly business receipts under $15,000. Subsequent wire transfer of $47,200 to shell entity in Cyprus, followed by reverse wire of $45,800 from an unrelated entity in Malta.`;

export const MOCK_AML_RESULT = {
  risk_level: 'HIGH',
  risk_score: 91,
  entities: [
    { type: 'AMOUNT',       value: '$48,000 structured over 6 transactions' },
    { type: 'AMOUNT',       value: 'Wire: $47,200 to Cyprus entity' },
    { type: 'LOCATION',     value: 'Cyprus (high-risk jurisdiction)' },
    { type: 'LOCATION',     value: 'Malta (high-risk jurisdiction)' },
    { type: 'ORGANIZATION', value: 'Unnamed shell entity — Cyprus' },
    { type: 'DATE',         value: 'March 14–16, 2026 (3-day window)' },
  ],
  red_flags: [
    'Structuring — 6 deposits each below $10,000 CTR threshold (31 CFR 1010.314)',
    'Rapid movement of funds — layering through shell entities',
    'High-risk jurisdictions: Cyprus and Malta',
    'Transaction volume inconsistent with stated business profile',
    'Round-trip wire pattern indicates layering',
    'Multi-branch structuring at 4 locations in 3 days',
  ],
  patterns: ['Structuring / Smurfing', 'Layering — Shell Company', 'Round-Tripping', 'Trade Finance Abuse'],
  recommendation: 'File SAR immediately under 31 USC 5318(g). Freeze account pending review. Escalate to FinCEN if beneficial ownership of Cyprus entity cannot be established within 5 business days. Case severity: CRITICAL.',
};

// ─── Credit Suite ─────────────────────────────────────────────────────────────
export const MOCK_CREDIT_FORM = {
  age: '38', income: '145000', loanAmount: '380000',
  creditScore: '742', employmentYears: '11', existingLoans: '1',
  missedPayments: '0', dti: '0.32',
};

export const MOCK_CREDIT_RESULT = {
  score: 742,
  decision: 'CONDITIONALLY_APPROVED',
  recommendation: 'CONDITIONALLY APPROVED',
  explanation: 'Strong income and credit history with 11 years stable employment. DTI of 32% is within acceptable range. One existing mortgage with no missed payments. Approve subject to 20% down payment verification and 6-month bank statements confirming stated income.',
  risk_factors: [
    { name: 'Debt-to-Income 32%', weight: 0.3, impact: 'moderate', direction: 'up' },
    { name: 'Credit Score 742 (Good)', weight: -0.6, impact: 'positive', direction: 'down' },
    { name: '11 yrs stable employment', weight: -0.5, impact: 'positive', direction: 'down' },
    { name: 'Zero missed payments', weight: -0.4, impact: 'positive', direction: 'down' },
  ],
  offered_rate: 6.85,
  max_loan: 420000,
  conditions: ['Verify 20% down payment ($76,000)', 'Submit 6 months bank statements', 'Confirm no undisclosed liabilities'],
};

export const MOCK_DSCR_FORM = {
  noi: '285000', total_debt_service: '141600',
  loan_amount: '1800000', property_value: '2400000',
  loan_term: '25', interest_rate: '6.75', amortization: '25',
  property_type: 'Multifamily', occupancy_rate: '94',
};

export const MOCK_DSCR_RESULT = {
  dscr: 2.01,
  dscr_rating: 'STRONG',
  ltv: 75,
  debt_yield: 15.8,
  recommendation: 'APPROVE',
  max_loan_amount: 2.1,
  loan_constant: 7.87,
  conditions: ['Verify rent rolls for trailing 12 months', 'Confirm 94% occupancy with executed leases'],
  risks: ['Interest rate risk on variable portion at maturity', 'Local multifamily vacancy trending up +1.2%'],
  summary: 'Strong DSCR of 2.01 well exceeds the 1.25x minimum threshold. 75% LTV within policy limits. Debt yield of 15.8% provides adequate return buffer. Recommend approval with standard conditions.',
};

// ─── Treasury — IRR ───────────────────────────────────────────────────────────
export const MOCK_IRR_FORM = {
  total_assets: '4200', rate_sensitive_assets: '2840',
  rate_sensitive_liabilities: '2210', current_nim: '3.42',
  fixed_rate_loans_pct: '38', variable_rate_loans_pct: '62',
  avg_asset_duration: '4.2', avg_liability_duration: '1.8',
  current_fed_rate: '4.50',
};

export const MOCK_IRR_RESULT = {
  nim_current: 3.42,
  nim_stressed: 2.98,
  duration_gap: 2.4,
  repricing_risk: 'MEDIUM',
  rate_sensitivity: 'Asset-sensitive — rising rates modestly benefit NIM',
  earnings_at_risk: 18.4,
  economic_value_at_risk: 142,
  scenarios: [
    { shock: '+100bps', nim_impact: +0.18, commentary: 'NIM improves to 3.60% — asset re-pricing outpaces liability costs' },
    { shock: '+200bps', nim_impact: +0.12, commentary: 'NIM reaches 3.54% — deposit beta increases, partially offsetting asset gains' },
    { shock: '+300bps', nim_impact: -0.28, commentary: 'NIM falls to 3.14% — deposit repricing accelerates sharply, CD competition intensifies' },
    { shock: '-100bps', nim_impact: -0.32, commentary: 'NIM compresses to 3.10% — variable rate assets reprice down faster than deposits' },
    { shock: '-200bps', nim_impact: -0.58, commentary: 'Severe NIM compression to 2.84% — floor rate risk on deposits limits benefit' },
  ],
  recommendations: [
    'Reduce duration gap below 2.0 years through interest rate swap overlays',
    'Lock in longer-term fixed funding via FHLB advances before potential rate cuts',
    'Hedge $400M fixed-rate mortgage portfolio with receive-fixed interest rate swaps',
    'Model deposit beta sensitivity — current assumption of 0.42 may be understated',
  ],
  summary: 'FNCB is moderately asset-sensitive with a 2.4-year duration gap. Current positioning benefits from the 4.50% fed funds environment but faces significant NIM compression risk in a -200bps stress scenario. Recommend duration gap reduction and hedging of fixed-rate mortgage portfolio.',
};

// ─── Treasury — LCR ───────────────────────────────────────────────────────────
export const MOCK_LCR_FORM = {
  hqla_l1: '318', hqla_l2a: '142', hqla_l2b: '48',
  retail_outflows: '89', wholesale_outflows: '214', secured_outflows: '38',
  retail_inflows: '42', wholesale_inflows: '86', secured_inflows: '28',
};

export const MOCK_LCR_RESULT = {
  lcr_ratio: 124,
  status: 'COMPLIANT',
  hqla_total: 477.6,
  net_outflows_30d: 385.2,
  buffer_surplus: 92.4,
  stress_lcr: 108,
  breakdown: [
    { component: 'Level 1 — Cash & Reserves', amount: 318, type: 'hqla' },
    { component: 'Level 2A — Agency MBS',      amount: 120.7, type: 'hqla' },
    { component: 'Level 2B — Corp Bonds IG',   amount: 38.9, type: 'hqla' },
    { component: 'Retail Deposit Outflows',    amount: 89, type: 'outflow' },
    { component: 'Wholesale Funding Outflows', amount: 214, type: 'outflow' },
    { component: 'Secured Funding Outflows',   amount: 38, type: 'outflow' },
    { component: 'Committed Facility Drawdown', amount: 44.2, type: 'outflow' },
    { component: 'Retail Loan Inflows',        amount: 42, type: 'inflow' },
    { component: 'Wholesale Loan Inflows',     amount: 86, type: 'inflow' },
  ],
  recommendations: [
    'LCR of 124% provides comfortable 24% buffer above 100% minimum',
    'Stress scenario LCR of 108% — maintain headroom above 100% floor',
    'Consider extending FHLB advances to reduce 30-day wholesale outflow concentration',
    'Monitor Level 2B asset cap — currently at 78% of 15% limit',
  ],
  summary: 'FNCB is LCR-compliant with a ratio of 124%, supported by a strong Level 1 HQLA base of $318M. The 30-day net outflow exposure is concentrated in wholesale funding; diversifying liability tenor would improve the stress LCR above 115%.',
};

// ─── Compliance Hub ───────────────────────────────────────────────────────────
export const MOCK_COMPLIANCE_MESSAGES = [
  {
    role: 'user',
    content: 'When is a SAR filing required for structuring activity?',
  },
  {
    role: 'assistant',
    content: `**SAR Filing — Structuring (31 CFR § 1020.320)**\n\nA Suspicious Activity Report (SAR) must be filed with FinCEN within **30 calendar days** of detecting structuring activity. Key triggers:\n\n• **Threshold**: Any transaction or series of transactions totaling $5,000 or more that the bank suspects involves structuring to evade CTR requirements.\n• **Pattern recognition**: Multiple transactions below $10,000 that appear designed to circumvent the Currency Transaction Report (CTR) threshold.\n• **No prior tipping off**: Under 31 USC 5318(g)(2), the bank is prohibited from notifying the subject of the SAR filing.\n\n**Required fields in SAR**: Subject information, account details, transaction dates/amounts, description of suspicious activity, and the specific structuring typology.\n\n*Reference: BSA/AML Examination Manual, FFIEC 2023 Edition, Chapter 14.*`,
  },
];

export const MOCK_REGULATORY_RESULT = {
  regulations: [
    { name: 'Basel III Endgame (NPR)', agency: 'OCC / Fed / FDIC', effective_date: 'July 1, 2025', status: 'ACTIVE', impact: 'HIGH', description: 'Revised capital rules increasing RWA calculations for operational and market risk. Community banks under $100B may see limited direct impact but must monitor.' },
    { name: 'CRA Modernization Rule', agency: 'OCC / Fed / FDIC', effective_date: 'January 1, 2026', status: 'ACTIVE', impact: 'HIGH', description: 'Comprehensive overhaul of CRA assessment framework. New retail lending tests and geographic performance standards. FNCB must recalculate CRA rating under new methodology.' },
    { name: 'FedNow Instant Payment Standards', agency: 'Federal Reserve', effective_date: 'Ongoing 2025', status: 'ACTIVE', impact: 'MEDIUM', description: 'Expanded FedNow participation requirements and fraud monitoring obligations for instant payment corridors.' },
    { name: 'CFPB 1071 Small Business Lending', agency: 'CFPB', effective_date: 'July 18, 2025', status: 'ACTIVE', impact: 'HIGH', description: 'Mandatory collection and reporting of small business loan application data including demographics. Compliance date applies to banks with 2,500+ covered originations.' },
  ],
  action_items: [
    'Complete CRA assessment methodology update by March 2026',
    'Deploy 1071 data collection infrastructure for small business applications by June 2025',
    'Run Basel III Endgame RWA impact analysis — estimated +$28M additional capital requirement',
    'Conduct FedNow fraud monitoring gap analysis against FS-ISAC guidelines',
  ],
  compliance_deadline: '2025-07-18',
  affected_departments: ['Credit', 'Compliance', 'Treasury', 'Technology', 'CRA Officer'],
  answer: 'Four high-priority regulatory changes are active or imminent. CRA Modernization and CFPB 1071 carry the highest operational burden. Recommend forming a cross-functional compliance task force with Q2 2025 milestones.',
};

// ─── Customer Intel ───────────────────────────────────────────────────────────
export const MOCK_CUSTOMER_FORM = {
  customer_id: 'CST-48291', full_name: 'Robert A. Blackwood',
  account_type: 'Business Checking', country: 'United States',
  occupation: 'Import/Export Broker', monthly_income: '28000',
  account_age_years: '3', existing_products: 'Checking, Business LOC, Wire Services',
};

export const MOCK_CUSTOMER_RESULT = {
  risk_level: 'HIGH',
  risk_score: 78,
  credit_grade: 'B',
  kyc_status: 'PENDING',
  pep_match: false,
  sanctions_match: false,
  product_holdings: ['Business Checking', 'Business Line of Credit ($250K)', 'International Wire Services', 'Remote Deposit Capture'],
  behavioral_flags: [
    'Wire volume 340% above peer business segment',
    'Frequent international transfers to high-risk jurisdictions',
    'Cash deposit pattern inconsistent with stated business',
    'KYC refresh overdue by 14 months',
  ],
  lifetime_value: 148,
  recommended_due_diligence: 'Enhanced Due Diligence (EDD) required. Obtain current financial statements, beneficial ownership certification (CDD Rule 31 CFR 1010.230), and business activity documentation within 30 days.',
  summary: 'Robert Blackwood presents elevated risk indicators driven by high international wire volumes and inconsistent cash deposit patterns relative to his stated import/export business. PEP and OFAC screening clear, however KYC refresh is overdue. Immediate EDD review recommended before continued wire service access.',
};

export const MOCK_NETWORK_FORM = {
  account_id: 'CST-48291', description: 'Import/export broker, international wire activity',
  tx_count: '84', period: 'last 90 days',
};

export const MOCK_NETWORK_RESULT = {
  risk_score: 78,
  flags: ['Shell Company Links', 'Circular Transactions', 'High-Risk Jurisdictions'],
  nodes: [
    { id: 'CST-48291', label: 'R. Blackwood\nCST-48291', type: 'individual', risk: 'HIGH',   amount: 284000 },
    { id: 'N001',      label: 'Harborline\nTrading LLC', type: 'shell',      risk: 'HIGH',   amount: 142000 },
    { id: 'N002',      label: 'Pacific Rim\nExports',    type: 'merchant',   risk: 'MEDIUM', amount: 88000  },
    { id: 'N003',      label: 'Elena Vasquez\n(Cyprus)', type: 'individual', risk: 'HIGH',   amount: 67000  },
    { id: 'N004',      label: 'Apex Freight\nLtd',      type: 'merchant',   risk: 'LOW',    amount: 34000  },
    { id: 'N005',      label: 'First Alliance\nHoldings', type: 'shell',    risk: 'HIGH',   amount: 95000  },
    { id: 'N006',      label: 'TradeLink\nPlatform',    type: 'merchant',   risk: 'LOW',    amount: 21000  },
  ],
  edges: [
    { from: 'CST-48291', to: 'N001', label: '$142K wire', suspicious: true  },
    { from: 'N001',      to: 'N003', label: '$138K wire', suspicious: true  },
    { from: 'N003',      to: 'N005', label: '$91K wire',  suspicious: true  },
    { from: 'N005',      to: 'CST-48291', label: '$88K return', suspicious: true  },
    { from: 'CST-48291', to: 'N002', label: '$88K trade', suspicious: false },
    { from: 'CST-48291', to: 'N004', label: '$34K freight', suspicious: false },
    { from: 'N002',      to: 'N006', label: '$21K platform', suspicious: false },
  ],
  summary: 'Network analysis reveals a circular transaction loop: Blackwood → Harborline LLC → Vasquez (Cyprus) → First Alliance → Blackwood. The $88K return closely matches the outbound $91K — consistent with a round-tripping/layering typology. Recommend SAR filing and account restriction.',
};

// ─── Risk Assets — Chargeback ─────────────────────────────────────────────────
export const MOCK_CHARGEBACK_FORM = {
  merchant_name: 'LuxTech Electronics', transaction_amount: '3299',
  transaction_date: '2026-03-28', dispute_reason: 'Item not received',
  card_type: 'Visa Credit', customer_claim: 'Package never arrived, tracking shows delivered to wrong address',
  merchant_response: 'Tracking confirms delivery to address on file', days_since_transaction: '23',
};

export const MOCK_CHARGEBACK_RESULT = {
  category: 'MERCHANT_ERROR',
  win_probability: 68,
  recommended_action: 'DISPUTE',
  reason_code: 'Visa RC 13.1 — Merchandise / Services Not Received',
  reg_e_applicable: false,
  required_evidence: [
    'Carrier proof-of-delivery with GPS coordinates',
    'Customer\'s stated delivery address vs. address on file comparison',
    'Customer communication log (pre-dispute)',
    'Merchant\'s refund policy documentation',
    'AVS match confirmation at transaction',
  ],
  timeline_days: 30,
  risk_indicators: [
    'Customer disputes 2 transactions in last 6 months',
    'Merchant has 3.2% chargeback rate — above Visa 1% threshold',
    'High-value electronics — frequent target for friendly fraud',
  ],
  summary: 'Dispute classified as Merchant Error — wrong-address delivery. Bank has 68% win probability based on carrier GPS mismatch with cardholder\'s registered address. File representment within 30 days with delivery coordinate evidence. Merchant\'s elevated chargeback rate supports the dispute.',
};

// ─── Risk Assets — Collateral ─────────────────────────────────────────────────
export const MOCK_COLLATERAL_ASSETS = [
  { type: 'Commercial Real Estate', value: '4200', haircut: '20', ltv: '65' },
  { type: 'Agency MBS (FNMA)',      value: '1420', haircut: '5',  ltv: '95' },
  { type: 'SBA Loan Pool',          value: '890',  haircut: '10', ltv: '90' },
  { type: 'Corporate Bonds (A-)',   value: '640',  haircut: '15', ltv: '85' },
];

export const MOCK_COLLATERAL_RESULT = {
  total_collateral_value: 7150,
  eligible_collateral: 5876,
  coverage_ratio: 138,
  margin_call_risk: 'LOW',
  assets: [
    { type: 'Commercial Real Estate', market_value: 4200, haircut_value: 3360, ltv: 65, status: 'ADEQUATE' },
    { type: 'Agency MBS (FNMA)',      market_value: 1420, haircut_value: 1349, ltv: 95, status: 'ADEQUATE' },
    { type: 'SBA Loan Pool',          market_value: 890,  haircut_value: 801,  ltv: 90, status: 'ADEQUATE' },
    { type: 'Corporate Bonds (A-)',   market_value: 640,  haircut_value: 544,  ltv: 85, status: 'ADEQUATE' },
  ],
  recommendations: [
    'Overall collateral position strong — 138% coverage ratio exceeds 120% internal policy',
    'CRE collateral reappraisal due Q3 2026 per FIRREA requirements (loans > $500K)',
    'Consider substituting lower-yield corporate bonds with additional agency MBS to improve liquidity',
    'Monitor Agency MBS prepayment speeds given rate environment',
  ],
  summary: 'Collateral portfolio of $7.15B gross / $5.88B eligible provides 138% coverage against outstanding secured borrowings. All assets are within policy limits. No margin call risk under current market conditions. Recommend reappraisal of CRE collateral in Q3 2026.',
};

// ─── Benchmarking ─────────────────────────────────────────────────────────────
export const MOCK_BENCHMARK_FORM = {
  bank_name: 'First National Community Bank', total_assets: '4200',
  nim: '3.42', roa: '1.18', roe: '11.4', efficiency_ratio: '58.2',
  npl_ratio: '2.41', tier1_ratio: '9.21', loan_growth: '7.8', deposit_growth: '5.2',
};

export const MOCK_BENCHMARK_RESULT = {
  overall_rank: 'SECOND_QUARTILE',
  peer_group: 'Community Banks $1B–$10B Assets (FDIC Peer Group 3)',
  metrics: [
    { name: 'Net Interest Margin',   bank_value: 3.42, peer_median: 3.18, top_quartile: 3.65, unit: '%', status: 'ABOVE' },
    { name: 'Return on Assets',      bank_value: 1.18, peer_median: 1.02, top_quartile: 1.35, unit: '%', status: 'ABOVE' },
    { name: 'Return on Equity',      bank_value: 11.4, peer_median: 10.2, top_quartile: 13.8, unit: '%', status: 'ABOVE' },
    { name: 'Efficiency Ratio',      bank_value: 58.2, peer_median: 61.4, top_quartile: 54.1, unit: '%', status: 'ABOVE' },
    { name: 'NPL Ratio',             bank_value: 2.41, peer_median: 1.84, top_quartile: 0.98, unit: '%', status: 'BELOW' },
    { name: 'Tier 1 Capital Ratio',  bank_value: 9.21, peer_median: 10.8, top_quartile: 13.4, unit: '%', status: 'BELOW' },
    { name: 'Loan Growth (YTD)',     bank_value: 7.8,  peer_median: 5.4,  top_quartile: 10.2, unit: '%', status: 'ABOVE' },
    { name: 'Deposit Growth (YTD)',  bank_value: 5.2,  peer_median: 4.1,  top_quartile: 8.6,  unit: '%', status: 'ABOVE' },
  ],
  strengths: [
    'NIM of 3.42% is 24bps above peer median — strong asset yield management',
    'Efficiency ratio of 58.2% beats 75% of peer banks',
    'ROA of 1.18% in top 35th percentile — strong earnings productivity',
    'Loan growth of 7.8% outpacing peers by 240bps',
  ],
  weaknesses: [
    'NPL ratio of 2.41% is 57bps above peer median — CRE credit quality concern',
    'Tier 1 ratio of 9.21% is 159bps below peer median — capital build needed',
    'Deposit growth lagging loan growth — L/D ratio drifting toward 85%',
  ],
  summary: 'FNCB ranks in the second quartile overall among $1B–$10B community bank peers. Profitability metrics (NIM, ROA, efficiency) are strong competitive advantages. Primary concerns are above-peer NPL ratio driven by CRE stress and below-peer capital ratios that limit strategic flexibility.',
};
