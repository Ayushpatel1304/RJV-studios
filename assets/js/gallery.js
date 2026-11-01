/* RJV STUDIOS — GALLERY CONTENT
   Add your photographs to the matching images/galleries/<category>/ folder.
   Then update the filenames in this file. Paths are relative to the website root.
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
      ["The Finishing Touches","images/galleries/real-estate/real-estate-06.webp"]
    ]
  },
  "portraits": {
    title: "Portraits",
    description: "People, personality and expression — thoughtfully photographed.",
    photos: [
      ["Portrait Study","images/galleries/portraits/portrait-01.webp"],
      ["Natural Light","images/galleries/portraits/portrait-02.webp"],
      ["Character","images/galleries/portraits/portrait-03.webp"],
      ["Studio Portrait","images/galleries/portraits/portrait-04.webp"],
      ["In Focus","images/galleries/portraits/portrait-05.webp"],
      ["The Details","images/galleries/portraits/portrait-06.webp"]
    ]
  },
  "concerts": {
    title: "Concerts",
    description: "The energy of live music, from the stage lights to the crowd.",
    photos: [
      ["On Stage","images/galleries/concerts/concert-01.webp"],
      ["Live Energy","images/galleries/concerts/concert-02.webp"],
      ["Under the Lights","images/galleries/concerts/concert-03.webp"],
      ["The Crowd","images/galleries/concerts/concert-04.webp"],
      ["A Moment in Music","images/galleries/concerts/concert-05.webp"],
      ["After Dark","images/galleries/concerts/concert-06.webp"]
    ]
  },
  "events": {
    title: "Events",
    description: "Real moments and thoughtful details from celebrations and special occasions.",
    photos: [
      ["The Celebration","images/galleries/events/event-01.webp"],
      ["The Details","images/galleries/events/event-02.webp"],
      ["Together","images/galleries/events/event-03.webp"],
      ["The Venue","images/galleries/events/event-04.webp"],
      ["A Special Moment","images/galleries/events/event-05.webp"],
      ["Evening Atmosphere","images/galleries/events/event-06.webp"]
    ]
  },
  "commercial": {
    title: "Commercial",
    description: "Brand, product and business imagery made to help companies stand out.",
    photos: [
      ["Brand Story","images/galleries/commercial/commercial-01.webp"],
      ["Product Details","images/galleries/commercial/commercial-02.webp"],
      ["Business in Focus","images/galleries/commercial/commercial-03.webp"],
      ["Campaign Image","images/galleries/commercial/commercial-04.webp"],
      ["Creative Direction","images/galleries/commercial/commercial-05.webp"],
      ["The Final Frame","images/galleries/commercial/commercial-06.webp"]
    ]
  }
};

const params = new URLSearchParams(window.location.search);
const key = params.get("category") || "concerts";
const collection = collections[key];
const title = document.getElementById("gallery-title");
const description = document.getElementById("gallery-description");
const grid = document.getElementById("gallery-grid");
const empty = document.getElementById("empty-state");
const count = document.getElementById("photo-count");

if (collection) {
  document.title = collection.title + " Gallery | RJV Studios";
  title.textContent = collection.title;
  description.textContent = collection.description;
  count.textContent = collection.photos.length + " image slots";
  collection.photos.forEach(([caption, src], index) => {
    const figure = document.createElement("figure");
    figure.className = "photo";
    const img = document.createElement("img");
    img.src = src;
    img.alt = caption;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      figure.classList.add("image-missing");
      img.removeAttribute("src");
      img.alt = caption + " — add the image file to " + src;
    }, { once: true });
    const figcaption = document.createElement("figcaption");
    const category = document.createElement("span");
    category.textContent = collection.title;
    figcaption.append(category, document.createTextNode(caption));
    figure.append(img, figcaption);
    figure.addEventListener("click", () => {
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
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
function openLightbox(index) {
  if (!collection) return;
  activeIndex = index;
  const [caption, src] = collection.photos[activeIndex];
  lightboxImage.src = src;
  lightboxImage.alt = caption;
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}
function movePhoto(step) {
  if (!collection) return;
  activeIndex = (activeIndex + step + collection.photos.length) % collection.photos.length;
  openLightbox(activeIndex);
}
document.getElementById("close-lightbox").addEventListener("click", closeLightbox);
document.getElementById("prev-photo").addEventListener("click", () => movePhoto(-1));
document.getElementById("next-photo").addEventListener("click", () => movePhoto(1));
lightbox.addEventListener("click", event => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", event => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") movePhoto(-1);
  if (event.key === "ArrowRight") movePhoto(1);
});
