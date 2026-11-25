.PHONY: doctor test validate check audit

doctor:
	python3 scripts/doctor.py

validate:
	node scripts/validate-catalog.mjs

test:
	node --test tests/next-security-headers.test.mjs tests/security-release-audit.test.mjs scripts/check-cv-identity.mjs

audit:
	node scripts/forge-audit.mjs

check: audit test
