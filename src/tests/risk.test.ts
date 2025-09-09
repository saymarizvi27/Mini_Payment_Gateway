import assert from 'assert';
import { computeRiskScore, domainIsSuspicious, getEmailDomain } from '@utils/risk';

// Basic tests for risk utilities

assert.strictEqual(getEmailDomain('a@b.com'), 'b.com');
assert.strictEqual(domainIsSuspicious('user@mailinator.com'), true);
assert.strictEqual(domainIsSuspicious('user@good.com'), false);

const low = computeRiskScore(50, 'user@good.com');
assert.ok(low >= 0 && low < 0.5);

const medium = computeRiskScore(1500, 'user@good.com');
assert.ok(medium >= 0.3);

const high = computeRiskScore(6000, 'user@bad.ru');
assert.ok(high >= 0.5);
