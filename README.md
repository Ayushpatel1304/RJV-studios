# RJV Studios — Photography Portfolio

A responsive, static photography and videography portfolio for RJV Studios. The site is designed for GitHub Pages or Cloudflare Pages and uses plain HTML, CSS and JavaScript — no build step or package installation is required.

## 1. Project structure

```text
RJV-studios/
├── index.html                    # Homepage and main sections
├── gallery.html                  # Reusable category gallery + lightbox
├── README.md                     # Project overview and setup guide
├── LICENSE
├── assets/
│   ├── css/
│   │   └── styles.css            # Shared styles for both pages
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
- **Contact:** contact details and enquiry form layout.

## 3. How to add background images

Background images are intentionally kept separate from customer gallery photographs.

### Hero slideshow
1. Open `images/backgrounds/hero/`.
2. Upload five images named `hero-01.webp` through `hero-05.webp`.
3. Use landscape images, ideally 1920×1080 or larger.
4. The slideshow is already connected in `assets/css/styles.css`.

### Homepage portfolio cards
Upload the following files to `images/backgrounds/portfolio/`:

- `real-estate-cover.webp`
- `portraits-cover.webp`
- `concerts-cover.webp`
- `events-cover.webp`
- `portraits-cover-02.webp`
- `real-estate-cover-02.webp`

These are separate crops for the small homepage cards. Change their paths or filenames in `assets/css/styles.css` if needed.

### Other page-section backgrounds
The `images/backgrounds/sections/` folder is reserved for future images behind the Services, About or Contact sections. Add images there and reference them from `assets/css/styles.css` when you decide to use them.

## 4. How to add gallery photographs

1. Open the matching folder inside `images/galleries/`.
2. Upload images using the filenames below, or edit `assets/js/gallery.js` to match your filenames.
3. Use compressed `.webp` or `.jpg` images. Keep the original high-resolution files backed up separately.
4. Commit the changes. The gallery page reads the local image paths automatically.

| Category | Example filenames |
|---|---|
| Commercial | `commercial-01.webp` to `commercial-06.webp` |
| Real Estate | `real-estate-01.webp` to `real-estate-06.webp` |
| Portraits | `portrait-01.webp` to `portrait-06.webp` |
| Concerts | `concert-01.webp` to `concert-06.webp` |
| Events | `event-01.webp` to `event-06.webp` |

Add more photos by copying a photo entry in `assets/js/gallery.js` and changing its caption and file path.

## 5. Where to edit the website

- Text, headings, services, contact details and homepage layout: `index.html`
- Colours, typography, layout, hover effects, slideshow and portfolio-card images: `assets/css/styles.css`
- Gallery categories, captions and gallery image paths: `assets/js/gallery.js`
- Shared navigation behaviour: `assets/js/main.js`
- Background images: `images/backgrounds/`
- Gallery images: `images/galleries/`

## 6. Preview and deployment

This is a static website. Open `index.html` in a browser to preview it locally. For deployment, connect this repository to GitHub Pages or Cloudflare Pages and use the repository root as the build/output directory. No build command is required.

If using a custom domain, configure the domain in your hosting provider and add the DNS records it supplies at your domain registrar.

## 7. Important notes

- The enquiry form in `index.html` is a front-end layout only. Connect it to Formspree, Netlify Forms or a backend before accepting real enquiries.
- Use only photographs and logos you own or have permission to publish.
- Keep image filenames lowercase and use hyphens instead of spaces.
