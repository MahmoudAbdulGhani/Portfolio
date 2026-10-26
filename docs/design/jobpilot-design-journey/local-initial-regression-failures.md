# Initial local existing-regression failures

The 111-case dev-server run returned 106 passes and five failures. Capture/decoder processes overlapped part of this run. No deadlines or assertions were changed. A fresh isolated rerun and final-head CI determine the terminal result; these failures remain disclosed.

## collection-preview-Cedar-C-41694-ery-reviewed-size-fallback--chromium

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: collection-preview.spec.ts >> Cedar Construction: both complete previews and selectors follow the image at every reviewed size (fallback)
- Location: tests\e2e\collection-preview.spec.ts:61:5

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator: getByRole('button', { name: 'Explore Cedar Construction', exact: true })
Expected: focused
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeFocused" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Explore Cedar Construction', exact: true })

```

```yaml
- link "Skip to content":
  - /url: "#main-content"
- banner:
  - link "Portfolio, project collection":
    - /url: /
    - text: MA
  - navigation "Main navigation":
    - link "Collection":
      - /url: /
    - link "Projects":
      - /url: /projects
    - link "Profile":
      - /url: /profile
    - link "Contact":
      - /url: /contact
    - link "AI Job Match":
      - /url: /job-match
- main "Project collection":
  - 'button "Enlarge Cedar Construction: Construction portfolio overview"':
    - 'img "Construction Project Management & Accounting System: Construction portfolio overview"'
  - text: Tap to inspect
  - region "Selected project":
    - heading "Cedar Construction" [level=1]
    - paragraph: Project operations & accounting
    - text: Construction Project Management & Accounting System
    - group "Preview workflow":
      - button "Construction portfolio overview" [pressed]
      - button "Project details and operations"
    - group "Selected project navigation":
      - link "Open case study":
        - /url: /projects/construction-project-management-accounting-system
        - text: Open case study
        - img
      - link "Explore the engineering":
        - /url: /?project=construction-project-management-accounting-system#cedar-engineering
        - text: Explore the engineering
        - img
    - button "Collection":
      - img
      - text: Collection
  - region "Cedar calculation and interpretation":
    - heading "Calculated facts support the interpretation." [level=2]
    - paragraph: Engineering demonstration — fictional data.
    - list "Cedar demonstration progress":
      - listitem: Inspect
      - listitem: Interpret
      - listitem: Recalculate
    - paragraph: Fictional project · amounts in USD. Inspect the calculation, then reveal its explanation.
    - term: Contract value
    - definition: USD 100,000.00
    - term: Invoiced actual cost
    - definition: USD 40,000.00
    - paragraph: USD 25,000 supplier invoices + USD 15,000 contractor invoices = USD 40,000 actual cost.
    - text: Average phase progress
    - combobox "Average phase progress":
      - option "0% · no progress reported"
      - option "25%"
      - option "50%" [selected]
      - option "75%"
      - option "100%"
    - text: Percent complete · 0–100% Calculated total-cost estimate
    - strong: USD 80,000.00
    - paragraph: USD 40,000 ÷ 0.50 progress = USD 80,000.00
    - paragraph:
      - text: "Estimated margin:"
      - strong: 20.00%
      - text: · (contract − estimate) ÷ contract.
    - paragraph: Trend-based estimate, not a prediction.
    - heading "Sample interpretation" [level=3]
    - paragraph: Prewritten sample · reveal with Interpret
    - paragraph: The explanation reads the calculated figures. It cannot change them.
    - button "Interpret the figures"
    - button "Reset"
    - status
    - group: Source basis and demonstration limits
- contentinfo:
  - link "Collection":
    - /url: /
    - text: Collection
    - img
  - button "Ask Portfolio AI":
    - text: Ask Portfolio AI
    - img
```


## collection-preview-Cedar-C-41694-ery-reviewed-size-fallback--mobile-chromium

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: collection-preview.spec.ts >> Cedar Construction: both complete previews and selectors follow the image at every reviewed size (fallback)
- Location: tests\e2e\collection-preview.spec.ts:61:5

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('group', { name: 'Preview workflow' }).getByRole('button').nth(1)
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" with timeout 5000ms
  - waiting for getByRole('group', { name: 'Preview workflow' }).getByRole('button').nth(1)
    14 × locator resolved to <button aria-pressed="false">Project details and operations</button>
       - unexpected value "inactive"

```

```yaml
- button "Project details and operations"
```


## collection-preview-Cedar-C-98325-every-reviewed-size-normal--mobile-chromium

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: collection-preview.spec.ts >> Cedar Construction: both complete previews and selectors follow the image at every reviewed size (normal)
- Location: tests\e2e\collection-preview.spec.ts:61:5

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('group', { name: 'Preview workflow' }).getByRole('button').first()
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" with timeout 5000ms
  - waiting for getByRole('group', { name: 'Preview workflow' }).getByRole('button').first()
    5 × locator resolved to <button aria-pressed="true">Construction portfolio overview</button>
      - unexpected value "inactive"
    - waiting for "http://127.0.0.1:5173/?project=construction-project-management-accounting-system" navigation to finish...
    - navigated to "http://127.0.0.1:5173/?project=construction-project-management-accounting-system"
    4 × locator resolved to <button aria-pressed="true">Construction portfolio overview</button>
      - unexpected value "inactive"

```

```yaml
- button "Construction portfolio overview" [pressed]
```


## collection-preview-JobPilo-22796-every-reviewed-size-normal--chromium

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: collection-preview.spec.ts >> JobPilot AI: both complete previews and selectors follow the image at every reviewed size (normal)
- Location: tests\e2e\collection-preview.spec.ts:61:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.evaluate: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.selection-frame')
    - locator resolved to visible <div class="selection-frame">…</div>

```


## collection-readiness-an-in-578fe--before-a-late-notification-tablet-chromium

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: collection-readiness.spec.ts >> an initialized rig with a missing ready notification is disposed before a late notification
- Location: tests\e2e\collection-readiness.spec.ts:77:1

# Error details

```
Error: page.evaluate: Execution context was destroyed, most likely because of a navigation
```
