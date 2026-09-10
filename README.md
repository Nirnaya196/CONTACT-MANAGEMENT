NAME : NIRNAYA RAJPUT

DOAMIN : JAVA PROGRAMMING 

INTERN ID : CITS8563

# CONTACT-MANAGEMENT
A Scientific Calculator is a user-friendly application designed to perform basic as well as advanced mathematical calculations. It provides a convenient way to solve arithmetic, trigonometric, logarithmic, exponential, and other scientific operations quickly and accurately.
<div align="center">

# 📇 Nexus Contacts — Modern Contact Management App

<p align="center">
  <strong>A modern, glassmorphic Contact Management System & CRM built with Vanilla Web Technologies.</strong>
  <br />
  <em>Zero build dependencies • 100% GitHub Pages Ready • Full CRUD • Smart Duplicate Detection • vCard QR Generator • Analytics Dashboard</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License" />
  <img src="https://img.shields.io/badge/GitHub_Pages-Active-22c55e?style=for-the-badge&logo=github" alt="GitHub Pages" />
</p>

</div>

---

## 🌟 Highlights & Features

### 🎨 Visual & UI Design
* **Glassmorphic Aesthetics**: Modern dark/light mode with sleek gradient accents, backdrop filters, fluid hover states, and micro-interactions.
* **Dual View Modes**: Switch seamlessly between **Interactive Grid Cards** and **Dense Tabular List View**.
* **Responsive Across Devices**: Fully optimized for Desktop, Tablet, and Mobile devices with collapsible navigation.

### ⚡ Contact Operations (CRUD)
* **Rich Field Support**: First Name, Last Name, Phone, Email, Company, Job Title, Category (Work, Personal, Family, Friends, VIP), Custom Tags, Address, Birthday with days-until countdown, Notes, and customizable Avatar Badges.
* **Quick Action Triggers**: One-tap phone dial (`tel:`), direct WhatsApp messaging (`wa.me`), and email dispatch (`mailto:`).
* **Starred Favorites**: Quick-filter VIP and starred contacts in one click.
* **Activity & Interaction Timeline**: Keep a chronological record of calls, meetings, notes, and emails per contact.

### 🧠 Smart Utilities & Intelligence
* **Instant Multi-Field Search**: Real-time fuzzy query filtering across names, emails, phones, companies, tags, and notes simultaneously (`Ctrl + K`).
* **QR Code Sharing (vCard)**: Generates a scannable QR code formatted in vCard standard so smartphones can scan and add contacts instantly without typing.
* **Duplicate Detector & Merger**: Scans your database for overlapping phone numbers or emails and offers one-click intelligent merging.
* **Contact Analytics Dashboard**: Interactive charts showing category distributions, top organizations, and tag popularity.

### 💾 Data Portability & Safety
* **Export Options**: Export backup to **JSON**, export spreadsheet to **CSV**, or download individual/bulk **vCards (`.vcf`)** for Apple & Google Contacts.
* **Importing**: One-click import for existing JSON and CSV contact lists with schema validation.
* **Undoable Deletions**: 6-second animated toast with instant **Undo** button to prevent accidental data loss.
* **LocalStorage Persistence**: Auto-persists all state locally in browser with instant pre-loaded sample dataset.

---

## 📁 Project Structure

```
CONTACT MANAGEMENT APP/
├── index.html              # Semantic HTML5 application entry point
├── css/
│   └── style.css           # Design system tokens, glassmorphism, responsive styles & animations
├── js/
│   ├── app.js              # Main coordinator, event bindings & global keyboard shortcuts
│   ├── storage.js          # LocalStorage persistence, sample mock data, JSON/CSV/vCard engine
│   ├── contacts.js         # Contact entity model, search indexer, filters, sorter & duplicate detector
│   └── ui.js               # Dynamic DOM renderers, drawer, modals, toast system & analytics
├── .gitignore              # Git ignore rules
├── LICENSE                 # MIT License
└── README.md               # Complete repository documentation
```

---

## 🚀 Quick Start & Installation

### Option 1: Direct Run (No build tools required!)
Simply clone this repository and double click `index.html` in your browser:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/contact-management-app.git

# 2. Navigate to project folder
cd "contact-management-app"

# 3. Open in browser (Windows)
start index.html

# Open in browser (macOS)
open index.html

# Open in browser (Linux)
xdg-open index.html
```

### Option 2: Run with a Local Server (e.g. VS Code Live Server or Python)
```bash
# Using Python 3
python -m http.server 3000

# Using Node.js npx serve
npx serve .
```
Then navigate to `http://localhost:3000` in your web browser.

---

## 🌐 Deploying to GitHub Pages (Free Hosting in 1 Minute)

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Nexus Contacts application"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages** (in the left sidebar).
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select `main` branch and `/ (root)` folder, then click **Save**.
3. Your app is now live at `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`! 🎉

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>/</kbd> | Focus instant search bar |
| <kbd>Ctrl</kbd> + <kbd>N</kbd> | Open "Add New Contact" modal |
| <kbd>Ctrl</kbd> + <kbd>D</kbd> | Toggle Dark / Light theme |
| <kbd>Esc</kbd> | Close active modal, drawer, or clear search |
| <kbd>?</kbd> | Open keyboard shortcuts cheat sheet |

---

## 🛠️ Technology Stack & Architecture

* **Frontend Architecture**: Vanilla ES6+ JavaScript (Modular separation: Storage, Model/State, UI Renderer, Controller).
* **Styling**: Modern CSS3 (Custom CSS Properties, Grid, Flexbox, Glassmorphism `backdrop-filter`, `@keyframes`).
* **Icons & Assets**: Scalable SVG vector icons with native styling.
* **Storage**: Browser `localStorage` API with JSON serialization and schema fallback.
* **Formats Supported**: `.json` (Full data backup), `.csv` (Excel / Google Contacts), `.vcf` (vCard 3.0 standard).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](../../issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
