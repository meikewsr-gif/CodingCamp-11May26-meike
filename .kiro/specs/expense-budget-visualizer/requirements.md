# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application built with HTML, CSS, and Vanilla JavaScript. It allows users to track personal expenses by entering transactions with a name, amount, and category. All data is persisted in the browser's LocalStorage. The app displays a running total balance, a scrollable transaction list with delete capability, and a live pie chart showing spending distribution by category. The app requires no backend server, no build tools, and no complex setup — it runs directly in any modern browser or as a browser extension.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single expense entry consisting of an item name, a monetary amount, and a category.
- **Category**: One of three predefined spending labels: Food, Transport, or Fun.
- **Transaction_List**: The scrollable UI component that displays all stored transactions.
- **Input_Form**: The UI form component used to enter and submit new transactions.
- **Balance_Display**: The UI component at the top of the page that shows the total sum of all transaction amounts.
- **Pie_Chart**: The visual chart component that shows spending distribution broken down by category.
- **LocalStorage**: The browser's built-in client-side key-value storage API used to persist transaction data.
- **Validator**: The client-side logic responsible for checking that all required form fields are filled before submission.

---

## Requirements

### Requirement 1: Transaction Entry via Input Form

**User Story:** As a user, I want to enter an expense with a name, amount, and category, so that I can record my spending.

#### Acceptance Criteria

1. THE Input_Form SHALL display a text field for item name (maximum 100 characters), a numeric field for amount, and a dropdown selector for category containing exactly the options: Food, Transport, and Fun, plus a default placeholder option with no value selected.
2. WHEN the user submits the Input_Form with all fields filled, THE App SHALL create a new Transaction and add it to the Transaction_List.
3. WHEN the user submits the Input_Form, THE Validator SHALL verify that the item name field is not empty, the amount field contains a positive numeric value between 0.01 and 999,999.99 with at most 2 decimal places, and a category has been selected from the dropdown.
4. IF the Validator detects that any required field is empty or invalid, THEN THE Input_Form SHALL display a visible inline error message adjacent to each invalid field and SHALL NOT create a Transaction.
5. WHEN a Transaction is successfully added, THE Input_Form SHALL reset all fields to their default empty state, including resetting the category dropdown to the placeholder option.

---

### Requirement 2: Transaction List Display

**User Story:** As a user, I want to see all my recorded expenses in a list, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all stored Transactions in insertion order (oldest first), showing the item name, the amount formatted as a decimal number with exactly 2 decimal places, and the category for each entry.
2. WHEN the App loads, THE Transaction_List SHALL populate from LocalStorage and display all previously saved Transactions.
3. THE Transaction_List SHALL be scrollable when the number of entries exceeds the visible area of the component.
4. IF the Transaction_List contains no Transactions, THEN THE App SHALL display a message indicating that no expenses have been recorded yet.

---

### Requirement 3: Delete a Transaction

**User Story:** As a user, I want to delete an expense from the list, so that I can correct mistakes or remove unwanted entries.

#### Acceptance Criteria

1. THE Transaction_List SHALL display a clearly labelled delete control for each Transaction entry.
2. WHEN the user activates the delete control for a Transaction, THE App SHALL remove that Transaction from the Transaction_List and from LocalStorage immediately.
3. WHEN a Transaction is deleted, THE Balance_Display SHALL update immediately to reflect the new total.
4. WHEN a Transaction is deleted, THE Pie_Chart SHALL update immediately to reflect the new category distribution, removing the segment for any category that no longer has any Transactions.

---

### Requirement 4: Total Balance Display

**User Story:** As a user, I want to see my total spending at a glance, so that I can understand how much I have spent overall.

#### Acceptance Criteria

1. THE Balance_Display SHALL be visible at the top of the App at all times.
2. THE Balance_Display SHALL show the sum of the amounts of all current Transactions, formatted as a numeric value rounded to 2 decimal places.
3. WHEN a new Transaction is added, THE Balance_Display SHALL update immediately to reflect the new total.
4. WHEN a Transaction is deleted, THE Balance_Display SHALL update immediately to reflect the new total.
5. WHEN no Transactions exist, THE Balance_Display SHALL show a total of 0.00.

---

### Requirement 5: Spending Distribution Pie Chart

**User Story:** As a user, I want to see a visual breakdown of my spending by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE Pie_Chart SHALL display one segment per category that has at least one Transaction, where each segment's arc is proportional to that category's total amount divided by the sum of all Transaction amounts.
2. WHEN a new Transaction is added, THE Pie_Chart SHALL update automatically to reflect the new category distribution.
3. WHEN a Transaction is deleted and a category's total reaches zero, THE Pie_Chart SHALL remove that category's segment immediately.
4. THE Pie_Chart SHALL display a label or legend entry for each visible segment showing the category name and its percentage of total spending.
5. IF no Transactions exist, THEN THE Pie_Chart SHALL display a visible placeholder message indicating there is no data to visualize.

---

### Requirement 6: Data Persistence via LocalStorage

**User Story:** As a user, I want my expense data to be saved between sessions, so that I do not lose my records when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN a Transaction is created, THE App SHALL serialize and save the updated Transaction list to LocalStorage.
2. WHEN a Transaction is deleted, THE App SHALL serialize and save the updated Transaction list to LocalStorage.
3. WHEN the App loads, THE App SHALL deserialize and restore all Transactions from LocalStorage before rendering the Transaction_List, Balance_Display, and Pie_Chart.
4. IF LocalStorage contains no saved data on load, THEN THE App SHALL initialize with an empty Transaction list, display the no-expenses message in the Transaction_List, show 0.00 in the Balance_Display, and show the no-data placeholder in the Pie_Chart.
5. THE App SHALL serialize the Transaction list such that deserializing the stored value produces a list where every entry preserves its original item name, amount, and category without modification.
6. IF LocalStorage contains data that cannot be parsed as a valid Transaction list, THEN THE App SHALL discard the corrupt data, initialize with an empty Transaction list, and display the appropriate empty states.

---

### Requirement 7: Technical Constraints and Compatibility

**User Story:** As a developer, I want the app to run without a server or build tools, so that it can be deployed as a simple static file or browser extension.

#### Acceptance Criteria

1. THE App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no server-side runtime required.
2. THE App SHALL render all UI elements correctly and execute all interactions without errors or missing functionality in the latest stable release of Chrome, Firefox, Edge, and Safari at the time of testing.
3. THE App SHALL load and have its first interactive control enabled within 2 seconds on a connection of at least 25 Mbps.
4. THE App SHALL use exactly one CSS file located in a `css/` directory and exactly one JavaScript file located in a `js/` directory.
5. WHERE a charting library is used, THE App SHALL load it via a CDN `<script>` tag and SHALL NOT require a package manager or build step.
6. IF the charting library CDN fails to load, THEN THE App SHALL display a message indicating the chart is unavailable and SHALL continue rendering the Input_Form, Transaction_List, and Balance_Display without errors.

---

### Requirement 8: UI Simplicity and Visual Design

**User Story:** As a user, I want a clean and readable interface, so that I can use the app without confusion or visual clutter.

#### Acceptance Criteria

1. THE App SHALL present a clear visual hierarchy with the Balance_Display at the top, the Input_Form and Pie_Chart in a primary content area, and the Transaction_List below.
2. THE App SHALL use a minimum body font size of 16px and text-to-background color contrast ratios that meet WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text).
3. THE App SHALL provide a responsive layout such that on viewport widths from 320px to 1920px, no horizontal scrolling is required, no components overlap, and no content is clipped.
4. WHEN the user interacts with the Input_Form or delete controls, THE App SHALL apply a visible focus indicator on keyboard focus and a distinct hover state on pointer hover within 100ms of the interaction.
