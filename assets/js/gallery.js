/* RJV STUDIOS — GALLERY CONTENT
   Add as many photographs as you like to each category — there is no six-photo limit.
   Upload files to images/galleries/<category>/, then add one [caption, path] entry
   per photograph in the matching photos array below. Paths are relative to the website root.
   The gallery renders every entry in each array; do not remove entries to stay under a limit.
*/
const collections = {
  "real-estate": {
    title: "Real Estate",
    description: "Spaces, architecture and interiors, captured with clarity and character.",
    photos: [
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
    photos: []
  },
  "concerts": {
    title: "Concerts",
    description: "The energy of live music, from the stage lights to the crowd.",
    photos: [
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
    photos: []
  },
  "commercial": {
    title: "Commercial",
    description: "Brand, product and business imagery made to help companies stand out.",
    photos: []
  }
};

const params = new URLSearchParams(window.location.search);
const key = params.get("category") || "concerts";
const collection = Object.hasOwn(collections, key) ? collections[key] : null;
const title = document.getElementById("gallery-title");
const description = document.getElementById("gallery-description");
const grid = document.getElementById("gallery-grid");
const empty = document.getElementById("empty-state");
const count = document.getElementById("photo-count");

if (collection) {
  document.title = collection.title + " Gallery | RJV Studios";
  title.textContent = collection.title;
  description.textContent = collection.description;
  count.textContent = collection.photos.length + (collection.photos.length === 1 ? " image" : " images");
  if (collection.photos.length === 0) empty.style.display = "block";
  collection.photos.forEach(([caption, src], index) => {
    const figure = document.createElement("figure");
    figure.className = "photo";
    const img = document.createElement("img");
    img.src = src;
    img.alt = caption;
    img.loading = "lazy";
    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "photo-open";
    openButton.setAttribute("aria-label", "Open " + caption);
    img.addEventListener("error", () => {
      openButton.disabled = true;
      figure.classList.add("image-missing");
      img.removeAttribute("src");
      img.alt = caption + " — image unavailable";
    }, { once: true });
    const figcaption = document.createElement("figcaption");
    const category = document.createElement("span");
    category.textContent = collection.title;
    figcaption.append(category, document.createTextNode(caption));
    openButton.appendChild(img);
    figure.append(openButton, figcaption);
    openButton.addEventListener("click", () => {
      if (img.complete && img.naturalWidth > 0) openLightbox(index);
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
const closeButton = document.getElementById("close-lightbox");
const previousButton = document.getElementById("prev-photo");
const nextButton = document.getElementById("next-photo");
const pageContent = document.querySelectorAll("header, main, footer");
function openLightbox(index) {
  if (!collection || collection.photos.length === 0) return;
  activeIndex = index;
  const [caption, src] = collection.photos[activeIndex];
  lightboxImage.src = src;
  lightboxImage.alt = caption;
  if (!lightbox.classList.contains("open")) {
    previousFocus = document.activeElement;
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
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = previousOverflow;
  pageContent.forEach(element => { element.inert = false; });
  previousFocus?.focus();
}
function movePhoto(step) {
  if (!collection || collection.photos.length === 0) return;
  activeIndex = (activeIndex + step + collection.photos.length) % collection.photos.length;
  openLightbox(activeIndex);
}
closeButton.addEventListener("click", closeLightbox);
previousButton.addEventListener("click", () => movePhoto(-1));
nextButton.addEventListener("click", () => movePhoto(1));
lightbox.addEventListener("click", event => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", event => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    movePhoto(-1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    movePhoto(1);
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
