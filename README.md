# Cyber Statistics Website

Cyber Statistics is a modular website dedicated to exploring cybersecurity topics through statistical analysis and practical examples. The project is designed for clarity, accessibility, and ease of navigation, using only static HTML and CSS (no JavaScript required).

## Project Structure
- **Homepage (`index.html`)** — Introduction to the project, navigation to all sections.
- **About (`about.html`)** — Information about the project, its author, and design goals.
- **Homework Section** — Eight dedicated homework pages, each in its own folder:
  - `/homework/homework1/homework1.html`
  - `/homework/homework2/homework2.html`
  - ... up to `/homework/homework8/homework8.html`
- **Assets** — All styles in `/assets/styles.css`.

## Purpose & Content
This site demonstrates how statistical methods are applied in cybersecurity, with:
- Explanations of statistical concepts and their relevance to cyber defense.
- Practical examples and case studies in each homework page.
- Visual summaries and accessible layouts for easy reading.
- References to key literature and standards in the field.

Each homework page covers a specific topic, such as:
- Statistical foundations and definitions
- Use of statistics in IDS/IPS and NGFWs
- Anomaly detection, baselining, and model evaluation
- Practical challenges and limitations in real-world systems

## How to Use
You can view the site locally by opening `index.html` in your browser, or serve it over HTTP for easier navigation:

### Quick Start (Windows PowerShell)
```powershell
Start-Process .\index.html
```

### Serve Locally (Python 3)
```powershell
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

### Serve Locally (Node.js)
```powershell
npx serve . -l 8000
# Or use npx live-server . --port=8000 for auto-reload
```

## Customization & Expansion
- All content is modular: you can add new homework folders, pages, or assets as needed.
- The navigation bar automatically links to all homework pages for easy access.
- The CSS is designed for easy palette changes and responsive layout.

## Author & Credits
Created by [extreemedev](https://github.com/extreemedev) — see the About page for more info.

## License
This project is open for educational and personal use. Feel free to fork, adapt, or expand for your own coursework or research.

