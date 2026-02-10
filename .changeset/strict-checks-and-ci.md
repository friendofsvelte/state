---
'@friendofsvelte/state': minor
---

Add strict runtime checks and CI/CD pipeline

- Validate key is non-empty string in constructor
- Handle corrupted storage data gracefully (falls back to initial value)
- Handle storage quota exceeded errors without throwing
- Add 20 comprehensive tests for PersistentState
- Set up GitHub Actions CI (lint, type-check, test, build)
- Set up automated releases with Changesets and OIDC trusted publishing
- Fix dependency vulnerabilities via npm audit fix
