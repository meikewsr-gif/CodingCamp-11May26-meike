/**
 * Expense & Budget Visualizer — application logic
 *
 * Module structure:
 *   - Constants & state
 *   - Storage layer      (Task 3)  ← implemented here
 *   - Validation         (Task 4)
 *   - State mutations    (Task 5)
 *   - Rendering          (Tasks 6–8)
 *   - Bootstrap / init   (Task 9)
 */

// ---------------------------------------------------------------------------
// Constants & module-level state
// ---------------------------------------------------------------------------

/** @type {string} LocalStorage key for persisted transactions */
const STORAGE_KEY = 'expense-budget-visualizer-transactions';

/** @type {string[]} Valid category values */
const VALID_CATEGORIES = ['Food', 'Transport', 'Fun'];

/**
 * In-memory transaction list — single source of truth at runtime.
 * @type {Array<{id: string, name: string, amount: number, category: string}>}
 */
let transactions = [];

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

/**
 * Generates a unique ID string.
 * Uses `crypto.randomUUID()` when available; falls back to a
 * `Date.now() + Math.random()` string for older browsers.
 *
 * @returns {string}
 */
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random fraction, stripped of the leading "0."
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}

// ---------------------------------------------------------------------------
// Storage layer
// ---------------------------------------------------------------------------

/**
 * Validates that a parsed value is a well-formed array of Transaction objects.
 *
 * Each element must have:
 *   - id       : non-empty string
 *   - name     : non-empty string
 *   - amount   : finite positive number
 *   - category : one of "Food" | "Transport" | "Fun"
 *
 * @param {unknown} data
 * @returns {boolean}
 */
function isValidTransactionArray(data) {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      item.id.length > 0 &&
      typeof item.name === 'string' &&
      item.name.trim().length > 0 &&
      typeof item.amount === 'number' &&
      Number.isFinite(item.amount) &&
      item.amount > 0 &&
      VALID_CATEGORIES.includes(item.category)
  );
}

/**
 * Serializes the transaction array to JSON and writes it to localStorage.
 * If the write fails (e.g. storage quota exceeded), shows a brief alert.
 *
 * @param {Array<{id: string, name: string, amount: number, category: string}>} transactions
 * @returns {void}
 */
function saveToStorage(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    // QuotaExceededError or similar — inform the user without crashing
    alert('Unable to save your data: storage quota exceeded. Please delete some entries to free up space.');
  }
}

/**
 * Reads and deserializes the transaction array from localStorage.
 *
 * Returns `[]` when:
 *   - the key is absent
 *   - the stored value cannot be parsed as JSON (logs a console warning)
 *   - the parsed value is not a valid array of Transaction objects
 *
 * @returns {Array<{id: string, name: string, amount: number, category: string}>}
 */
function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);

  // Key absent — fresh start
  if (raw === null) {
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.warn(
      '[expense-budget-visualizer] Failed to parse stored transaction data; initializing with empty list.',
      err
    );
    return [];
  }

  // Structural validation — discard anything that doesn't match the schema
  if (!isValidTransactionArray(parsed)) {
    return [];
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates the expense form fields and sets inline error messages.
 *
 * Rules:
 *   - name     : non-empty after trimming whitespace
 *   - amount   : finite number in [0.01, 999999.99] with at most 2 decimal places
 *   - category : one of "Food" | "Transport" | "Fun"
 *
 * Side effects: sets or clears the textContent of #name-error, #amount-error,
 * and #category-error spans in the DOM.
 *
 * @param {string} name      - Raw value from the item-name input
 * @param {string} amount    - Raw value from the item-amount input (string from DOM)
 * @param {string} category  - Raw value from the item-category select
 * @returns {boolean}        - true only when all three fields are valid
 */
function validateForm(name, amount, category) {
  const nameError     = document.getElementById('name-error');
  const amountError   = document.getElementById('amount-error');
  const categoryError = document.getElementById('category-error');

  let valid = true;

  // --- Name validation ---
  if (typeof name !== 'string' || name.trim().length === 0) {
    nameError.textContent = 'Item name is required.';
    valid = false;
  } else {
    nameError.textContent = '';
  }

  // --- Amount validation ---
  const amountNum = parseFloat(amount);
  const amountStr = String(amount).trim();

  // Check for more than 2 decimal places using string inspection
  const decimalMatch = amountStr.match(/\.(\d+)$/);
  const tooManyDecimals = decimalMatch !== null && decimalMatch[1].length > 2;

  if (
    amountStr === '' ||
    isNaN(amountNum) ||
    !Number.isFinite(amountNum) ||
    amountNum < 0.01 ||
    amountNum > 999999.99 ||
    tooManyDecimals
  ) {
    amountError.textContent = 'Amount must be a number between 0.01 and 999,999.99 with at most 2 decimal places.';
    valid = false;
  } else {
    amountError.textContent = '';
  }

  // --- Category validation ---
  if (!VALID_CATEGORIES.includes(category)) {
    categoryError.textContent = 'Please select a category (Food, Transport, or Fun).';
    valid = false;
  } else {
    categoryError.textContent = '';
  }

  return valid;
}

// ---------------------------------------------------------------------------
// State mutations    — implemented in Task 5
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Rendering          — implemented in Tasks 6–8
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Bootstrap          — implemented in Task 9
// ---------------------------------------------------------------------------
