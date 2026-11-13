# RJV Studios — Photography Portfolio

A responsive, static photography and videography portfolio for RJV Studios, hosted on Vercel. The site uses plain HTML, CSS and JavaScript. A dependency-free Node.js script packages the public website files for deployment; no framework, npm install or application server is required.

## 1. Project structure

```text
RJV-studios/
├── index.html                    # Homepage and main sections
├── gallery.html                  # Reusable category gallery + lightbox
├── README.md                     # Project overview and setup guide
├── LICENSE
├── vercel.json                  # Vercel static hosting and build settings
├── scripts/build.mjs            # Copies website files into dist/
├── tests/test_site.py            # Browser checks against the deployment output
├── assets/
│   ├── css/
│   │   ├── styles.css            # Shared homepage and global styles
│   │   └── gallery.css           # Gallery page layout and lightbox styles
│   └── js/
│       ├── main.js               # Shared navigation interactions
│       └── gallery.js            # Gallery categories, images and lightbox
└── images/
    ├── branding/                 # Logos and brand assets
    ├── backgrounds/
    │   ├── hero/                 # Homepage slideshow images (5 slots)
    │   ├── portfolio/            # Homepage category-card cover images
    │   └── sections/             # Optional section background images
    └── galleries/
        ├── commercial/           # Commercial and product photography
        ├── real-estate/          # Property, interiors and architecture
        ├── portraits/            # Headshots and portrait sessions
        ├── concerts/             # Concerts and live music
        └── events/               # Events and celebrations
```

## 2. Homepage sections

- **Hero:** brand statement, calls to action and rotating background slideshow.
- **Services:** commercial, real estate, portraits, concerts, events and bespoke work.
- **Portfolio:** category cards linking to the relevant gallery.
- **Process:** enquiry, planning, shoot and delivery.
- **About:** studio introduction and working approach.
- **Contact:** contact details and an enquiry form prepared for Formspree submissions.

## 3. How to add background images

Background images are intentionally kept separate from customer gallery photographs.

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

These are optional separate crops for the small homepage cards. Set their paths in `assets/css/styles.css` after uploading them. Currently, the single real-estate card uses the uploaded real-estate cover and the concert card uses the first concert photograph. Other cards use gradients until covers are supplied.

### Other page-section backgrounds
The `images/backgrounds/sections/` folder is reserved for future images behind the Services, About or Contact sections. Add images there and reference them from `assets/css/styles.css` when you decide to use them.

## 4. How to add gallery photographs

1. Open the matching folder inside `images/galleries/`.
2. Upload images using the filenames below, or edit `assets/js/gallery.js` to match your filenames.
3. Use compressed `.webp` or `.jpg` images. Keep the original high-resolution files backed up separately.
4. Commit the changes. The gallery displays every entry listed in `assets/js/gallery.js`; uploading a file alone does not add it to the gallery. Categories with no photo entries show an empty state.

| Category | Example filenames |
|---|---|
| Commercial | `commercial-01.webp` to `commercial-06.webp` |
| Real Estate | `real-estate-01.webp` to `real-estate-06.webp` |
| Portraits | `portrait-01.webp` to `portrait-06.webp` |
| Concerts | `concert-01.webp`, `concerts-02.webp`, `concerts-03.jpg`, then the remaining uploaded `concerts-*` files |
| Events | `event-01.webp` to `event-06.webp` |

Add more photos by copying a photo entry in `assets/js/gallery.js` and changing its alternative text and file path. The alternative text is used for accessibility; photographs have no visible captions.

## 5. Where to edit the website

- Text, headings, services, contact details and homepage layout: `index.html`
- Colours, typography, homepage layout, hover effects, slideshow and portfolio-card images: `assets/css/styles.css`
- Gallery layout and lightbox presentation: `assets/css/gallery.css`
- Gallery categories, accessible image descriptions and gallery image paths: `assets/js/gallery.js`
- Shared navigation behaviour: `assets/js/main.js`
- Background images: `images/backgrounds/`
- Gallery images: `images/galleries/`

## 6. Preview and deployment

### Vercel deployment

Connect this repository to your Vercel project and use these settings:

| Setting | Value |
|---|---|
| Root Directory | Repository root |
| Framework Preset | Other |
| Install Command | Disabled (empty) |
| Build Command | `node scripts/build.mjs` |
| Output Directory | `dist` |

`vercel.json` defines the framework, install command, build command and output directory for deployments. The build script copies only `index.html`, `gallery.html`, `assets/` and `images/` into a fresh `dist/` directory. Tests, documentation and local settings stay outside the deployed site. Existing `gallery.html?category=...` links remain supported.

For an existing Vercel project, connect this GitHub repository under **Settings → Git** and use `main` as the production branch. Commits to the pull-request branch can be reviewed as Vercel previews; merge the pull request to deploy the changes to production. Manage custom domains in the Vercel project's **Settings → Domains**, using the DNS records Vercel provides.

See [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build) and [vercel.json settings](https://vercel.com/docs/project-configuration/vercel-json) for the hosting options.

### Local preview

Use Node.js 22+ to prepare the same files Vercel serves, then start a local static server:

```sh
node scripts/build.mjs
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Re-run the build after changing the source files.

## 7. Important notes

- The contact form in `index.html` uses the configured Formspree endpoint. Manage its destination and activation in the studio's Formspree account; update the form action if the endpoint changes.
- Use only photographs and logos you own or have permission to publish.
- Keep image filenames lowercase and use hyphens instead of spaces.

## 8. Regression checks

See [Testing](docs/TESTING.md) for browser checks covering gallery assets, mobile navigation, the lightbox and contact-form validation. The checks build and serve the Vercel deployment output locally. Python and Playwright are development-only dependencies and are not installed during Vercel builds.
