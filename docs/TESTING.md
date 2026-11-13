# Browser regression checks

Vercel runs the dependency-free Node.js packaging script in `scripts/build.mjs` and publishes `dist/`. For development checks, use Node.js 22+ and Python 3.10+:

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements-dev.txt
python -m playwright install chromium
python -m unittest discover -s tests -v
```

On Linux, Playwright may also need system libraries: follow its installation
instructions or use `python -m playwright install --with-deps chromium` on a
machine where you can install system packages. The tests use system Chromium
when available, otherwise the Playwright-managed Chromium.

The suite reads `vercel.json`, runs its build command, and starts a temporary
local HTTP server serving its output directory. All browser checks exercise
these deployment files rather than the repository root. The suite blocks
external fonts and intercepts the contact form's POST request; it never sends
a real enquiry or contacts Vercel. Live Vercel routing, domain and DNS settings
are outside these local checks.

The checks cover:

- A clean, repeatable Vercel build containing only public website files; tests and local settings return 404.
- The root homepage, existing `.html` gallery links and all uploaded photographs loading successfully.
- Empty and unknown categories, including inherited object-property names.
- Local asset requests and horizontal layout at phone, tablet and desktop widths.
- Keyboard and mobile navigation on both pages.
- Lightbox opening, cycling, focus containment and focus restoration.
- Phone/date validation and the form payload using a mocked submission.
