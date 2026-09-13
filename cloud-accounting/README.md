# Khata Cloud

A standalone cloud accounting app: double-entry ledgers, GST-ready sales
invoices and purchase bills, and live Trial Balance / Profit & Loss /
Balance Sheet reports. Independent of the restaurant app in this repo -
its own Vite project, its own Firestore collections.

## How it works

- **Auth**: Firebase Authentication (email/password). Signing up the
  first time creates an organisation for that user, seeded with a
  default chart of accounts (`src/lib/accounting.js`).
- **Data**: Firestore, scoped under `orgs/{orgId}/...` (`accounts`,
  `journalEntries`, `invoices`, `bills`). Every screen subscribes with
  `onSnapshot`, so any change shows up on every open device instantly -
  no manual sync/backup step.
- **Double-entry**: every transaction - manual journal entry, invoice,
  or bill - becomes one balanced journal entry (`validateJournalLines`
  enforces debit total == credit total before it's saved). Invoices and
  bills auto-post their entry (`buildInvoiceJournalLines` /
  `buildBillJournalLines`) so users never touch a debit/credit form
  unless they want to.
- **Reports**: computed on the client from the live journal entries -
  Trial Balance, date-ranged Profit & Loss, and an as-of-date Balance
  Sheet (`src/lib/accounting.js`).

## Run locally

```bash
npm install
npm run dev
```

Uses the same Firebase project as the restaurant app (the web API key
in `src/firebase.js` is a public client key, safe to ship) but writes
to its own `orgs` / `accountingUsers` collections, so the two products
never share data.

## Not in this first pass

- Inviting additional team members into an existing org (each signup
  currently gets its own single-owner org).
- Editing/voiding a posted invoice, bill, or journal entry.
- Exporting reports to PDF/Excel.
