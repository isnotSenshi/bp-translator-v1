# bp-translator

A desktop app for translating Japanese manga text to Spanish/English in real time. Built with Electron + React.

<p>
➖➖➖🟧🟧🟧🟧🟧🟧🟧<br>
➖➖🟧🟧🟧🟧🟧🟧🟧🟧🟧<br>
➖🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧<br>
➖➖🟥🟥🟥🟥🟥🟥🟥🟥🟥<br>
➖🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨<br>
➖🟫🟫🟨🟨🟨🟫🟫🟫🟫🟫🟫<br>
🟩🟩🟩🟩🟨🟩🟩🟩🟩🟩🟩🟩🟩<br>
➖🟧🟧🟩🟩🟧🟧🟧🟩🟩🟧🟧<br>
➖➖🟧🟧🟧🟧🟧🟧🟧🟧🟧
</p>

## Download
[⬇️ Download bp-translator (Windows — Installer)](https://github.com/isnotSenshi/bp-translator/releases/latest/download/bp-translator-Setup.exe)<br>
[⬇️ Download bp-translator (Windows — Portable)](https://github.com/isnotSenshi/bp-translator/releases/latest/download/bp-translator-portable.exe)

---

## Features

- **Language selection** — choose between Spanish and English on every launch
- **Screen capture & crop** — select any area of your screen to extract text from
- **3 translation engines** — choose between OpenAI, Groq, or local Manga-OCR
- **Translation history** — save and review previous translations, click to copy
- **Context mode** — provide story context for more accurate translations
- **Global hotkeys** — trigger actions without focusing the app
- **Offline detection** — cloud engines are automatically disabled when there's no internet connection
- **Auto setup** — Manga-OCR installs Python and dependencies automatically on first use

---

## Engines

| Engine | Model | Requires |
|---|---|---|
| **OpenAI** (+++) | GPT-4o-mini | Paid API key |
| **Manga-OCR** (++) | Local OCR model | Nothing — auto-installed on first use |
| **Groq** (+) | Llama 3.3 70B | Free Groq account |

---

## Hotkeys

| Action | Shortcut |
|---|---|
| Capture & crop | `Ctrl+Shift+Z` |
| Translate | `Ctrl+Shift+X` |
| Save to history | `Ctrl+Shift+C` |
| Undo last save | `Ctrl+Shift+V` |

---

## Requirements

**To run the app (download the installer):**
- Nothing — Python, Visual C++ Redistributable, and all dependencies are installed automatically on first use.

**To run the project locally (development):**
- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) 3.9–3.11 *(only if you want to use the Manga-OCR engine)*

```bash
# Install Python dependencies for Manga-OCR
pip install -r python/requirements.txt
```

---

## Installation

```bash
# Clone the repository
git clone https://github.com/isnotSenshi/bp-translator.git
cd bp-translator

# Install Node dependencies
npm install
```

---

## Usage

### Development
```bash
npm run dev
```

### Production build
```bash
npm run build
```
Generates `release/bp-translator-Setup.exe` (installer) and `release/bp-translator-portable.exe` (portable) in the `release/` folder.

---

On first launch, select your language (Spanish or English), then select a translation engine:
- **OpenAI / Groq** — enter your API key when prompted
- **Manga-OCR** — on first use, the app detects Python on your system and installs `manga-ocr` automatically. If Python is not installed, it downloads and installs it silently. This only happens once.

Once connected, use the crop tool or `Ctrl+Shift+Z` to capture a manga panel and start translating.

---

## Logs

If the Manga-OCR engine fails to start, check the log file for details:

| Platform | Path |
|---|---|
| Windows | `%APPDATA%\bp-translator\ocr.log` |

Open it from CMD:
```cmd
notepad %APPDATA%\bp-translator\ocr.log
```

---

## API Keys

- **OpenAI** → [platform.openai.com](https://platform.openai.com/api-keys)
- **Groq** → [console.groq.com](https://console.groq.com/keys)

Keys are saved locally in a `.env` file and never sent anywhere other than the respective APIs.

---

## Tech Stack

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [Webpack](https://webpack.js.org/) + [Babel](https://babeljs.io/)
- [OpenAI SDK](https://github.com/openai/openai-node)
- [manga-ocr](https://github.com/kha-white/manga-ocr) *(Python, auto-installed)*

---

## Credits

**[manga-ocr](https://github.com/kha-white/manga-ocr)** by [kha-white](https://github.com/kha-white) — the OCR model that powers the local translation engine. This project wouldn't exist without it. Go give it a star ⭐

---

## Author

Made by [sh1shn](https://github.com/isnotSenshi)
