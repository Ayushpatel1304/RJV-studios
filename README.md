# RJV Studios — Photography & Video Portfolio

A responsive, static photography and videography portfolio for RJV Studios, hosted on Vercel. The site uses plain HTML, CSS and JavaScript. A Node.js build uses Sharp to generate responsive WebP images and package the public website files for deployment. The deployed site has no framework or application server.

## 1. Project structure

```text
RJV-studios/
├── index.html                    # Homepage and main sections
├── gallery.html                  # Reusable category gallery + lightbox
├── README.md                     # Project overview and setup guide
├── LICENSE
├── vercel.json                  # Vercel static hosting and build settings
├── scripts/build.mjs            # Packages the site and optimizes images into dist/
├── package.json                 # Pinned build-time image dependency
├── package-lock.json            # Reproducible dependency install
├── tests/test_site.py            # Browser checks against the deployment output
├── assets/
│   ├── css/
│   │   ├── styles.css            # Shared homepage and global styles
│   │   └── gallery.css           # Gallery page layout and lightbox styles
│   └── js/
│       ├── main.js               # Shared navigation interactions
│       └── gallery.js            # Gallery categories, photos, videos and lightbox
└── images/
    ├── backgrounds/
    │   ├── hero/                 # Homepage slideshow images (5 slots)
    │   └── portfolio/            # Homepage category-card cover images
    └── galleries/
        ├── commercial/           # Commercial and product photography
        ├── real-estate/          # Property, interiors and architecture
        ├── portraits/            # Headshots and portrait sessions
        ├── concerts/             # Concerts and live music
        ├── events/               # Events and celebrations
        ├── automotive/           # Cars and automotive work
        ├── couple/               # Couple sessions
        └── london/               # London photography and video
```

## 2. Homepage sections

- **Hero:** brand statement, calls to action and background slideshow on desktop (a static background on phones).
- **Services:** commercial, real estate, portraits, concerts, events and bespoke work.
- **Portfolio:** category cards linking to the relevant gallery.
- **Process:** enquiry, planning, shoot and delivery.
- **About:** studio introduction and working approach.
- **Contact:** contact details and an enquiry form prepared for Formspree submissions.

## 3. How to add background images

Background images are intentionally kept separate from the photos and videos in customer galleries.

### Hero slideshow
1. Open `images/backgrounds/hero/`.
2. Upload five images named `hero-01.webp` through `hero-05.webp`.
3. Use landscape images, ideally 1920×1080 or larger.
4. In `assets/css/styles.css`, replace each `.s1` through `.s5` gradient with the matching `url("../../images/backgrounds/hero/hero-01.webp")`, etc. The default gradients avoid broken requests while these optional files are absent.

### Homepage portfolio cards
Upload the following files to `images/backgrounds/portfolio/`:

- `real-estate-cover.webp`
- `portraits-cover.webp`
- `concerts-cover.webp`
- `events-cover.webp`
- `commercial-cover.webp`
- `automotive-cover.webp`
- `couple-cover.webp`
- `london-cover.webp`

These are optional separate crops for the small homepage cards. Set their paths in `assets/css/styles.css` after uploading them. Currently, the single real-estate card uses the uploaded real-estate cover and the concert card uses the first concert photograph. Other cards use gradients until covers are supplied.

## 4. How to add gallery photos and videos

All eight categories — Commercial, Real Estate, Portraits, Concerts, Events, Automotive, Couple and London — support photos, videos, or any mixture of both.

1. Upload your files to the matching folder inside `images/galleries/`. These existing folders hold both photos and videos.
2. Add an entry to that category's `media` array in `assets/js/gallery.js`. Uploading a file alone does not list it in the gallery.
3. Use `["Alternative text", "path/to/file"]` for a photo or video. Video file extensions are detected automatically. An optional third value supplies a video poster image.

```js
media: [
  ["Event photograph", "images/galleries/events/event-01.webp"],
  ["Event highlights", "images/galleries/events/highlights.mp4"],
  ["Behind the scenes", "images/galleries/events/behind-the-scenes.webm",
    "images/galleries/events/video-poster.webp"]
]
```

Only add entries for files you have uploaded. MP4 (H.264/AAC) is recommended for broad browser support; WebM is also supported. OGV/OGG and M4V paths are recognized as videos, with playback depending on browser codec support. Convert camera formats such as MOV to a web-friendly format before uploading.

Videos show a play button and open in the gallery viewer with native playback controls. Thumbnails stay paused and muted. Closing the viewer or changing items stops playback. The counter includes both photos and videos, and empty categories show an empty state. There is no fixed item limit.

Galleries use a responsive masonry layout: photos and videos retain their original proportions and arrange at different heights, with three columns on desktop, two on tablets and one on phones.

The first value supplies accessibility text for images and player controls. Individual files have no visible titles or descriptions. See [the upload guide](docs/IMAGE-UPLOAD-GUIDE.md) for more examples and export guidance.

## 5. Where to edit the website

- Text, headings, services, contact details and homepage layout: `index.html`
- Colours, typography, homepage layout, hover effects, slideshow and portfolio-card images: `assets/css/styles.css`
- Gallery layout and lightbox presentation: `assets/css/gallery.css`
- Gallery categories, accessible media labels and file paths: `assets/js/gallery.js`
- Shared navigation behaviour: `assets/js/main.js`
- Background images: `images/backgrounds/`
- Gallery photos and videos: `images/galleries/`

## 6. Preview and deployment

### Vercel deployment

Connect this repository to your Vercel project and use these settings:

| Setting | Value |
|---|---|
| Root Directory | Repository root |
| Framework Preset | Other |
| Install Command | `npm ci` |
| Build Command | `node scripts/build.mjs` |
| Output Directory | `dist` |

`vercel.json` defines the framework, install command, build command and output directory for deployments. The build script copies only `index.html`, `gallery.html`, `assets/` and `images/` into a fresh `dist/` directory, generates responsive images under `dist/assets/media/`, and writes their dimensions and paths into a generated media manifest. It also rewrites CSS background paths to use optimized covers. Tests, documentation and local settings stay outside the deployed site. Existing `gallery.html?category=...` links remain supported.

For an existing Vercel project, connect this GitHub repository under **Settings → Git** and use `main` as the production branch. Commits to the pull-request branch can be reviewed as Vercel previews; merge the pull request to deploy the changes to production. Manage custom domains in the Vercel project's **Settings → Domains**, using the DNS records Vercel provides.

See [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build) and [vercel.json settings](https://vercel.com/docs/project-configuration/vercel-json) for the hosting options.

### Local preview

Use Node.js 22.12+ to prepare the same files Vercel serves, then start a local static server:

```sh
npm ci
npm run build
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Re-run the build after changing the source files. Generated files stay in ignored `dist/`; do not edit or commit them. Image derivatives are cached locally under `node_modules/.cache/rjv-media` using content hashes, so unchanged uploads do not need re-encoding on each local build.

## 7. Important notes

- The contact form in `index.html` uses the configured Formspree endpoint. Manage its destination and activation in the studio's Formspree account; update the form action if the endpoint changes.
- Use only photographs and logos you own or have permission to publish.
- Keep image filenames lowercase and use hyphens instead of spaces.

## 8. Regression checks

See [Testing](docs/TESTING.md) for browser checks covering gallery assets, MP4/WebM playback across all categories, mobile navigation, the lightbox and contact-form validation. The checks build and serve the Vercel deployment output locally. Python and Playwright are development-only dependencies and are not installed during Vercel builds.

## 9. Image performance

Keep using original upload paths in `assets/js/gallery.js` and `assets/css/styles.css`. The build automatically generates up to three WebP sizes (480, 960 and 1920 pixels wide, without upscaling). Uploaded originals remain unchanged. Galleries load responsive previews with reserved dimensions to keep the masonry layout stable; the viewer loads a larger version only when opened. Hashed image filenames allow long-lived browser caching without stale images after an upload changes.

Videos with posters wait until opened before loading video data. Videos without posters request thumbnail metadata only near the viewport. For a fast video gallery, upload lightweight poster images alongside web-optimized MP4/WebM files.
