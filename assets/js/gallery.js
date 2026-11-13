/* RJV STUDIOS — GALLERY CONTENT
   Add photos and videos to any category — there is no fixed item limit.
   Upload files to images/galleries/<category>/, then add one [altText, path, optionalPoster]
   entry to the matching media array. MP4, WebM, OGV, OGG and M4V paths are videos;
   other paths are images. Posters are optional image paths for video thumbnails.
   All paths are relative to the website root.
   The gallery renders every entry in each array; do not remove entries to stay under a limit.
*/
const collections = {
  "real-estate": {
    title: "Real Estate",
    description: "Spaces, architecture and interiors, captured with clarity and character.",
    media: [
      ["Interior Details","images/galleries/real-estate/real-estate-01.webp"],
      ["Contemporary Living","images/galleries/real-estate/real-estate-02.webp"],
      ["Architectural Lines","images/galleries/real-estate/real-estate-03.webp"],
      ["A Place to Unwind","images/galleries/real-estate/real-estate-04.webp"],
      ["Modern Spaces","images/galleries/real-estate/real-estate-05.webp"],
      ["The Finishing Touches","images/galleries/real-estate/real-estate-06.webp"],
      ["Real Estate 07","images/galleries/real-estate/real-estate-07.webp"],
      ["Real Estate 08","images/galleries/real-estate/real-estate-08.webp"],
      ["Real Estate 09","images/galleries/real-estate/real-estate-09.webp"]
    ]
  },
  "portraits": {
    title: "Portraits",
    description: "People, personality and expression — thoughtfully photographed.",
    media: []
  },
  "concerts": {
    title: "Concerts",
    description: "The energy of live music, from the stage lights to the crowd.",
    media: [
      ["On Stage","images/galleries/concerts/concert-01.webp"],
      ["Live Energy","images/galleries/concerts/concerts-02.webp"],
      ["Under the Lights","images/galleries/concerts/concerts-03.jpg"],
      ["The Crowd","images/galleries/concerts/concerts-04.webp"],
      ["A Moment in Music","images/galleries/concerts/concerts-05.webp"],
      ["After Dark","images/galleries/concerts/concerts-06.webp"],
      ["Live Music 07","images/galleries/concerts/concerts-07.webp"],
      ["Live Music 08","images/galleries/concerts/concerts-08.webp"],
      ["Live Music 09","images/galleries/concerts/concerts-09.webp"],
      ["Live Music 10","images/galleries/concerts/concerts-10.webp"],
      ["Live Music 11","images/galleries/concerts/concerts-11.jpg"],
      ["Live Music 12","images/galleries/concerts/concerts-12.webp"],
      ["Live Music 13","images/galleries/concerts/concerts-13.webp"],
      ["Live Music 14","images/galleries/concerts/concerts-14.webp"],
      ["Live Music 15","images/galleries/concerts/concerts-15.webp"]
    ]
  },
  "events": {
    title: "Events",
    description: "Real moments and thoughtful details from celebrations and special occasions.",
    media: []
  },
  "commercial": {
    title: "Commercial",
    description: "Brand, product and business imagery made to help companies stand out.",
    media: []
  }
};

const params = new URLSearchParams(window.location.search);
const key = params.get("category") || "concerts";
const collection = Object.hasOwn(collections, key) ? collections[key] : null;
const title = document.getElementById("gallery-title");
const description = document.getElementById("gallery-description");
const grid = document.getElementById("gallery-grid");
const empty = document.getElementById("empty-state");
const count = document.getElementById("media-count");
const mediaItems = collection?.media || [];
const isVideo = src => /\.(mp4|webm|ogv|ogg|m4v)(?:[?#]|$)/i.test(src);

const imageMap = window.RJV_MEDIA || {};
const previewSizes = "(max-width: 560px) calc(100vw - 50px), (max-width: 850px) calc(50vw - 33px), (max-width: 1180px) calc(33.333vw - 28px), 365px";
function imageVariant(src, minimumWidth = 960) {
  const image = imageMap[src];
  return image && (image.variants.find(item => item.width >= minimumWidth) || image.variants.at(-1));
}
function setImage(image, src, sizes) {
  const info = imageMap[src];
  image.dataset.source = src;
  image.decoding = "async";
  image.removeAttribute("srcset");
  image.removeAttribute("sizes");
  if (info) {
    image.width = info.width;
    image.height = info.height;
    image.style.aspectRatio = `${info.width} / ${info.height}`;
    image.sizes = sizes;
    image.srcset = info.variants.map(item => `${item.src} ${item.width}w`).join(", ");
    image.src = imageVariant(src).src;
  } else {
    image.removeAttribute("width");
    image.removeAttribute("height");
    image.style.removeProperty("aspect-ratio");
    image.src = src;
  }
}
const videoObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.src = entry.target.dataset.videoSource;
    videoObserver.unobserve(entry.target);
  }
}, { rootMargin: "300px" }) : null;

if (collection) {
  document.title = collection.title + " Gallery | RJV Studios";
  title.textContent = collection.title;
  description.textContent = collection.description;
  const videoCount = mediaItems.filter(([, src]) => isVideo(src)).length;
  const imageCount = mediaItems.length - videoCount;
  const totals = [];
  if (imageCount) totals.push(imageCount + (imageCount === 1 ? " image" : " images"));
  if (videoCount) totals.push(videoCount + (videoCount === 1 ? " video" : " videos"));
  count.textContent = totals.join(" · ") || "0 items";
  if (mediaItems.length === 0) empty.style.display = "block";
  mediaItems.forEach(([altText, src, poster], index) => {
    const video = isVideo(src);
    const figure = document.createElement("figure");
    figure.className = "media-item" + (video ? " video-item" : "");
    const preview = document.createElement(video ? "video" : "img");
    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "media-open";
    openButton.setAttribute("aria-label", (video ? "Play " : "Open ") + altText);
    if (video) {
      preview.preload = poster ? "none" : "metadata";
      preview.muted = true;
      preview.playsInline = true;
      preview.tabIndex = -1;
      preview.setAttribute("aria-hidden", "true");
      if (poster) {
        preview.poster = imageVariant(poster)?.src || poster;
        const dimensions = imageMap[poster];
        if (dimensions) preview.style.aspectRatio = `${dimensions.width} / ${dimensions.height}`;
      }
      const playIcon = document.createElement("span");
      playIcon.className = "video-play";
      playIcon.textContent = "▶︎";
      playIcon.setAttribute("aria-hidden", "true");
      openButton.appendChild(playIcon);
    } else {
      preview.alt = altText;
      preview.loading = index === 0 ? "eager" : "lazy";
      if (index === 0) preview.fetchPriority = "high";
    }
    preview.addEventListener("error", () => {
      openButton.disabled = true;
      openButton.setAttribute("aria-label", altText + " — media unavailable");
      figure.classList.add("media-missing");
      if (!video) preview.alt = altText + " — image unavailable";
    }, { once: true });
    if (!video) setImage(preview, src, previewSizes);
    else if (!poster && videoObserver) {
      preview.dataset.videoSource = src;
      videoObserver.observe(preview);
    } else preview.src = src;
    openButton.appendChild(preview);
    figure.appendChild(openButton);
    openButton.addEventListener("click", () => {
      if (video || (preview.complete && preview.naturalWidth > 0)) openLightbox(index, openButton);
    });
    grid.appendChild(figure);
  });
} else {
  title.textContent = "Collection not found";
  description.textContent = "Choose a collection from the RJV Studios portfolio.";
  count.textContent = "";
  empty.style.display = "block";
}

let activeIndex = 0;
let previousFocus = null;
let previousOverflow = "";
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxVideo = document.getElementById("lightbox-video");
const lightboxError = document.getElementById("lightbox-error");
const closeButton = document.getElementById("close-lightbox");
const previousButton = document.getElementById("prev-media");
const nextButton = document.getElementById("next-media");
const pageContent = document.querySelectorAll("header, main, footer");
function stopVideo() {
  if (!lightboxVideo.hasAttribute("src")) return;
  lightboxVideo.pause();
  lightboxVideo.removeAttribute("src");
  lightboxVideo.load();
}
function openLightbox(index, opener = document.activeElement) {
  if (mediaItems.length === 0) return;
  activeIndex = index;
  const [altText, src, poster] = mediaItems[activeIndex];
  const video = isVideo(src);
  stopVideo();
  lightboxError.hidden = true;
  lightboxImage.hidden = video;
  lightboxVideo.hidden = !video;
  lightbox.classList.toggle("showing-video", video);
  lightbox.setAttribute("aria-label", video ? "Expanded video" : "Expanded photograph");
  if (video) {
    lightboxImage.removeAttribute("srcset");
    lightboxImage.removeAttribute("src");
    lightboxVideo.setAttribute("aria-label", altText);
    if (poster) lightboxVideo.poster = imageVariant(poster, 1920)?.src || poster;
    else lightboxVideo.removeAttribute("poster");
    lightboxVideo.src = src;
    // Opening a video is a user action; native controls remain available if play is blocked.
    lightboxVideo.play().catch(() => {});
  } else {
    setImage(lightboxImage, src, "(max-width: 1200px) 92vw, 1100px");
    lightboxImage.alt = altText;
  }
  if (!lightbox.classList.contains("open")) {
    previousFocus = opener;
    previousOverflow = document.body.style.overflow;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    pageContent.forEach(element => { element.inert = true; });
    closeButton.focus();
  }
}
function closeLightbox() {
  if (!lightbox.classList.contains("open")) return;
  stopVideo();
  lightboxImage.removeAttribute("srcset");
  lightboxImage.removeAttribute("src");
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = previousOverflow;
  pageContent.forEach(element => { element.inert = false; });
  previousFocus?.focus();
}
function moveMedia(step) {
  if (mediaItems.length === 0) return;
  activeIndex = (activeIndex + step + mediaItems.length) % mediaItems.length;
  openLightbox(activeIndex);
}
lightboxVideo.addEventListener("error", () => {
  if (lightboxVideo.hidden || !lightboxVideo.error) return;
  lightboxError.textContent = "This video could not be played. Please try another item.";
  lightboxError.hidden = false;
});
closeButton.addEventListener("click", closeLightbox);
previousButton.addEventListener("click", () => moveMedia(-1));
nextButton.addEventListener("click", () => moveMedia(1));
lightbox.addEventListener("click", event => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", event => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft" && event.target !== lightboxVideo) {
    event.preventDefault();
    moveMedia(-1);
  }
  if (event.key === "ArrowRight" && event.target !== lightboxVideo) {
    event.preventDefault();
    moveMedia(1);
  }
  if (event.key === "Tab") {
    const first = closeButton;
    const last = nextButton;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
