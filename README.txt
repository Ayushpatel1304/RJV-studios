RJV STUDIOS — TWO-PAGE PHOTOGRAPHY PORTFOLIO

FILES
- index.html: homepage, updated so portfolio tiles open a matching gallery.
- gallery.html: second page. The category is selected from the URL query string.
- images/galleries/: put your own gallery images here.

UPLOAD
Upload index.html, gallery.html, and the images folder to the root of your GitHub repository.
Keep index.html and gallery.html side by side.

GALLERY LINKS
- gallery.html?category=real-estate
- gallery.html?category=portraits
- gallery.html?category=concerts
- gallery.html?category=events

REPLACE SAMPLE PHOTOS
Open gallery.html and find the collections object in the script near the bottom.
Each photo entry is [caption, image URL]. Replace the sample URL with a path to your own
image, for example:
["Garba Night","images/galleries/events/garba-night-01.webp"]

Add more entries by copying an existing [caption, image URL] line.
The supplied page uses sample images from Unsplash until you replace them.

DEPLOY
Commit both HTML files and your image folders to GitHub. Cloudflare Pages will redeploy
automatically. No build step is needed for this plain HTML site.
