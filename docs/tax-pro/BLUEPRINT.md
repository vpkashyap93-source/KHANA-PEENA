# TaxDesk — टैक्स प्रोफेशनल के लिए अकाउंटिंग सॉफ्टवेयर (Blueprint)

> Status: Blueprint v1 (research + design plan). Code अभी नहीं लिखा है।
> हर Phase के लिए command दें, जैसे "Phase 1 बनाओ"। उसी हिसाब से काम आगे बढ़ेगा।

---

## 1. Research: बाज़ार में क्या है और हम क्या लेंगे

भारत में CA / Tax Practitioner के लिए बनी software जैसे Turia, QwikCA, Practive, Bizalys, PracticeStacks, और general accounting के लिए Tally, Zoho Books, Vyapar देखे। इनमें से:

| इनमें आम तौर पर होता है | हम क्या लेंगे |
|---|---|
| Retainer clients के लिए recurring GST invoice (SAC code, CGST/SGST/IGST) | ✅ हाँ, यह हमारा core है |
| GST / TDS / ITR के due dates वाला compliance calendar | ✅ Simple version (built-in due dates) |
| WhatsApp / Email reminder | ✅ WhatsApp पर one-click reminder |
| Office में visitor check-in | 🔁 इसे उल्टा करेंगे: **हम client के पास कब गए** (Visit Log) |
| Task management, staff timesheet, DSC register, document vault | ❌ अभी नहीं। Software हल्का रखना है |
| Full inventory, POS, manufacturing | ❌ ज़रूरत नहीं |

**हमारा फर्क:** दूसरी software या तो बहुत भारी हैं (पूरी CA firm के लिए) या सिर्फ accounting वाली हैं। TaxDesk में सिर्फ ये चीज़ें होंगी: **Monthly bill + Payment reminder + Client visit + आसान entry + Schedule III Balance Sheet**, और साथ में premium dashboard।

---

## 2. Design के नियम

1. **रोज़ के काम में 3 click से ज़्यादा न लगें।** Bill बनाना, पेमेंट लेना, visit mark करना, सब dashboard से ही हो जाए।
2. **Accounting की भाषा छुपी रहे।** User "पैसा आया / पैसा गया / खर्चा" चुने, Debit/Credit software अपने आप लगाए।
3. **Premium, professional look.** Plain form-table वाला look नहीं होगा (Section 6 देखें)।
4. **Cloud-first.** हर user का अपना login, और सारा data cloud पर रहेगा।
5. **हल्का।** Mobile और laptop दोनों पर तेज़ चले, और desktop पर app की तरह install हो सके (PWA)।

---

## 3. Modules (क्या-क्या होगा)

### 3.1 Login और Firm Profile
- Email/Password और Google login (Firebase Auth)
- हर user का data अलग रहेगा (`firms/{uid}/...`), कोई दूसरा user उसे नहीं देख सकता
- Firm profile: नाम, logo, PAN, GSTIN (optional), address, bank details, UPI ID (bill पर QR के लिए), signature
- GST registered है या नहीं, यह toggle। Registered नहीं है तो **Bill of Supply** बनेगा, है तो **Tax Invoice**

### 3.2 Clients (Client Master)
| Field | उदाहरण |
|---|---|
| नाम, contact person, mobile, email | |
| PAN, GSTIN, State | GSTIN से state अपने आप भर जाएगा (CGST+SGST या IGST तय करने के लिए) |
| Services | GST Return, ITR, TDS, Accounting, Audit (multi-select) |
| **Monthly fee** | ₹3,000 |
| **Billing day** | हर महीने की 1 तारीख |
| **Visit frequency** | हर 15 दिन / महीने में 1 बार / ज़रूरत पर |
| Opening balance | पिछला बकाया |
| Status | Active / Inactive |

Client page पर एक नज़र में दिखेगा: बकाया, last visit, next visit, पिछले 12 महीने के bill और receipt।

### 3.3 Billing — Auto (Recurring) + Manual ⭐
**A) Auto / Recurring bill (हर महीने एक जैसे bill)**
- हर client पर "Monthly fee" और service description एक बार सेट करें
- हर महीने की billing date पर dashboard पर card दिखेगा: *"सितंबर 2026 के 24 bill तैयार हैं। Review करें"*
- एक click में सारे bill **Draft** बनेंगे, फिर review करके **Finalize** करें (ज़रूरत हो तो किसी एक bill की amount बदल लें)
- Option: "Auto-finalize" चालू हो तो review के बिना सीधे final हो जाएँगे

**B) Manual bill**
- कभी-कभार के काम के लिए (ITR filing, audit fee, registration वगैरह)
- Client चुनें, service चुनें (list से या खुद लिखें), amount डालें, GST अपने आप लगेगा

**Bill में क्या होगा**
- Invoice number series (जैसे `TD/26-27/0001`), financial year बदलने पर नंबर फिर 1 से
- SAC code अपने आप: 998231 (Corporate tax consulting), 998232 (Individual tax preparation), 998222 (Accounting & bookkeeping), 998221 (Audit)
- GST 18%, और client की state के हिसाब से CGST+SGST या IGST
- बिल पर UPI QR code, ताकि client तुरंत pay कर सके
- PDF download और **WhatsApp पर भेजें** (एक button से)

### 3.4 Receipts (पेमेंट आई)
- Client चुनें, amount डालें, mode चुनें (Cash / UPI / Bank / Cheque)
- **TDS कटा?** Toggle करने पर client ने जो 10% (Sec 194J) काटा है, वह "TDS Receivable" में जाएगा और client का पूरा बकाया clear हो जाएगा
- Payment पहले FIFO से पुराने bill के against adjust होगा, ज़रूरत हो तो manual भी कर सकते हैं

### 3.5 Payment Reminder (रोज़ का) ⭐
- **Daily Reminder Panel:** सुबह login करते ही सबसे ऊपर दिखेगा
  - 🔴 **लेना है:** किस client से कितना बकाया है, कितने दिन से (0–30 / 31–60 / 60+ दिन)
  - 🟠 **देना है:** हमें जिन्हें pay करना है (rent, staff salary, software subscription, vendors), due date के साथ
- हर row पर **"WhatsApp Reminder"** button होगा, जो पहले से लिखा polite message खोल देगा:
  > "नमस्ते {Client}, आपका ₹{amount} का बिल ({month}) बकाया है। UPI: {upi_id}. धन्यवाद, {Firm}"
- "Snooze", यानी 3 दिन बाद फिर याद दिलाना
- Phase 2 में: browser push notification और daily email digest

### 3.6 Visit Log और Schedule (Client Attendance Chart) ⭐
**Visit mark करना:** Client card पर **"✓ आज गया"** button होगा। दबाने पर date, time, purpose (GST data लेना / documents / meeting) और notes save होंगे। Location (GPS) optional है।

**Attendance Chart:**
- हर client के लिए **calendar heatmap**, जैसे GitHub contribution chart। जिस दिन visit हुई, वह box रंगीन होगा
- **Visit Register view:** सारे clients की rows और महीने की तारीखें columns में, बिलकुल attendance register जैसा
- हर client पर **"Last visit: 12 दिन पहले"** दिखेगा, और visit frequency से ज़्यादा दिन हो जाएँ तो लाल रंग

**Schedule:**
- Next visit plan करें (date और purpose)। Visit frequency के हिसाब से software अपने आप अगली date suggest करेगा
- Dashboard पर **"आज के visits"** और **"इस हफ्ते के visits"**
- Calendar view में visits और compliance due dates एक साथ दिखेंगी

### 3.7 Compliance Calendar (हल्का version)
Built-in due dates (हर client की services के हिसाब से):
| Compliance | Due date |
|---|---|
| TDS payment | हर महीने की 7 तारीख |
| GSTR-1 | 11 तारीख (QRMP में quarterly 13) |
| GSTR-3B | 20 तारीख (QRMP में 22/24) |
| TDS Return | 31 Jul / 31 Oct / 31 Jan / 31 May |
| Advance Tax | 15 Jun / 15 Sep / 15 Dec / 15 Mar |
| ITR (non-audit) | 31 July |
| Tax Audit Report | 30 September |
| ITR (audit) | 31 October |

Dates सरकार बढ़ा देती है, इसलिए हर date user खुद भी बदल सकेगा। Client के सामने ✓ Done mark करने की सुविधा होगी।

### 3.8 आसान Journal Entry ⭐
Voucher type की जगह 4 बड़े buttons होंगे:

| Button | अंदर क्या होगा |
|---|---|
| 💰 **पैसा आया** | Receipt (Bank/Cash Dr, Party/Income Cr) |
| 💸 **पैसा गया** | Payment (Party/Expense Dr, Bank/Cash Cr) |
| 🧾 **खर्चा** | Expense (Rent, Salary, Electricity...), जिसमें Cash या Bank चुनना है |
| 🔁 **Journal** | Advanced users के लिए normal Dr/Cr entry, जिसमें Dr = Cr check अपने आप होगा |

- हर entry सिर्फ एक line की form होगी: Date, Account, Amount, Narration
- Keyboard shortcuts: `Alt+R` receipt, `Alt+P` payment, `Alt+E` expense
- पीछे पूरा double-entry system चलेगा, इसलिए ledger, trial balance और balance sheet हमेशा सही रहेंगे

### 3.9 Books और Reports
- Ledger (किसी भी account का), Cash Book, Bank Book
- Day Book (आज की सारी entries)
- Trial Balance
- **Profit & Loss** — Schedule III format
- **Balance Sheet — Schedule III (Division I, 2021 amendment के बाद वाला)** ⭐
- Outstanding / Ageing report
- Client-wise revenue, Month-wise revenue
- अपना GST summary (Output GST, GSTR-1 के लिए B2B/B2C)
- सब कुछ **PDF और Excel** में export होगा

### 3.10 Balance Sheet — New Schedule III format
Vertical format होगा, जिसमें Note No., Current Year और Previous Year columns होंगे:

```
                                          Note   31-03-2027   31-03-2026
I.  EQUITY AND LIABILITIES
    (1) Shareholders' Funds / Capital Account
        (a) Share Capital / Proprietor's Capital   1
        (b) Reserves and Surplus                   2
    (2) Non-Current Liabilities
        (a) Long-term Borrowings                   3
        (b) Long-term Provisions                   4
    (3) Current Liabilities
        (a) Short-term Borrowings *                5
        (b) Trade Payables                         6
            - total outstanding dues of MSME
            - total outstanding dues of others
        (c) Other Current Liabilities              7
        (d) Short-term Provisions                  8
                                      TOTAL
II. ASSETS
    (1) Non-Current Assets
        (a) Property, Plant & Equipment and
            Intangible Assets                      9
            (i)  Property, Plant and Equipment
            (ii) Intangible Assets
        (b) Non-current Investments               10
        (c) Long-term Loans and Advances          11
    (2) Current Assets
        (a) Current Investments                   12
        (b) Trade Receivables **                  13
        (c) Cash and Cash Equivalents             14
        (d) Short-term Loans and Advances         15
        (e) Other Current Assets (TDS Receivable) 16
                                      TOTAL
```
\* 2021 amendment: "Current maturities of long-term borrowings" अब Short-term Borrowings में अलग दिखाई जाएगी।
\** Trade Receivables और Payables का **ageing schedule** notes में अपने आप बनेगा (2021 amendment की requirement)।

**कैसे बनेगी:** हर ledger account बनाते समय उसका **Group** चुनेंगे (जैसे "Trade Receivables", "Cash & Cash Equivalents")। हर group पहले से Schedule III के किसी head से जुड़ा होगा, इसलिए balance sheet एक click में बन जाएगी, notes के साथ। Proprietor / partnership firm के लिए "Share Capital" की जगह "Capital Account" आएगा।

---

## 4. Dashboard Layout (Premium)

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│          │  शुभ प्रभात, Rahul 👋            [🔍 Search client…]  [+ New ▾]│
│  TaxDesk │  मंगलवार, 22 सितंबर 2026                                       │
│          ├──────────────────────────────────────────────────────────────┤
│ ◉ Dashboard│ ┌────────────┐┌────────────┐┌────────────┐┌────────────┐   │
│ ○ Clients│  │ इस महीने बिल ││ Collection ││ बकाया       ││ आज के visit │   │
│ ○ Billing│  │ ₹1,24,000  ││ ₹86,500    ││ ₹2,41,300  ││ 3          │   │
│ ○ Receipts│ │ ▲ 8% vs Aug││ 70% ━━━━░░ ││ 18 clients ││ 2 overdue  │   │
│ ○ Visits │  └────────────┘└────────────┘└────────────┘└────────────┘   │
│ ○ Calendar│ ┌──────────────────────────────┐┌──────────────────────────┐│
│ ○ Entries│  │ ⚡ आज के Reminder             ││ 📈 Revenue (12 महीने)     ││
│ ○ Reports│  │ 🔴 लेना: Sharma Traders ₹9k   ││   bar + line chart       ││
│          │  │ 🔴 लेना: Gupta & Co   ₹12k   ││   Billed vs Collected    ││
│ ─────────│  │ 🟠 देना: Office Rent  ₹15k   ││                          ││
│ ⚙ Settings│ │           [WhatsApp ↗]       ││                          ││
│          │  └──────────────────────────────┘└──────────────────────────┘│
│ [Plan: Pro]│ ┌──────────────────────────────┐┌──────────────────────────┐│
│          │  │ 📍 Visit Schedule             ││ 📅 आने वाली Due Dates     ││
│          │  │ आज: Verma Textiles (GST data) ││ 07 Oct TDS Payment       ││
│          │  │ Overdue: Jain Stores 32 दिन   ││ 11 Oct GSTR-1 (14)       ││
│          │  └──────────────────────────────┘└──────────────────────────┘│
│          │  ┌─────────────────────────────────────────────────────────┐ │
│          │  │ 🧾 Monthly bills तैयार: सितंबर के 24 bill [Review →]      │ │
│          │  └─────────────────────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────────────────┘
```

Visual mockup: [`dashboard-mockup.html`](./dashboard-mockup.html) (browser में खोलें)

---

## 5. "Normal entry जैसा न दिखे": क्या अलग करेंगे

पिछली software form-table जैसी लग रही थी। इस बार ये बदलाव होंगे:

| पहले (plain) | अब (premium) |
|---|---|
| सफ़ेद background पर सीधे table | Soft gradient background, उस पर **cards** जिनमें हल्की shadow और rounded corners (16px) |
| हर चीज़ एक जैसे font में | **Inter** font, बड़े KPI numbers, tabular digits, और साफ़ hierarchy (heading / label / value) |
| रंग बेतरतीब | **एक theme:** Deep navy sidebar (#0B1437), Indigo accent (#4F46E5), Emerald = पैसा आया, Rose = बकाया, Amber = due |
| सिर्फ numbers | **Charts:** revenue trend, collection progress ring, visit heatmap |
| बड़े forms | **Side drawer / modal** forms, जिनमें एक बार में कम fields |
| सिर्फ light | Light + **Dark mode** |
| Icons नहीं | हर menu और card पर एक जैसे line icons (Lucide) |
| Empty screen | Empty state illustration और "पहला client जोड़ें" button |
| Loading पर blank | Skeleton shimmer loaders |

---

## 6. Design System
- **Font:** Inter (UI), Noto Sans Devanagari (Hindi text)
- **Colors:**
  - Sidebar: `#0B1437` → `#111C44` gradient
  - Primary: Indigo `#4F46E5`
  - Success (received): Emerald `#10B981`
  - Danger (due/overdue): Rose `#F43F5E`
  - Warning (upcoming): Amber `#F59E0B`
  - Background: `#F4F7FE`, Cards: `#FFFFFF`
- **Spacing:** 8px grid; card padding 20–24px; radius 16px
- **Numbers:** ₹ Indian format (`1,24,000`), `font-variant-numeric: tabular-nums`
- **Language:** Hindi + English labels (toggle)

---

## 7. Technical Plan
- **Frontend:** React + Vite (इस repo में पहले से है)। नया app `tax-pro/` folder में बनेगा ताकि Khana-Peena वाला app न छुए
- **Backend / Cloud:** Firebase: Auth (login), Firestore (data), Hosting। Cloud Functions सिर्फ daily reminder email के लिए (Phase 2)
- **PWA:** Desktop और mobile पर "Install app"। Internet न हो तो भी देख सकें, data बाद में sync हो जाएगा
- **PDF:** jsPDF (invoice, balance sheet); **Excel:** xlsx
- **Security:** Firestore rules, ताकि हर user सिर्फ `firms/{उसका uid}` पढ़/लिख सके

### Data Model (Firestore)
```
firms/{uid}                       → firm profile, settings, invoice series
firms/{uid}/clients/{id}          → name, pan, gstin, state, services[], monthlyFee,
                                    billingDay, visitEveryDays, openingBal, active
firms/{uid}/accounts/{id}         → ledger name, group (→ Schedule III head), opening
firms/{uid}/invoices/{id}         → no, date, clientId, items[], taxable, cgst, sgst,
                                    igst, total, status(draft/final/paid), recurring:bool
firms/{uid}/vouchers/{id}         → type(receipt/payment/expense/journal), date,
                                    lines[{accountId, dr, cr}], narration, ref
firms/{uid}/payables/{id}         → party, amount, dueDate, repeatMonthly, paid
firms/{uid}/visits/{id}           → clientId, date, time, purpose, notes, geo?
firms/{uid}/schedules/{id}        → clientId, plannedDate, purpose, done
firms/{uid}/compliance/{id}       → clientId, type, period, dueDate, done
```

---

## 8. Phase-wise Roadmap (Loop commands के लिए)

| Phase | काम | Result |
|---|---|---|
| **1** | Project setup, Login/Signup, Firm profile, **Premium layout** (sidebar + dashboard shell with dummy data) | Login करके premium dashboard दिखेगा |
| **2** | Clients module (add/edit/list/detail) | Clients की list |
| **3** | Billing: Manual invoice और PDF, GST calculation | पहला bill |
| **4** | Recurring monthly bills (bulk generate, review, finalize) | एक click में महीने भर के bill |
| **5** | Receipts और TDS, Outstanding, **Daily Payment Reminder** और WhatsApp | बकाया + reminder |
| **6** | **Visit Log, Attendance chart और Schedule/Calendar** | Client visit tracking |
| **7** | आसान Journal Entry (पैसा आया/गया/खर्चा/journal), Ledger, Day Book | Accounting |
| **8** | Trial Balance, P&L, **Schedule III Balance Sheet** और export | Final accounts |
| **9** | Compliance calendar, dark mode, PWA install, polish | Complete v1 |

---

## 9. Sources (Research)
- [Turia Features](https://turia.in/features/)
- [QwikCA: CA Practice Management Software](https://www.qwikca.in/ca-practice-management-software/)
- [PracticeStacks](https://www.practicestacks.in/ca-management-software)
- [Practive](https://www.practive.in/)
- [Bizalys](https://bizalys.com/)
- [Schedule III amendments (DPNC)](https://www.dpncindia.com/amendment-in-schedule-iii-of-the-companies-act-2013-applicable-w-e-f-01-04-2021)
- [ICAI Guidance Note on Division I Schedule III](https://igcas.in/wp-content/uploads/2022/01/Guidance-note-on-Non-IND-AS-Schedule-III.pdf)
- [Schedule III amendments (IndiaFilings)](https://www.indiafilings.com/learn/amendments-in-schedule-iii-to-the-companies-act-2013)
