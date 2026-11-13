# Browser regression checks

Vercel installs the locked Sharp dependency with `npm ci`, then runs the Node.js image optimization and packaging script in `scripts/build.mjs` and publishes `dist/`. For development checks, use Node.js 22.12+ and Python 3.10+:

```sh
npm ci
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
- Responsive previews, preserved originals, reserved masonry dimensions under a slow connection, and no original-image downloads when browsing the gallery.
- Empty and unknown categories, including inherited object-property names.
- Local asset requests and horizontal layout at phone, tablet and desktop widths.
- Keyboard and mobile navigation on both pages.
- Lightbox opening, cycling, focus containment and focus restoration.
- Phone/date validation and the form payload using a mocked submission.

Video checks inject real, tiny MP4 and WebM clips into each category using local
browser routes. They verify playback, mixed-media navigation, video shutdown,
mobile controls and decoding errors without adding sample videos to live galleries.
Fixtures are base64-encoded under `tests/fixtures/` and are excluded from the
Vercel output along with the rest of `tests/`.

The silent black clips can be regenerated with FFmpeg (needed only when updating
fixtures, not when running tests):

```sh
ffmpeg -f lavfi -i color=c=black:s=160x90:r=4:d=10 -an -c:v libx264 -pix_fmt yuv420p -profile:v baseline -movflags +faststart clip.mp4
ffmpeg -f lavfi -i color=c=black:s=160x90:r=4:d=10 -an -c:v libvpx -deadline realtime clip.webm
```

Base64-encode each resulting file into `tests/fixtures/video.<extension>.base64`.
