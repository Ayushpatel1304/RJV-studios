# Image Upload Guide

## Keep the two image types separate

- **Backgrounds** are decorative images used behind the homepage hero or category cards. They live in `images/backgrounds/`.
- **Gallery photographs** are the actual work visitors browse and open in the lightbox. They live in `images/galleries/`.

## Recommended upload names

### Hero backgrounds
`images/backgrounds/hero/hero-01.webp` … `hero-05.webp`

### Portfolio card covers
`images/backgrounds/portfolio/real-estate-cover.webp`
`images/backgrounds/portfolio/portraits-cover.webp`
`images/backgrounds/portfolio/concerts-cover.webp`
`images/backgrounds/portfolio/events-cover.webp`
`images/backgrounds/portfolio/portraits-cover-02.webp`
`images/backgrounds/portfolio/real-estate-cover-02.webp`

### Gallery photographs
Upload into the matching category folder. The filenames and captions are listed in `assets/js/gallery.js`.

## Image recommendations

- Hero backgrounds: landscape, 16:9, around 1920×1080.
- Portfolio covers: landscape or square crops, ideally at least 1200px wide.
- Gallery photographs: high-quality JPG or WebP, ideally 1600–2400px on the long edge.
- Use descriptive lowercase names, e.g. `shreya-ghoshal-o2-01.webp`.

## Updating paths

If you use a different filename, edit the corresponding path in `assets/js/gallery.js` (gallery photos) or `assets/css/styles.css` (backgrounds). File paths are case-sensitive on most hosting platforms.
