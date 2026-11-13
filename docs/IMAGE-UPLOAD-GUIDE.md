# Photo and Video Upload Guide

## Keep backgrounds and gallery media separate

- **Backgrounds** are decorative images used behind the homepage hero or category cards. They live in `images/backgrounds/`.
- **Gallery photos and videos** are the actual work visitors browse and open in the viewer. Both live in `images/galleries/`, in the relevant category folder.

## Photos and videos in every category

Commercial, Real Estate, Portraits, Concerts and Events each support any mixture of photos and videos. There is **no six-item limit** or category restriction.

The gallery displays every entry listed in the matching category's `media` array in `assets/js/gallery.js`. The current Concerts and Real Estate collections include the uploaded photographs. Other collections stay empty until media files are uploaded and entries are added; there is no fixed maximum.

## Recommended upload names

### Hero backgrounds
`images/backgrounds/hero/hero-01.webp` … `hero-05.webp`

### Portfolio card covers
`images/backgrounds/portfolio/real-estate-cover.webp`
`images/backgrounds/portfolio/portraits-cover.webp`
`images/backgrounds/portfolio/concerts-cover.webp`
`images/backgrounds/portfolio/events-cover.webp`

### Gallery photos and videos
Upload each file into its matching category folder:

- `images/galleries/commercial/`
- `images/galleries/real-estate/`
- `images/galleries/portraits/`
- `images/galleries/concerts/`
- `images/galleries/events/`

Then add an entry for each file to that category's `media` array in `assets/js/gallery.js`. For example:

```js
media: [
  ["Event photograph", "images/galleries/events/event-01.webp"],
  ["Event highlights", "images/galleries/events/highlights.mp4"],
  ["Behind the scenes", "images/galleries/events/behind-the-scenes.webm",
    "images/galleries/events/video-poster.webp"]
]
```

The first value is alternative text for screen readers and player controls, not a visible caption. Photos and videos are displayed without file titles or descriptions. The second value is the file path. For a video, the optional third value is a poster image displayed before playback. Use a poster if you want to choose the thumbnail; otherwise the browser can display a frame from the video.

Keep adding entries separated by commas. The gallery and viewer include all entries in order. The example files are illustrative: upload them before adding these entries to avoid broken requests.

## Video recommendations

- Use MP4 with H.264 video and AAC audio for broad browser support, or WebM with browser-supported codecs.
- `.mp4`, `.webm`, `.ogv`, `.ogg` and `.m4v` paths are recognized as videos. Extension detection is case-insensitive and allows query strings. A recognized extension still needs a browser-compatible codec.
- Convert MOV and other camera formats to MP4 or WebM before uploading.
- Export a web-sized version, typically 1080p, with a reasonable bitrate. For MP4, enable fast start/web optimization so metadata loads before the full video.
- Supply a JPG or WebP poster image for a predictable thumbnail.
- Playback starts when visitors open a video, with play/pause, seeking, volume and fullscreen controls supplied by their browser. Thumbnails do not autoplay; leaving an item stops its video.


## Image recommendations

- Hero backgrounds: landscape, 16:9, around 1920×1080.
- Portfolio covers: landscape or square crops, ideally at least 1200px wide.
- Gallery photographs: high-quality JPG or WebP, ideally 1600–2400px on the long edge.
- Use descriptive lowercase names, e.g. `shreya-ghoshal-o2-01.webp`.

## Updating paths

After uploading a background, enable its path in `assets/css/styles.css`; hero slots and categories without covers use gradients by default. If you use a different filename, edit the corresponding path in `assets/js/gallery.js` (gallery photos/videos) or `assets/css/styles.css` (backgrounds). File paths are case-sensitive on most hosting platforms.

## Automatic optimization

Run `npm ci` once, then `npm run build` after uploads; Vercel runs these steps automatically. The build creates responsive WebP variants and records image dimensions so photos do not jump around as they load. Keep original file paths in the gallery configuration and CSS; the generated site substitutes compact preview/viewer versions. Originals are preserved. Do not add generated `dist/assets/media/` paths to the source configuration.
