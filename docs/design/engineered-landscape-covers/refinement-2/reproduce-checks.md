Run from the repository root with the local read-only preview already running on port 5175. All browser submissions are intercepted by the tests.

```powershell
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:5175'
rtk npm run lint
rtk npm run typecheck
rtk npm run test:gallery
rtk npm run test:landscape
rtk npm run build
rtk proxy npx playwright test --workers=1
rtk proxy npx playwright install webkit
rtk proxy npx playwright test --config docs/design/engineered-landscape-covers/refinement-2/webkit.config.cjs
```

WebKit installation affects the local browser cache, not application dependencies. Both runs used zero retries. Device screenshots are automated Windows Chrome/WebKit captures at DPR 3; physical phones are not verified.
