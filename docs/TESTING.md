# Browser regression checks

The site needs no build or runtime dependencies. For development checks, use Python 3.10+:

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

Tests start a temporary local HTTP server, block external fonts, and intercept
the contact form's POST request. They never send a real enquiry. They check:

- Every uploaded gallery photograph is listed and decodes successfully.
- Empty and unknown categories, including inherited object-property names.
- Local asset requests and horizontal layout at phone, tablet and desktop widths.
- Keyboard and mobile navigation on both pages.
- Lightbox opening, cycling, focus containment and focus restoration.
- Phone/date validation and the form payload using a mocked submission.
