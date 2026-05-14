# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer is a single-page, client-side web application delivered as a set of static files (one HTML, one CSS, one JS). It requires no server, no build step, and no package manager. The user opens `index.html` directly in a browser or installs it as a browser extension.

The app lets users record expense transactions (name, amount, category), view them in a scrollable list, see a running total balance, and visualize spending by category in a live pie chart. All data is persisted in `localStorage` so it survives page refreshes and browser restarts.

**Key design decisions:**

- **Chart.js 4.5 via CDN** — widely used, MIT-licensed, excellent pie chart support, loads from `cdnjs.com`. A graceful fallback message is shown if the CDN is unavailable.
- **Single JS module pattern** — all logic lives in `js/app.js`, organized into clearly separated concerns (storage, validation, rendering, chart) using plain functions and a single shared in-memory state array.
- **No frameworks** — keeps the dependency surface minimal and the file count exactly as required (one CSS, one JS).
- **UUID-style IDs via `crypto.randomUUID()`** — available in all modern browsers; used to uniquely identify transactions for deletion without relying on array indices.

---

## Architecture

The app follows a simple **unidirectional data flow**:

```
User Action
    │
    ▼
Validator (validate input)
    │
    ▼
State Mutation (add / delete from in-memory array)
    │
    ▼
Storage (serialize → localStorage)
    │
    ▼
Renderer (re-render list, balance, chart)
```

There is no virtual DOM, no reactive framework, and no event bus. Each user action calls a handler that mutates the shared `transactions` array, persists it, then calls the three render functions (`renderList`, `renderBalance`, `renderChart`). This is intentional: the app is small enough that full re-renders are cheap and the simplicity outweighs any optimization benefit.

### File Structure

```
index.html          ← single HTML entry point
css/
  style.css         ← all styles (exactly one CSS file)
js/
  app.js            ← all logic (exactly one JS file)
```

### Module Responsibilities (within `app.js`)

| Concern | Functions |
|---|---|
| State | `transactions` array (module-level) |
| Storage | `loadFromStorage()`, `saveToStorage()` |
| Validation | `validateForm()` |
| Transactions | `addTransaction()`, `deleteTransaction()` |
| Rendering | `renderList()`, `renderBalance()`, `renderChart()` |
| Bootstrap | `init()` (called on `DOMContentLoaded`) |

---

## Components and Interfaces

### HTML Structure

```
<body>
  <header>
    <h1>Expense & Budget Visualizer</h1>
    <div id="balance-display">Total: $0.00</div>
  </header>

  <main>
    <section id="form-section">
      <form id="expense-form">
        <input id="item-name" type="text" maxlength="100" />
        <span id="name-error" class="error-msg" aria-live="polite"></span>

        <input id="item-amount" type="number" step="0.01" min="0.01" max="999999.99" />
        <span id="amount-error" class="error-msg" aria-live="polite"></span>

        <select id="item-category">
          <option value="">-- Select category --</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Fun">Fun</option>
        </select>
        <span id="category-error" class="error-msg" aria-live="polite"></span>

        <button type="submit">Add Expense</button>
      </form>
    </section>

    <section id="chart-section">
      <canvas id="pie-chart"></canvas>
      <p id="chart-placeholder" hidden>No data to visualize yet.</p>
      <p id="chart-error" hidden>Chart unavailable (CDN failed to load).</p>
    </section>
  </main>

  <section id="list-section">
    <ul id="transaction-list" aria-label="Transaction list"></ul>
    <p id="list-placeholder" hidden>No expenses recorded yet.</p>
  </section>
```

### JavaScript Public Interface (within `app.js`)

All functions are module-scoped (not exported). The public surface is the DOM event listeners wired in `init()`.

```js
// Called once on DOMContentLoaded
function init(): void

// Storage layer
function loadFromStorage(): Transaction[]
function saveToStorage(transactions: Transaction[]): void

// Validation — returns true if valid, sets inline error messages if not
function validateForm(name: string, amount: string, category: string): boolean

// State mutations — each calls saveToStorage + all three render functions
function addTransaction(name: string, amount: number, category: string): void
function deleteTransaction(id: string): void

// Render functions — pure DOM writes, no side effects on state
function renderList(transactions: Transaction[]): void
function renderBalance(transactions: Transaction[]): void
function renderChart(transactions: Transaction[]): void
```

### Chart.js Integration

Chart.js is loaded via CDN before `app.js`:

```html
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.0/chart.umd.min.js"
  integrity="sha512-..."
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
></script>
<script src="js/app.js" defer></script>
```

`renderChart()` checks `typeof Chart !== 'undefined'` before attempting to render. If Chart.js is absent, it hides the `<canvas>` and shows `#chart-error`. The chart instance is stored in a module-level variable so it can be `.destroy()`ed and recreated on each update (Chart.js requirement for data changes).

---

## Data Models

### Transaction Object

```js
/**
 * @typedef {Object} Transaction
 * @property {string} id        - UUID generated by crypto.randomUUID()
 * @property {string} name      - Item name, 1–100 characters
 * @property {number} amount    - Positive number, max 2 decimal places, 0.01–999999.99
 * @property {string} category  - One of: "Food" | "Transport" | "Fun"
 */
```

### LocalStorage Schema

- **Key**: `"expense-budget-visualizer-transactions"`
- **Value**: JSON-serialized array of `Transaction` objects

```json
[
  { "id": "a1b2c3d4-...", "name": "Lunch", "amount": 12.50, "category": "Food" },
  { "id": "e5f6g7h8-...", "name": "Bus pass", "amount": 45.00, "category": "Transport" }
]
```

**Validation on load**: After `JSON.parse()`, the app checks that the result is an array and that each element has `id` (string), `name` (non-empty string), `amount` (finite positive number), and `category` (one of the three valid values). Any parse error or structural mismatch causes the entire stored value to be discarded and replaced with `[]`.

### In-Memory State

```js
// Module-level mutable array — single source of truth at runtime
let transactions = []; // Transaction[]
```

### Category Aggregation (for chart)

```js
// Computed on demand inside renderChart(), never stored
const totals = { Food: 0, Transport: 0, Fun: 0 };
transactions.forEach(t => { totals[t.category] += t.amount; });
const activeCategories = Object.entries(totals).filter(([, v]) => v > 0);
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: LocalStorage round-trip preserves all transaction fields

*For any* list of valid transactions that is serialized and saved to LocalStorage, deserializing the stored value must produce a list where every entry has the same `id`, `name`, `amount`, and `category` as the original, in the same order.

**Validates: Requirements 6.1, 6.2, 6.3, 6.5, 2.2**

---

### Property 2: Balance equals sum of all transaction amounts

*For any* list of transactions (including the empty list), the value produced by `renderBalance` must equal the arithmetic sum of all `amount` fields rounded to 2 decimal places, and must equal `0.00` when the list is empty.

**Validates: Requirements 4.2, 4.3, 4.4, 4.5, 3.3**

---

### Property 3: Validator rejects all invalid inputs

*For any* combination of inputs where at least one of the following is true — the name is empty or composed entirely of whitespace, the amount is outside [0.01, 999999.99] or has more than 2 decimal places, or no category is selected — the validator must return false and must not create a transaction.

**Validates: Requirements 1.3, 1.4**

---

### Property 4: Pie chart segment proportions and labels are correct

*For any* non-empty list of transactions, each category's chart data value must be proportional to that category's total amount divided by the sum of all transaction amounts (within floating-point tolerance), and each visible segment must have a label containing the category name and its percentage of total spending.

**Validates: Requirements 5.1, 5.2, 5.4, 3.4**

---

### Property 5: Corrupt or absent LocalStorage initializes to empty state

*For any* value stored in LocalStorage that is absent, non-JSON, or structurally invalid (not an array of well-formed transaction objects), `loadFromStorage` must return an empty array.

**Validates: Requirements 6.4, 6.6**

---

### Property 6: Add then delete restores original list

*For any* initial transaction list and any valid new transaction, adding the transaction and then deleting it by its `id` must produce a list that is identical to the original (same length, same entries in the same order).

**Validates: Requirements 1.2, 3.2**

---

### Property 7: Rendered list preserves insertion order, formatting, and delete controls

*For any* list of transactions, `renderList` must produce DOM entries in the same order as the input array, display each amount formatted to exactly 2 decimal places, and include a delete control for every entry.

**Validates: Requirements 2.1, 3.1**

---

## Error Handling

| Scenario | Handling |
|---|---|
| Form submitted with empty name | Inline error shown next to name field; form not submitted |
| Form submitted with invalid amount | Inline error shown next to amount field; form not submitted |
| Form submitted with no category selected | Inline error shown next to category field; form not submitted |
| LocalStorage `getItem` returns `null` | Initialize with `[]`; no error shown to user |
| `JSON.parse` throws on stored data | Catch exception, discard data, initialize with `[]`, log warning to console |
| Stored data is valid JSON but wrong shape | Structural validation fails, discard data, initialize with `[]` |
| Chart.js CDN fails to load | `typeof Chart === 'undefined'`; hide canvas, show `#chart-error` message |
| `localStorage.setItem` throws (storage quota exceeded) | Catch exception, show a brief toast/alert to user that saving failed |
| `crypto.randomUUID` unavailable (very old browser) | Fallback to `Date.now() + Math.random()` string as ID |

---

## Testing Strategy

### Unit Tests (example-based)

Focus on specific behaviors with concrete inputs:

- Validator accepts valid inputs and rejects each invalid case (empty name, whitespace name, amount = 0, amount = 1000000, amount with 3 decimal places, no category selected)
- `loadFromStorage` returns `[]` when key is absent
- `loadFromStorage` returns `[]` and logs a warning when stored value is corrupt JSON
- `loadFromStorage` returns `[]` when stored value is valid JSON but not an array of valid transactions
- `renderBalance` displays `0.00` when transaction list is empty
- `renderList` shows the placeholder message when transaction list is empty
- `renderChart` shows the chart-error message when Chart.js is not loaded

### Property-Based Tests

Use [fast-check](https://github.com/dubzzz/fast-check) (loaded via CDN or npm for test environment) with a minimum of **100 iterations per property**.

Each test is tagged with the property it validates:

- **Feature: expense-budget-visualizer, Property 1: LocalStorage round-trip** — Generate arbitrary arrays of valid transactions → `saveToStorage` → `loadFromStorage` → assert deep equality with original
- **Feature: expense-budget-visualizer, Property 2: Balance equals sum** — Generate arbitrary arrays of valid transactions → compute expected sum → assert `renderBalance` output matches (including empty list → `0.00`)
- **Feature: expense-budget-visualizer, Property 3: Validator rejects invalid inputs** — Generate whitespace-only names, out-of-range amounts, amounts with >2 decimal places, missing categories → assert `validateForm` returns false for all
- **Feature: expense-budget-visualizer, Property 4: Pie chart proportions and labels** — Generate arbitrary non-empty transaction lists → compute expected category totals → assert chart dataset values and labels match within floating-point tolerance
- **Feature: expense-budget-visualizer, Property 5: Corrupt LocalStorage → empty state** — Generate arbitrary strings (non-JSON, wrong-shape arrays, arrays with invalid entries) → store in localStorage → assert `loadFromStorage` returns `[]`
- **Feature: expense-budget-visualizer, Property 6: Add then delete restores original list** — Generate arbitrary transaction lists and a valid new transaction → `addTransaction` → `deleteTransaction` with new id → assert list equals original
- **Feature: expense-budget-visualizer, Property 7: Rendered list correctness** — Generate arbitrary transaction arrays → `renderList` → assert DOM entries match input order, amounts are formatted to 2 decimal places, and each entry has a delete button

### Integration / Smoke Tests

- App loads in Chrome, Firefox, Edge, Safari without console errors
- All UI components render on first load with empty LocalStorage
- Full add → verify list → verify balance → verify chart → delete → verify all three update cycle
- CDN failure simulation: block Chart.js URL → verify fallback message appears and rest of app functions
