# Implementation Tasks: Expense & Budget Visualizer

## Task Overview

These tasks implement the Expense & Budget Visualizer as a static, client-side web app (no build tools, no server). All tasks follow the architecture defined in the design document: one HTML file, one CSS file (`css/style.css`), and one JS file (`js/app.js`).

---

## Tasks

- [x] 1. Set up project file structure and HTML skeleton
  - Create `index.html` with the full HTML structure defined in the design document
  - Include the Chart.js 4.5 CDN `<script>` tag with `integrity` and `crossorigin` attributes
  - Include `<link>` to `css/style.css` and `<script defer>` for `js/app.js`
  - Add all required elements: `#balance-display`, `#expense-form`, `#item-name`, `#item-amount`, `#item-category`, `#name-error`, `#amount-error`, `#category-error`, `#pie-chart`, `#chart-placeholder`, `#chart-error`, `#transaction-list`, `#list-placeholder`
  - Add `aria-live="polite"` to all inline error `<span>` elements
  - Add `aria-label="Transaction list"` to `#transaction-list`
  - **Validates: Requirements 1.1, 7.1, 7.4, 7.5, 8.1**

- [x] 2. Implement CSS styles
  - Create `css/style.css` with all visual styles for the app
  - Implement layout: `#balance-display` at top, form and chart side-by-side in main content area, transaction list below
  - Set minimum body font size to 16px
  - Ensure text-to-background contrast ratios meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
  - Implement responsive layout that works from 320px to 1920px viewport width without horizontal scrolling, overlapping, or clipping
  - Style the form, inputs, dropdown, submit button, transaction list items, and delete buttons
  - Add visible `:focus` indicators and `:hover` states on interactive elements (form controls, delete buttons)
  - Style inline error messages (`.error-msg`) to be visually distinct
  - Make `#transaction-list` scrollable when content overflows
  - **Validates: Requirements 7.4, 8.1, 8.2, 8.3, 8.4**

- [x] 3. Implement storage layer (`loadFromStorage` and `saveToStorage`)
  - Create `js/app.js` with the module-level `transactions` array and the localStorage key constant
  - Implement `saveToStorage(transactions)`: serializes the array to JSON and writes to localStorage; catches `setItem` quota errors and shows a brief alert to the user
  - Implement `loadFromStorage()`: reads from localStorage; returns `[]` if key is absent; catches `JSON.parse` errors and returns `[]` with a `console.warn`; validates that the parsed value is an array where every element has `id` (string), `name` (non-empty string), `amount` (finite positive number), and `category` (one of `"Food"`, `"Transport"`, `"Fun"`); returns `[]` and discards data if validation fails
  - Implement `crypto.randomUUID()` fallback to `Date.now() + Math.random()` string for ID generation
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

- [-] 4. Implement form validation (`validateForm`)
  - Implement `validateForm(name, amount, category)` that returns `true` only when all three conditions hold: name is non-empty and not whitespace-only, amount is a finite number in [0.01, 999999.99] with at most 2 decimal places, and category is one of `"Food"`, `"Transport"`, `"Fun"`
  - When any field is invalid, set the text content of the corresponding error `<span>` (`#name-error`, `#amount-error`, `#category-error`) to a descriptive message
  - When a field is valid, clear its error `<span>`
  - **Validates: Requirements 1.3, 1.4**

- [~] 5. Implement transaction state mutations (`addTransaction` and `deleteTransaction`)
  - Implement `addTransaction(name, amount, category)`: generates a UUID (with fallback), creates a `Transaction` object, pushes it to the `transactions` array, calls `saveToStorage`, then calls `renderList`, `renderBalance`, and `renderChart`
  - Implement `deleteTransaction(id)`: filters the `transactions` array to remove the entry with the matching `id`, calls `saveToStorage`, then calls `renderList`, `renderBalance`, and `renderChart`
  - **Validates: Requirements 1.2, 3.2, 6.1, 6.2**

- [~] 6. Implement `renderList`
  - Implement `renderList(transactions)`: clears `#transaction-list` and rebuilds it from the input array
  - Each list item must show the transaction name, amount formatted to exactly 2 decimal places (e.g. `$12.50`), and category
  - Each list item must include a delete `<button>` with a clear label (e.g. "Delete") that calls `deleteTransaction(id)` on click
  - When the array is empty, hide `#transaction-list` and show `#list-placeholder`; when non-empty, show the list and hide the placeholder
  - Render entries in insertion order (index 0 first)
  - **Validates: Requirements 2.1, 2.4, 3.1**

- [ ] 7. Implement `renderBalance`
  - Implement `renderBalance(transactions)`: sums all `amount` fields, rounds to 2 decimal places, and writes the result to `#balance-display` (e.g. `Total: $45.50`)
  - When the array is empty, display `Total: $0.00`
  - **Validates: Requirements 4.1, 4.2, 4.5**

- [ ] 8. Implement `renderChart`
  - Implement `renderChart(transactions)`: checks `typeof Chart !== 'undefined'`; if Chart.js is absent, hides `#pie-chart` and shows `#chart-error`, then returns
  - When transactions is empty, destroy any existing chart instance, hide `#pie-chart`, hide `#chart-error`, and show `#chart-placeholder`
  - When transactions is non-empty, compute per-category totals (`Food`, `Transport`, `Fun`), filter to categories with total > 0, destroy any existing chart instance, create a new `Chart` on `#pie-chart` of type `"pie"` with the active category labels, data values, and a legend/tooltip showing category name and percentage of total
  - Store the chart instance in a module-level variable so it can be destroyed on the next render call
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 7.5, 7.6**

- [ ] 9. Implement `init` and wire up form submission
  - Implement `init()`: calls `loadFromStorage()` to populate the `transactions` array, then calls `renderList`, `renderBalance`, and `renderChart` with the loaded data
  - Wire the `#expense-form` `submit` event: call `event.preventDefault()`, read values from `#item-name`, `#item-amount`, `#item-category`, call `validateForm`; if valid, call `addTransaction` and reset the form; if invalid, do nothing further
  - Call `init()` inside a `DOMContentLoaded` listener
  - **Validates: Requirements 1.5, 2.2, 6.3, 6.4**

- [ ] 10. Write unit tests for storage, validation, and rendering
  - Set up a test environment (e.g. Vitest or Jest with jsdom) with a `package.json` and test script; install as dev dependencies only
  - Write unit tests covering:
    - `validateForm` accepts valid inputs and rejects each invalid case: empty name, whitespace-only name, amount = 0, amount = 1000000, amount with 3 decimal places, no category selected
    - `loadFromStorage` returns `[]` when key is absent
    - `loadFromStorage` returns `[]` and logs a warning when stored value is corrupt JSON
    - `loadFromStorage` returns `[]` when stored value is valid JSON but not an array of valid transactions
    - `renderBalance` displays `$0.00` when transaction list is empty
    - `renderList` shows `#list-placeholder` when transaction list is empty
    - `renderChart` shows `#chart-error` when `Chart` is not defined
  - **Validates: Requirements 1.3, 1.4, 6.4, 6.6, 4.5, 2.4, 7.6**

- [ ] 11. Write property-based test for Property 1: LocalStorage round-trip
  - Using fast-check, generate arbitrary arrays of valid `Transaction` objects
  - Call `saveToStorage` with the generated array, then call `loadFromStorage`
  - Assert deep equality between the original array and the loaded result (same length, same `id`, `name`, `amount`, `category` for every entry, in the same order)
  - Run with a minimum of 100 iterations
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.5, 2.2**

- [ ] 12. Write property-based test for Property 2: Balance equals sum
  - Using fast-check, generate arbitrary arrays of valid `Transaction` objects (including the empty array)
  - Compute the expected sum by summing all `amount` fields and rounding to 2 decimal places
  - Call `renderBalance` and read the displayed value from `#balance-display`
  - Assert the displayed value matches the expected sum; assert `$0.00` for the empty list
  - Run with a minimum of 100 iterations
  - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 3.3**

- [ ] 13. Write property-based test for Property 3: Validator rejects invalid inputs
  - Using fast-check, generate inputs where at least one field is invalid: whitespace-only names, amounts outside [0.01, 999999.99], amounts with more than 2 decimal places, and empty/missing category
  - Assert `validateForm` returns `false` for every generated invalid input
  - Run with a minimum of 100 iterations
  - **Validates: Requirements 1.3, 1.4**

- [ ] 14. Write property-based test for Property 4: Pie chart proportions and labels
  - Using fast-check, generate arbitrary non-empty arrays of valid `Transaction` objects
  - Compute expected per-category totals and each category's percentage of the total
  - Call `renderChart` and inspect the Chart.js instance's `data.datasets[0].data` and `data.labels`
  - Assert each active category's data value matches its total within floating-point tolerance, and each label contains the category name and its percentage
  - Run with a minimum of 100 iterations
  - **Validates: Requirements 5.1, 5.2, 5.4, 3.4**

- [ ] 15. Write property-based test for Property 5: Corrupt LocalStorage → empty state
  - Using fast-check, generate arbitrary strings (non-JSON, wrong-shape arrays, arrays with invalid entries)
  - Store each generated value directly in localStorage under the app's key
  - Call `loadFromStorage` and assert it returns `[]`
  - Run with a minimum of 100 iterations
  - **Validates: Requirements 6.4, 6.6**

- [ ] 16. Write property-based test for Property 6: Add then delete restores original list
  - Using fast-check, generate arbitrary initial `Transaction` arrays and a single valid new transaction
  - Set the module's `transactions` array to the initial list, call `addTransaction`, then call `deleteTransaction` with the new transaction's `id`
  - Assert the resulting `transactions` array is deeply equal to the original (same length, same entries, same order)
  - Run with a minimum of 100 iterations
  - **Validates: Requirements 1.2, 3.2**

- [ ] 17. Write property-based test for Property 7: Rendered list correctness
  - Using fast-check, generate arbitrary arrays of valid `Transaction` objects
  - Call `renderList` and query the resulting DOM
  - Assert the number of list items equals the number of transactions
  - Assert each item's displayed amount is formatted to exactly 2 decimal places
  - Assert each item contains a delete button
  - Assert items appear in the same order as the input array
  - Run with a minimum of 100 iterations
  - **Validates: Requirements 2.1, 3.1**
