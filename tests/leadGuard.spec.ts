import assert from 'node:assert/strict';
import {
  isPortalPath,
  canSubmitLead,
  getTurnstileSiteKey
} from '../client/src/lib/leadGuard.ts';

assert.equal(isPortalPath('/'), false);
assert.equal(isPortalPath('/portal'), true);
assert.equal(isPortalPath('/portal/routes'), true);
assert.equal(isPortalPath('/about'), false);

assert.equal(canSubmitLead({ honeypot: '', turnstileToken: 'tok' }), true);
assert.equal(canSubmitLead({ honeypot: 'http://spam', turnstileToken: 'tok' }), false);
assert.equal(canSubmitLead({ honeypot: '', turnstileToken: null }), false);
assert.equal(canSubmitLead({ honeypot: '  ', turnstileToken: 'tok' }), true);

const dummy = '1x00000000000000000000AA';
assert.equal(getTurnstileSiteKey('0xREALKEY', false), '0xREALKEY');
assert.equal(getTurnstileSiteKey('', true), dummy);
assert.equal(getTurnstileSiteKey(undefined, true), dummy);

console.log('leadGuard spec passed');
