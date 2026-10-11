# Noctalia Start Page

This project is a local, unpacked Chromium extension that replaces the New
Tab page with a page whose colours come from Noctalia.

It supports Chromium, Helium, and Vivaldi. Vivaldi does not need a special
browser API or a separate theme format because it is Chromium-based.

## How It Works

There are two separate parts:

1. **Noctalia generates the colours.** The template in
   `noctalia/templates/browser-startpage.css` contains Noctalia variables such
   as `{{ colors.surface.default.hex }}`. Noctalia resolves those variables
   and writes ordinary CSS to `theme.css`.
2. **The browser extension displays the colours.** `index.html` loads the
   fallback styles in `styles.css`, then `startpage.js` loads the generated
   `theme.css`. Open pages check for a new theme every two seconds.

The data flow is:

```text
wallpaper or Noctalia palette changes
        -> Noctalia renders browser-startpage.css
        -> ~/.local/share/noctalia-startpage/theme.css changes
        -> the open start page reloads its CSS
```

The browser never reads Noctalia configuration files and never runs shell
commands. It only reads the CSS file inside the extension directory.

The clock and date use Noctalia's generated `--secondary` color. This
requires no changes to Noctalia.

## Files

Source files are arranged by browser:

```text
lgl-browser-theming/
├── browsers/
│   ├── chromium/            # Chromium extension payload
│   ├── helium/              # Helium extension payload
│   └── vivaldi/             # Vivaldi extension payload
├── noctalia/
│   ├── noctalia-startpage.toml  # Wallpaper hook for TOML-based Noctalia
│   └── templates/
│       └── browser-startpage.css
└── INSTALL.md
```

Each browser directory is a complete extension and contains:

| File | Purpose |
| --- | --- |
| `manifest.json` | Declares the extension and overrides New Tab |
| `index.html` | Start page markup |
| `styles.css` | Layout and fallback colours |
| `theme.css` | Generated colours; do not edit by hand |
| `startpage.js` | Clock, search, and live theme refresh |
| `config.js` | User settings |
| `favicon.svg` | Page icon |
| `icons/` | Extension icons shown by the browser |

The Vivaldi payload also contains `background.js`, which redirects Vivaldi's
built-in Start Page when it is incorrectly used for an additional window.

## Install the Files

Run these commands from the repository root. They create the destination
directory, install the Noctalia template and wallpaper hook, and copy the
complete Vivaldi payload. Replace `vivaldi` with `chromium` or `helium` to
install a different browser payload.

```bash
mkdir -p "$HOME/.config/noctalia/templates"
mkdir -p "$HOME/.local/share/noctalia-startpage"

cp noctalia/templates/browser-startpage.css \
  "$HOME/.config/noctalia/templates/"

cp noctalia/noctalia-startpage.toml "$HOME/.config/noctalia/"

cp -r browsers/vivaldi/. \
  "$HOME/.local/share/noctalia-startpage/"
```

The final directory should contain at least:

```text
~/.local/share/noctalia-startpage/
├── manifest.json
├── index.html
├── styles.css
├── theme.css
├── startpage.js
├── background.js
├── config.js
├── favicon.svg
└── icons/
```

## Connect Noctalia to the Theme

The template is not itself a CSS file that the browser can use. It contains
placeholders that Noctalia must render whenever the wallpaper changes:

```text
input:  ~/.config/noctalia/templates/browser-startpage.css
output: ~/.local/share/noctalia-startpage/theme.css
```

The `noctalia-startpage.toml` file copied in **Install the Files** does this.
Noctalia merges every `*.toml` file in `~/.config/noctalia/` into its
configuration, so no other setting needs to change. The file adds this hook:

```toml
[hooks]
wallpaper_changed = "$(command -v noctalia-kwe || command -v noctalia) theme \"$NOCTALIA_WALLPAPER_PATH\" -r \"$HOME/.config/noctalia/templates/browser-startpage.css:$HOME/.local/share/noctalia-startpage/theme.css\""
```

When the wallpaper changes, the hook generates a palette from the new image
and renders the template to `theme.css`. It works with both the `noctalia`
and `noctalia-kwe` binaries.

Restart Noctalia, then confirm that the hook is active:

```bash
noctalia config export | grep -A1 '^\[hooks\]'
```

Use `noctalia-kwe` instead of `noctalia` in that command if that is the binary
you have.

If you already define `wallpaper_changed` in another TOML file, combine both
commands into one hook separated by `;` instead of adding a second definition.

### Check the Output

Change the wallpaper once to render the first theme. Open `theme.css` and
confirm that it contains real values such as `#3f4759`, not `{{ ... }}`.

If `theme.css` is missing or still contains placeholders, the page will still
open, but it will use the fallback colours from `styles.css` and will not be
synced to Noctalia.

## Load in Vivaldi

1. Open `vivaldi://extensions`.
2. Enable **Developer mode**.
3. Disable another extension that replaces New Tab, if one is installed.
4. Click **Load unpacked**.
5. Select `~/.local/share/noctalia-startpage/`, the directory containing
   `manifest.json`.
6. Confirm that **Noctalia Start Page** is enabled.
7. Copy the extension ID from its card and form this URL:

   ```text
   chrome-extension://YOUR_VIVALDI_EXTENSION_ID/index.html
   ```

8. Open **Settings > Tabs > New Tab Page**.
9. Select **Start Page** and enable **Controlled by Extension**.
10. Open a new tab with the `+` button, then open another Vivaldi window and
    confirm that both show the custom page.

Vivaldi assigns an extension ID when it loads the directory. Copy the ID from
the extension card if you need to open the page directly:

```text
chrome-extension://YOUR_VIVALDI_EXTENSION_ID/index.html
```

Also use that URL as the browser's Home button URL in **Settings > Appearance
> Home button** if the Home button should open the custom page.

Do not rely on **Settings > General > Startup with > Specific Pages** for this
behavior. Startup pages are opened only when the Vivaldi process starts. If
Vivaldi is already running, another launch creates a window with its configured
New Tab Page instead.

Some Vivaldi versions open their built-in Start Page in additional windows even
when **Controlled by Extension** or **Specific Page** is configured correctly.
Version 1.1.0 and later includes `background.js`, a service worker that detects
this case and redirects only the new window's built-in Start Page to the local
extension page. Windows opened directly to another website are not redirected.

Do not select the project source directory or the `browsers/vivaldi` directory
if you have not copied it. Select the installed directory that directly
contains `manifest.json`.

## Load in Other Chromium Browsers

The Chromium and Helium directories use the same extension structure. Repeat
the Vivaldi process using the browser's extensions page:

```text
Chromium: chrome://extensions
Helium:   chrome://extensions
Vivaldi:  vivaldi://extensions
```

You may load the same installed directory in multiple browsers. Each browser
keeps its own extension registration, while the files and generated
`theme.css` remain shared.

## Update the Theme

Each wallpaper change runs the hook from **Connect Noctalia to the Theme**,
which renders the template to:

```text
~/.local/share/noctalia-startpage/theme.css
```

Copying the browser files again replaces `theme.css` with the copy from the
repository. Change the wallpaper afterwards to render the current palette.

New tabs read the current file immediately. An already-open start page checks
the file every two seconds, bypasses the browser cache, and keeps the previous
valid theme if a write is temporarily incomplete.

If the page does not change, verify the file timestamp and contents first:

```bash
stat "$HOME/.local/share/noctalia-startpage/theme.css"
grep -- '{{' "$HOME/.local/share/noctalia-startpage/theme.css"
```

The `grep` command should produce no output after rendering.

## Customize the Page

Edit:

```text
~/.local/share/noctalia-startpage/config.js
```

For example:

```javascript
window.STARTPAGE_CONFIG = {
  showClock: true,
  showDate: true,
  search: {
    enabled: true
  }
};
```

Reload the extension from `vivaldi://extensions` after changing this file.

## Hide Vivaldi's Address Bar

The extension controls the page content, not Vivaldi's browser chrome. To hide
the address bar:

- Press `Ctrl+F11` to toggle Vivaldi's user interface.
- Press `F11` for fullscreen mode.
- For a dedicated display, launch Vivaldi in kiosk mode:

```bash
vivaldi --kiosk "chrome-extension://YOUR_VIVALDI_EXTENSION_ID/index.html"
```

Normal Vivaldi window mode does not provide a page-level setting that hides
only the address bar.

## Troubleshooting

### The directory does not exist

Run the installation commands in **Install the Files**. The directory is not
created automatically by Vivaldi.

### The extension does not appear in Vivaldi

1. Make sure you selected the installed directory containing `manifest.json`.
2. Check that Developer mode is enabled.
3. Look for an **Errors** button on the extension card.
4. Open the direct `chrome-extension://.../index.html` URL using the ID shown
   by Vivaldi.

### The normal Vivaldi New Tab still appears

Disable other New Tab extensions, then reload Noctalia Start Page from
`vivaldi://extensions`. Confirm that the displayed version is 1.1.0 or later.
In **Settings > Tabs > New Tab Page**, select **Start Page** and enable
**Controlled by Extension**.

If only the first Vivaldi window works, make sure `background.js` exists beside
`manifest.json` in `~/.local/share/noctalia-startpage`, then click **Reload** on
the extension card. The background service worker redirects the built-in Start
Page that some Vivaldi versions open in additional windows.

### The page opens but has fallback colours

Check that `theme.css` exists, contains resolved hex colours, and is writable
by the Noctalia renderer. The extension itself does not resolve the Noctalia
placeholders.

If `theme.css` never changes, confirm that `noctalia-startpage.toml` is in
`~/.config/noctalia/` and that its hook appears in `noctalia config export`.

The hook runs only when the wallpaper changes, so switching between light and
dark mode alone may not update the page.

### Search does not work

The search field uses `chrome.search.query()` and the manifest requests the
`search` permission. The rest of the start page does not depend on search.

## Remove the Start Page

1. Open `vivaldi://extensions`.
2. Remove **Noctalia Start Page**.
3. Optionally remove the installed files and template:

```bash
rm -rf "$HOME/.local/share/noctalia-startpage"
rm "$HOME/.config/noctalia/templates/browser-startpage.css"
rm -f "$HOME/.config/noctalia/noctalia-startpage.toml"
```
