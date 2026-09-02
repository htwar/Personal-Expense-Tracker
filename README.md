# Ledger

Ledger is a responsive personal expense tracker for recording everyday spending, understanding category totals, and keeping a simple financial snapshot. It is a static web application built with HTML, CSS, and vanilla JavaScript.

## Features

- Add, edit, and delete expenses
- Track description, amount, category, and date
- View total spending, expense count, and average expense
- See category totals in a doughnut chart and spending rhythm list
- Filter by category or search by description
- Sort by date or amount
- Reject invalid expense amounts below `$0.01`
- Persist expenses in the browser with `localStorage`
- Responsive layout for desktop and mobile screens

## Quick start

No build step or package installation is required.

1. Clone the repository.
2. Open the project directory.
3. Open `index.html` in a browser.

For a local HTTP server, run:

```bash
python3 -m http.server 4173
```

Then visit [http://localhost:4173](http://localhost:4173).

## Usage

Select **Add expense**, enter the transaction details, and save it. Use the edit and delete controls on each row to manage existing expenses. The summary cards, category breakdown, and chart update automatically after every change.

Expense data is stored locally in the browser. It is not sent to a server and will be specific to the browser and device where it was entered. Use the reset control in the breakdown panel to restore the starter data.

## Technology

- HTML5
- CSS3 with responsive media queries
- Modern browser JavaScript
- [Chart.js](https://www.chartjs.org/) for the category chart
- [Lucide](https://lucide.dev/) for interface icons

Chart.js and Lucide are loaded from public CDNs at runtime, so an internet connection is required for the chart and icons when the app is opened for the first time.

## Project structure

```text
.
├── index.html   # Application markup and expense form
├── styles.css   # Layout, responsive styles, and visual design
├── app.js       # Expense state, calculations, filtering, sorting, and chart logic
└── README.md    # Project documentation
```

## Deployment

Because Ledger is a static site, it can be hosted on GitHub Pages or any static hosting provider. For GitHub Pages:

1. Open the repository's **Settings** page.
2. Select **Pages** under **Code and automation**.
3. Choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder.
5. Save the configuration and wait for the deployment to complete.

The generated Pages URL will appear in the repository's Pages settings.

## Browser support

Ledger requires a modern browser with support for ES6 JavaScript, `localStorage`, CSS Grid, and the HTML5 form validation API.
