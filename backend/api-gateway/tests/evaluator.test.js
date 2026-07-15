jest.mock('../src/lib/db', () => ({
  supabase: {
    from: () => ({ insert: jest.fn().mockResolvedValue({}) }),
  },
}));

const { scoreQuality } = require('../src/lib/evaluator');

describe('Evaluator — scoreQuality', () => {
  describe('Fraud route', () => {
    const route = '/api/fraud/analyze';

    test('perfect output scores 100', () => {
      const score = scoreQuality(route, {
        fraud_score: 0.94, is_fraud: true,
        recommendation: 'BLOCK',
        explanation: 'Multiple high-risk signals detected: late night foreign wire with extreme velocity.',
      });
      expect(score).toBe(100);
    });

    test('missing fraud_score penalises score', () => {
      const score = scoreQuality(route, {
        is_fraud: true, recommendation: 'BLOCK', explanation: 'Some explanation text here.',
      });
      expect(score).toBeLessThan(85);
    });

    test('missing is_fraud penalises score', () => {
      const score = scoreQuality(route, {
        fraud_score: 0.5, recommendation: 'REVIEW', explanation: 'Explanation text.',
      });
      expect(score).toBeLessThan(90);
    });

    test('empty output scores very low (≤ 10)', () => {
      const score = scoreQuality(route, {});
      expect(score).toBeLessThanOrEqual(10);
    });

    test('very short output is penalised', () => {
      const score = scoreQuality(route, { fraud_score: 0.5 });
      expect(score).toBeLessThan(70);
    });
  });

  describe('Credit route', () => {
    const route = '/api/credit/evaluate';

    test('complete output scores well', () => {
      const score = scoreQuality(route, {
        decision: 'APPROVED', approval_score: 0.88,
        explanation: 'Strong income and credit history with conservative debt-to-income ratio.',
        suggested_limit: 300000,
      });
      expect(score).toBeGreaterThanOrEqual(85);
    });

    test('missing decision heavily penalised', () => {
      const score = scoreQuality(route, {
        explanation: 'Explanation here.', approval_score: 0.7,
      });
      expect(score).toBeLessThan(80);
    });
  });

  describe('Risk route', () => {
    const route = '/api/risk/analyze';

    test('complete risk output scores well', () => {
      const score = scoreQuality(route, {
        overall_risk: 'MODERATE', risk_score: 58,
        summary: 'Bank maintains adequate capital with moderate NPA concerns.',
        recommendations: ['Increase LLR', 'Reduce CRE concentration'],
      });
      expect(score).toBeGreaterThanOrEqual(85);
    });

    test('missing summary penalises score', () => {
      const score = scoreQuality(route, {
        overall_risk: 'HIGH', risk_score: 72,
      });
      expect(score).toBeLessThan(90);
    });
  });

  describe('Compliance route', () => {
    const route = '/api/compliance/query';

    test('good answer scores well', () => {
      const score = scoreQuality(route, {
        answer: 'A CTR must be filed with FinCEN within 15 calendar days for any cash transaction exceeding $10,000.',
      });
      expect(score).toBeGreaterThanOrEqual(80);
    });

    test('missing answer scores poorly', () => {
      const score = scoreQuality(route, { status: 'compliant' });
      expect(score).toBeLessThan(60);
    });
  });

  describe('Score boundaries', () => {
    test('score is always 0–100', () => {
      const testCases = [
        { route: '/api/fraud/analyze',   output: {} },
        { route: '/api/credit/evaluate', output: {} },
        { route: '/api/risk/analyze',    output: {} },
        { route: '/unknown/route',       output: { data: 'x'.repeat(200) } },
      ];
      for (const { route, output } of testCases) {
        const score = scoreQuality(route, output);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    });
  });
});
