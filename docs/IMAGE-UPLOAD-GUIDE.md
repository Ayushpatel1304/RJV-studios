# Image Upload Guide

## Keep the two image types separate

- **Backgrounds** are decorative images used behind the homepage hero or category cards. They live in `images/backgrounds/`.
- **Gallery photographs** are the actual work visitors browse and open in the lightbox. They live in `images/galleries/`.

## No limit on gallery photographs

There is **no six-photo limit** for any gallery category. You can add as many photographs as you need to Commercial, Real Estate, Portraits, Concerts and Events.

The gallery displays every photo entry listed in the matching category's `photos` array in `assets/js/gallery.js`. The current Concerts and Real Estate collections include the uploaded photographs. Other collections stay empty until photos are uploaded and entries are added; there is no fixed maximum.

## Recommended upload names

### Hero backgrounds
`images/backgrounds/hero/hero-01.webp` … `hero-05.webp`

### Portfolio card covers
`images/backgrounds/portfolio/real-estate-cover.webp`
`images/backgrounds/portfolio/portraits-cover.webp`
`images/backgrounds/portfolio/concerts-cover.webp`
`images/backgrounds/portfolio/events-cover.webp`

### Gallery photographs
Upload each photograph into its matching category folder:

- `images/galleries/commercial/`
- `images/galleries/real-estate/`
- `images/galleries/portraits/`
- `images/galleries/concerts/`
- `images/galleries/events/`

Then add an entry for each new image to that category's `photos` array in `assets/js/gallery.js`. For example:

```js
photos: [
  ["First photograph", "images/galleries/events/event-01.webp"],
  ["Second photograph", "images/galleries/events/event-02.webp"],
  ["Another photograph", "images/galleries/events/event-07.webp"],
  ["One more photograph", "images/galleries/events/event-08.webp"]
]
```

The first value is alternative text for screen readers and image controls, not a visible caption. Photos are displayed without titles or descriptions.

Keep adding entries separated by commas. There is no fixed maximum; the gallery grid and lightbox navigation include all entries automatically.

## Image recommendations

- Hero backgrounds: landscape, 16:9, around 1920×1080.
- Portfolio covers: landscape or square crops, ideally at least 1200px wide.
- Gallery photographs: high-quality JPG or WebP, ideally 1600–2400px on the long edge.
- Use descriptive lowercase names, e.g. `shreya-ghoshal-o2-01.webp`.

## Updating paths

After uploading a background, enable its path in `assets/css/styles.css`; hero slots and categories without covers use gradients by default. If you use a different filename, edit the corresponding path in `assets/js/gallery.js` (gallery photos) or `assets/css/styles.css` (backgrounds). File paths are case-sensitive on most hosting platforms.
