"""
Obryx OS — Private console launcher.

Builds a standalone Windows .exe with PyInstaller:
    pyinstaller --noconfirm --onefile --noconsole --name ObryxAdmin obryx_admin_tool.py

The access code below is baked into the executable. The launcher opens the real
admin.html from GitHub Pages in an Edge WebView window, unlocks it automatically
and keeps the webview storage persistent (private_mode=False).

Note: the webview has its own localStorage, separate from your usual browser.
Use the Export / Import buttons in the admin console to move a settings file
between them.
"""

import json
import os
import sys

import webview

# ── Embedded access code ────────────────────────────────────────────────────
ADMIN_CODE = "obryx-admin"
ADMIN_URL = "https://mathis363.github.io/obryx-os/admin.html"
SITE_URL = "https://mathis363.github.io/obryx-os/"

# Allow an advanced override without rebuilding: put another code in
# obryx-code.txt next to the .exe / script.
def resolve_code():
    for base in (os.path.dirname(os.path.abspath(sys.argv[0])), os.getcwd()):
        override = os.path.join(base, "obryx-code.txt")
        try:
            if os.path.isfile(override):
                with open(override, "r", encoding="utf-8") as handle:
                    value = handle.read().strip()
                if value:
                    return value
        except OSError:
            pass
    return ADMIN_CODE


def bootstrap_js(code):
    return """
(function () {
  var code = %s;

  function unlock() {
    var lock = document.getElementById('lockView');
    var input = document.getElementById('codeInput');
    if (lock && !lock.hidden && input) {
      input.value = code;
      document.getElementById('lockForm').dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }
  }

  function addBar() {
    if (document.getElementById('obryxAppBar')) return;
    var bar = document.createElement('div');
    bar.id = 'obryxAppBar';
    bar.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:99999',
      'display:flex', 'align-items:center', 'justify-content:space-between',
      'gap:14px', 'padding:9px 16px',
      'background:rgba(6,9,17,.96)',
      'border-bottom:1px solid rgba(87,230,197,.28)',
      'color:#57e6c5', 'font:600 11px/1.4 "DM Mono", ui-monospace, monospace',
      'letter-spacing:.09em', 'text-transform:uppercase',
      'backdrop-filter:blur(10px)'
    ].join(';');

    var left = document.createElement('span');
    left.textContent = 'Obryx OS // private console';

    var right = document.createElement('span');
    right.style.cssText = 'display:flex;gap:8px;align-items:center';

    var site = document.createElement('button');
    site.type = 'button';
    site.textContent = 'Open site';
    site.title = 'Open the public site in your browser';
    site.style.cssText = buttonStyle();
    site.onclick = function () {
      window.open(%s, '_blank');
    };

    var copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = 'Copy config';
    copy.title = 'Copy localStorage settings to the clipboard';
    copy.style.cssText = buttonStyle();
    copy.onclick = function () {
      var text = localStorage.getItem('obryxAdminConfig') || '{}';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copy.textContent = 'Copied';
          setTimeout(function () { copy.textContent = 'Copy config'; }, 1400);
        });
      } else {
        window.prompt('Copy this configuration:', text);
      }
    };

    var hint = document.createElement('span');
    hint.textContent = 'code embedded';
    hint.style.cssText = 'color:#9aa6c0;font-weight:400';

    right.appendChild(hint);
    right.appendChild(site);
    right.appendChild(copy);
    bar.appendChild(left);
    bar.appendChild(right);
    document.body.appendChild(bar);

    var panel = document.querySelector('.panel');
    if (panel) panel.style.marginTop = '52px';
  }

  function buttonStyle() {
    return [
      'padding:5px 10px', 'border-radius:8px',
      'border:1px solid rgba(87,230,197,.35)',
      'background:rgba(87,230,197,.1)',
      'color:#57e6c5', 'cursor:pointer',
      'font:600 10px "DM Mono", ui-monospace, monospace',
      'letter-spacing:.06em', 'text-transform:uppercase'
    ].join(';');
  }

  unlock();
  addBar();
})();
""" % (json.dumps(code), json.dumps(SITE_URL))


def main():
    code = resolve_code()
    storage = os.path.join(
        os.environ.get("LOCALAPPDATA", os.path.expanduser("~")),
        "ObryxAdminTool",
    )
    os.makedirs(storage, exist_ok=True)

    window = webview.create_window(
        "Obryx OS — Private console",
        ADMIN_URL,
        width=1180,
        height=860,
        min_size=(940, 640),
        background_color="#060911",
    )

    def on_loaded():
        try:
            window.evaluate_js(bootstrap_js(code))
        except Exception:
            # The page is still usable: the code can be typed manually.
            pass

    window.events.loaded += on_loaded

    webview.start(
        private_mode=False,
        storage_path=storage,
        gui="edgechromium",
    )


if __name__ == "__main__":
    main()
