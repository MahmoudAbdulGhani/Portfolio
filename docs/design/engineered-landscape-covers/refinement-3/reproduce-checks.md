Run from the repository root with the local read-only preview on port 5175. Browser submissions are intercepted by the tests.

```powershell
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:5175'
rtk npm run lint
rtk npm run typecheck
rtk npm run test:gallery
rtk npm run build
rtk proxy npx playwright test --workers=1
rtk proxy npx playwright install webkit
rtk proxy npx playwright test --config docs/design/engineered-landscape-covers/refinement-3/webkit.config.cjs
```

Both suites were run without automatic retries. The WebKit suite focuses on gallery and public interactions; the complete Chrome suite also covers Contact, selected views and AI contracts. Phone screenshots are Windows Chrome/WebKit engine captures at DPR 3, not physical-device verification.
