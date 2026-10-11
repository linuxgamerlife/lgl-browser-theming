<div align="center">

# LGL Browser Theming

**A local start page that keeps Chromium-based browsers in sync with Noctalia's current colour palette.**

![Chromium](https://img.shields.io/badge/Chromium-supported-4285F4?logo=googlechrome&logoColor=white)
![Vivaldi](https://img.shields.io/badge/Vivaldi-supported-EF3939?logo=vivaldi&logoColor=white)
![Noctalia](https://img.shields.io/badge/Noctalia-themed-7C4DFF)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Overview

LGL Browser Theming is a small, unpacked Chromium extension that replaces the
New Tab page with a clock, date, and search page styled from Noctalia's active
wallpaper palette.

- Supports Chromium, Helium, and Vivaldi
- Follows Noctalia palette and light or dark mode changes
- Updates already-open start pages automatically
- Works locally without a web server or hosted service
- Includes readable fallback colours when Noctalia is unavailable

---

## How It Works

Noctalia renders its current palette into a local `theme.css` file. The browser
extension loads that file and checks it for changes every two seconds.

```text
Noctalia palette changes
        -> theme.css is regenerated
        -> the extension detects the change
        -> open start pages update automatically
```

The browser does not read Noctalia's settings or run shell commands. It only
loads the generated CSS from the extension directory.

---

## Install

Clone the repository:

```bash
git clone https://github.com/linuxgamerlife/lgl-browser-theming.git
cd lgl-browser-theming
```

From the repository root, install the Noctalia template and the payload for
your browser. This example uses Vivaldi; replace `vivaldi` with `chromium` or
`helium` when needed.

```bash
mkdir -p "$HOME/.config/noctalia/templates"
mkdir -p "$HOME/.local/share/noctalia-startpage"

cp noctalia/templates/browser-startpage.css \
  "$HOME/.config/noctalia/templates/"

cp noctalia/noctalia-startpage.toml "$HOME/.config/noctalia/"

cp -r browsers/vivaldi/. \
  "$HOME/.local/share/noctalia-startpage/"
```

Then open `vivaldi://extensions`, enable **Developer mode**, select **Load
unpacked**, and choose:

```text
~/.local/share/noctalia-startpage/
```

Under **Settings > Tabs > New Tab Page**, select **Start Page** and enable
**Controlled by Extension**.

See [INSTALL.md](INSTALL.md) for Noctalia template setup, other browsers,
customization, troubleshooting, and removal.

---

## Browser Support

| Browser | Extension files | Notes |
|---|---|---|
| **Vivaldi** | `browsers/vivaldi/` | Includes a service-worker workaround for additional windows |
| **Chromium** | `browsers/chromium/` | Standard Chromium New Tab override |
| **Helium** | `browsers/helium/` | Standard Chromium New Tab override |

### Vivaldi Additional Windows

Some Vivaldi versions ignore the configured New Tab extension when opening a
second window. The Vivaldi payload includes `background.js`, which redirects
only that new window's built-in Start Page to the extension page. Windows
opened directly to a website are not redirected.

After updating the extension files, click **Reload** on the extension card at
`vivaldi://extensions`.

---

## Customize

User-facing options are stored in the installed `config.js`:

```text
~/.local/share/noctalia-startpage/config.js
```

```javascript
window.STARTPAGE_CONFIG = {
  showClock: true,
  showDate: true,
  search: {
    enabled: true
  }
};
```

Reload the extension after changing this file.

---

## Security

The extension is safe for normal personal use:

- It runs locally and contains no remote code, analytics, or tracking.
- It cannot access passwords, cookies, page contents, or browsing history.
- The `search` permission sends searches through Vivaldi's configured search
  provider.
- The Vivaldi version uses the `tabs` permission only to identify and redirect
  the built-in Start Page in a newly created window.
- Its only automatic `fetch()` request loads the local `theme.css` file.

Someone could modify an unpacked extension only if they already had permission
to write to its local directory, normally by gaining access to your Linux user
account or running a command as that user. At that point they could already
access the browser profile and other personal files, so this extension does not
meaningfully increase that risk.

---

## Project Layout

```text
lgl-browser-theming/
├── browsers/
│   ├── chromium/
│   ├── helium/
│   └── vivaldi/
├── noctalia/
│   ├── noctalia-startpage.toml
│   └── templates/
│       └── browser-startpage.css
├── INSTALL.md
└── README.md
```

---

## License

MIT - see [LICENSE](LICENSE) for details.

---

<div align="center">
Made for <a href="https://noctalia.dev">Noctalia</a> · by <a href="https://www.youtube.com/@linuxgamerlife">LinuxGamerLife</a>
</div>
