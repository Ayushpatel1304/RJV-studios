"""Regressions against Vercel's static build output; no real enquiries are sent."""

import base64
import functools
import hashlib
import json
from datetime import date, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import shlex
import subprocess
import threading
import unittest
from urllib.parse import parse_qs

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError):
            # Navigating away can cancel an in-flight lazy image request.
            pass


class VercelSiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = json.loads((ROOT / "vercel.json").read_text())
        cls.output = ROOT / cls.config["outputDirectory"]
        cls.build_command = shlex.split(cls.config["buildCommand"])
        subprocess.run(cls.build_command, cwd=ROOT, check=True)
        manifest_script = (cls.output / "assets/js/media-manifest.js").read_text()
        cls.media_manifest = json.loads(manifest_script.removeprefix("window.RJV_MEDIA = ").strip().removesuffix(";"))
        cls.server = ThreadingHTTPServer(
            ("127.0.0.1", 0), functools.partial(QuietHandler, directory=str(cls.output))
        )
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.base = f"http://127.0.0.1:{cls.server.server_port}/"
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(
            executable_path=shutil.which("chromium") or shutil.which("chromium-browser"),
            args=["--no-sandbox"],
        )

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.server_thread.join()

    def setUp(self):
        self.context = self.browser.new_context(
            viewport={"width": 1280, "height": 900}, reduced_motion="reduce"
        )
        self.context.route("https://fonts.googleapis.com/**", lambda route: route.abort())
        self.context.route("https://fonts.gstatic.com/**", lambda route: route.abort())
        # Block real submissions even if a test fails before installing its mock.
        self.context.route("https://formspree.io/**", lambda route: route.abort())
        self.page = self.context.new_page()
        self.errors = []
        self.missing = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))
        self.page.on("console", self.check_console)
        self.page.on("response", self.check_response)

    def check_console(self, message):
        if message.type == "error" and "Pattern attribute" in message.text:
            self.errors.append(message.text)

    def check_response(self, response):
        if response.url.startswith(self.base) and response.status >= 400:
            self.missing.append(response.url)

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [], "Browser JavaScript errors")
        self.assertEqual(self.missing, [], "Failed local requests")

    def visit(self, path="index.html"):
        self.page.goto(self.base + path)

    def test_vercel_build_output(self):
        self.assertIsNone(self.config["framework"])
        self.assertEqual(self.config["installCommand"], "npm ci")
        self.assertFalse(self.config["cleanUrls"], "Existing .html gallery links must keep working")
        # Rebuilding removes old output instead of deploying deleted files from a cache.
        stale_file = self.output / "stale-file.txt"
        stale_file.write_text("Should not be published")
        subprocess.run(self.build_command, cwd=ROOT, check=True)
        self.assertFalse(stale_file.exists())
        self.assertEqual(
            {path.name for path in self.output.iterdir()},
            {"index.html", "gallery.html", "assets", "images"},
        )
        for path in self.output.rglob("*"):
            if path.is_file():
                with self.subTest(path=path.relative_to(self.output)):
                    self.assertFalse(path.name.startswith("."))
                    source = ROOT / path.relative_to(self.output)
                    relative_path = path.relative_to(self.output).as_posix()
                    generated = {"assets/js/media-manifest.js"} | {
                        item["src"] for data in self.media_manifest.values() for item in data["variants"]
                    }
                    if relative_path in generated:
                        self.assertGreater(path.stat().st_size, 0)
                    elif relative_path.startswith("assets/css/"):
                        self.assertTrue(source.is_file())
                    else:
                        self.assertEqual(
                            hashlib.sha256(path.read_bytes()).digest(),
                            hashlib.sha256(source.read_bytes()).digest(),
                        )
        for private_path in ("tests/test_site.py", "requirements-dev.txt", "vercel.json", ".git/config", "package-lock.json", "node_modules/sharp/package.json"):
            with self.subTest(path=private_path):
                response = self.context.request.get(self.base + private_path)
                self.assertEqual(response.status, 404)

    def test_all_uploaded_photographs_are_available(self):
        for category in ("concerts", "real-estate"):
            with self.subTest(category=category):
                self.visit("gallery.html?category=" + category)
                photos = self.page.locator(".media-item img")
                expected = {
                    path.relative_to(ROOT).as_posix()
                    for path in (ROOT / "images/galleries" / category).iterdir()
                    if path.suffix.lower() in {".webp", ".jpg", ".jpeg", ".png"}
                }
                actual = set(photos.evaluate_all("images => images.map(img => img.dataset.source)"))
                self.assertEqual(actual, expected)
                expect(self.page.locator("#media-count")).to_have_text(f"{len(expected)} images")
                for image in photos.all():
                    image.scroll_into_view_if_needed()
                    expect(image).to_have_js_property("complete", True)
                    self.assertGreater(image.evaluate("img => img.naturalWidth"), 0)

    def test_responsive_images_keep_masonry_stable(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.page.add_init_script("""window.layoutShift = 0;
            new PerformanceObserver(list => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) window.layoutShift += entry.value;
                }
            }).observe({type: 'layout-shift', buffered: true});""")
        cdp = self.context.new_cdp_session(self.page)
        cdp.send("Network.enable")
        cdp.send("Network.setCacheDisabled", {"cacheDisabled": True})
        cdp.send("Network.emulateNetworkConditions", {
            "offline": False, "latency": 150, "downloadThroughput": 250000,
            "uploadThroughput": 250000,
        })
        self.page.goto(self.base + "gallery.html?category=concerts", wait_until="domcontentloaded")
        images = self.page.locator("#gallery-grid img")
        before = images.evaluate_all("els => els.map(el => ({height:el.getBoundingClientRect().height,top:el.getBoundingClientRect().top}))")
        for image in images.all():
            self.assertGreater(int(image.get_attribute("width")), 0)
            self.assertGreater(int(image.get_attribute("height")), 0)
            self.assertTrue(image.get_attribute("srcset"))
            expect(image).to_have_attribute("decoding", "async")
            image.evaluate("el => { el.loading = 'eager'; }")
        self.page.wait_for_function("[...document.querySelectorAll('#gallery-grid img')].every(img => img.complete && img.naturalWidth > 0)")
        after = images.evaluate_all("els => els.map(el => ({height:el.getBoundingClientRect().height,top:el.getBoundingClientRect().top}))")
        for original, loaded in zip(before, after):
            self.assertAlmostEqual(original["height"], loaded["height"], delta=1)
            self.assertAlmostEqual(original["top"], loaded["top"], delta=1)
        self.assertLess(self.page.evaluate("window.layoutShift"), 0.01)

    def test_gallery_previews_do_not_fetch_original_files(self):
        requested_images = []
        self.page.on("request", lambda req: requested_images.append(req.url)
                     if req.resource_type == "image" else None)
        self.visit("gallery.html?category=concerts")
        for image in self.page.locator("#gallery-grid img").all():
            image.scroll_into_view_if_needed()
            expect(image).to_have_js_property("complete", True)
        self.page.locator(".media-open").first.click()
        full_image = self.page.locator("#lightbox-image")
        expect(full_image).to_have_js_property("complete", True)
        self.assertGreater(full_image.evaluate("img => img.naturalWidth"), 0)
        self.assertTrue(requested_images)
        self.assertTrue(all("/assets/media/" in url for url in requested_images), requested_images)
        originals = sum((ROOT / path).stat().st_size for path in self.media_manifest
                        if path.startswith("images/galleries/concerts/"))
        previews = sum((self.output / data["variants"][0]["src"]).stat().st_size
                       for path, data in self.media_manifest.items()
                       if path.startswith("images/galleries/concerts/"))
        self.assertLess(previews, originals * 0.2)

    def test_empty_and_invalid_categories(self):
        for category in ("portraits", "events", "commercial", "unknown", "__proto__", "constructor", "toString"):
            with self.subTest(category=category):
                self.visit("gallery.html?category=" + category)
                expect(self.page.locator("#empty-state")).to_be_visible()
                expect(self.page.locator(".media-item")).to_have_count(0)
                if category in {"portraits", "events", "commercial"}:
                    expect(self.page.locator("#media-count")).to_have_text("0 items")
                else:
                    expect(self.page.locator("#gallery-title")).to_have_text("Collection not found")

    def test_home_assets_and_responsive_layout(self):
        for path in ("", "gallery.html?category=concerts"):
            for width in (320, 390, 720, 768, 1280):
                with self.subTest(path=path, width=width):
                    self.page.set_viewport_size({"width": width, "height": 900})
                    self.visit(path)
                    self.page.locator("footer").scroll_into_view_if_needed()
                    self.assertLessEqual(
                        self.page.evaluate("document.documentElement.scrollWidth"), width
                    )
                    self.page.locator("header").scroll_into_view_if_needed()
                    if width > 720:
                        for link in self.page.locator(".nav-links a").all():
                            expect(link).to_be_visible()
                            box = link.bounding_box()
                            self.assertLessEqual(box["x"] + box["width"], width)
        self.visit("gallery.html")
        hero = self.page.locator(".hero").bounding_box()
        self.assertLess(hero["height"], 900, "Gallery hero should not occupy a full viewport")

    def test_mobile_navigation_by_keyboard(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        for path in ("index.html", "gallery.html?category=concerts"):
            with self.subTest(path=path):
                self.visit(path)
                toggle = self.page.locator("#menu-toggle")
                links = self.page.locator(".nav-links a")
                expect(links.first).not_to_be_visible()
                toggle.focus()
                self.page.keyboard.press("Enter")
                expect(toggle).to_have_attribute("aria-expanded", "true")
                for link in links.all():
                    expect(link).to_be_visible()
                self.page.keyboard.press("Escape")
                expect(toggle).to_be_focused()
                expect(links.first).not_to_be_visible()
                toggle.click()
                links.first.click()
                expect(toggle).to_have_attribute("aria-expanded", "false")
                # A resize must not leave an old open-menu state behind.
                toggle.click()
                self.page.set_viewport_size({"width": 1280, "height": 900})
                expect(toggle).to_have_attribute("aria-expanded", "false")
                self.page.set_viewport_size({"width": 390, "height": 844})
                expect(self.page.locator(".nav-links a").first).not_to_be_visible()

    def test_lightbox_keyboard_and_focus(self):
        self.visit("gallery.html?category=concerts")
        first = self.page.locator(".media-open").first
        first.scroll_into_view_if_needed()
        self.page.wait_for_function("document.querySelector('.media-item img').naturalWidth > 0")
        first.focus()
        self.page.keyboard.press("Enter")
        dialog = self.page.get_by_role("dialog")
        expect(dialog).to_be_visible()
        close = self.page.get_by_role("button", name="Close", exact=True)
        expect(close).to_be_focused()
        self.assertTrue(self.page.locator("main").evaluate("el => el.inert"))
        self.assertEqual(self.page.evaluate("document.body.style.overflow"), "hidden")
        images = self.page.locator(".media-item img").evaluate_all("els => els.map(el => el.dataset.source)")
        self.page.keyboard.press("ArrowLeft")
        expect(self.page.locator("#lightbox-image")).to_have_attribute("data-source", images[-1])
        self.page.keyboard.press("ArrowRight")
        expect(self.page.locator("#lightbox-image")).to_have_attribute("data-source", images[0])
        self.page.get_by_role("button", name="Next item").click()
        expect(self.page.locator("#lightbox-image")).to_have_attribute("data-source", images[1])
        self.page.keyboard.press("Tab")
        expect(close).to_be_focused()
        self.page.keyboard.press("Shift+Tab")
        expect(self.page.get_by_role("button", name="Next item")).to_be_focused()
        self.page.keyboard.press("Escape")
        expect(dialog).not_to_be_visible()
        expect(first).to_be_focused()
        self.assertFalse(self.page.locator("main").evaluate("el => el.inert"))
        self.assertEqual(self.page.evaluate("document.body.style.overflow"), "")
        first.press("Space")
        expect(dialog).to_be_visible()
        dialog.click(position={"x": 5, "y": 5})
        expect(dialog).not_to_be_visible()
        expect(first).to_be_focused()

    def inject_media(self, replacements):
        """Use real clips without publishing test content in any live collection."""
        script = (self.output / "assets/js/gallery.js").read_text()
        updates = "\n".join(
            f"collections[{json.dumps(category)}].media = {json.dumps(entries)};"
            for category, entries in replacements.items()
        )
        script = script.replace("const params =", updates + "\nconst params =", 1)
        self.page.route("**/assets/js/gallery.js", lambda route: route.fulfill(
            content_type="application/javascript", body=script
        ))

        def serve_clip(body, extension):
            def handler(route):
                route.fulfill(content_type="video/" + extension, body=body)
            return handler

        for extension in ("mp4", "webm"):
            clip = base64.b64decode((ROOT / f"tests/fixtures/video.{extension}.base64").read_text())
            self.page.route(
                f"**/__test__/clip.{extension}*",
                serve_clip(clip, extension),
            )

    def test_video_playback_in_every_category(self):
        categories = ("commercial", "real-estate", "portraits", "concerts", "events")
        for extension in ("mp4", "webm"):
            self.inject_media({
                category: [["Test clip", f"__test__/clip.{extension}",
                            "images/backgrounds/portfolio/real-estate-cover.webp"]]
                for category in categories
            })
            for category in categories:
                with self.subTest(category=category, format=extension):
                    self.visit("gallery.html?category=" + category)
                    expect(self.page.locator("#media-count")).to_have_text("1 video")
                    expect(self.page.locator("figcaption")).to_have_count(0)
                    thumbnail = self.page.locator(".media-item video")
                    expect(thumbnail).to_have_js_property("muted", True)
                    expect(thumbnail).to_have_js_property("paused", True)
                    expect(thumbnail).to_have_attribute("preload", "none")
                    expect(thumbnail).to_have_attribute(
                        "poster", next(item["src"] for item in self.media_manifest[
                            "images/backgrounds/portfolio/real-estate-cover.webp"
                        ]["variants"] if item["width"] >= 960)
                    )
                    button = self.page.get_by_role("button", name="Play Test clip")
                    button.click()
                    player = self.page.locator("#lightbox-video")
                    expect(player).to_be_visible()
                    expect(player).to_have_js_property("controls", True)
                    expect(player).to_have_js_property("playsInline", True)
                    expect(self.page.locator("#lightbox-image")).not_to_be_visible()
                    self.page.wait_for_function(
                        "document.getElementById('lightbox-video').readyState >= 2"
                    )
                    expect(player).to_have_js_property("paused", False)
                    self.page.keyboard.press("Escape")
                    expect(player).to_have_js_property("paused", True)
                    self.assertIsNone(player.get_attribute("src"))
                    expect(button).to_be_focused()

    def test_mixed_media_navigation_and_playback_cleanup(self):
        self.inject_media({"real-estate": [
            ["First clip", "__test__/clip.mp4"],
            ["Interior", "images/galleries/real-estate/real-estate-01.webp"],
            ["Second clip", "__test__/clip.webm?version=1"],
        ]})
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.visit("gallery.html?category=real-estate")
        expect(self.page.locator("#media-count")).to_have_text("1 image · 2 videos")
        first = self.page.get_by_role("button", name="Play First clip")
        first.focus()
        first.press("Enter")
        player = self.page.locator("#lightbox-video")
        expect(player).to_have_js_property("paused", False)
        video_box = player.bounding_box()
        for control in ("Previous item", "Next item"):
            box = self.page.get_by_role("button", name=control).bounding_box()
            self.assertGreaterEqual(box["y"], video_box["y"] + video_box["height"])
        self.page.get_by_role("button", name="Next item").click()
        expect(self.page.locator("#lightbox-image")).to_be_visible()
        expect(player).not_to_be_visible()
        expect(player).to_have_js_property("paused", True)
        self.assertIsNone(player.get_attribute("src"))
        self.page.keyboard.press("ArrowRight")
        expect(player).to_be_visible()
        expect(player).to_have_attribute("src", "__test__/clip.webm?version=1")
        expect(player).to_have_js_property("paused", False)
        self.assertIsNone(player.get_attribute("poster"))
        # Native video keyboard controls must not accidentally change gallery items.
        player.focus()
        self.page.keyboard.press("ArrowRight")
        expect(player).to_have_attribute("src", "__test__/clip.webm?version=1")
        self.page.get_by_role("button", name="Close", exact=True).click()
        expect(player).to_have_js_property("paused", True)
        self.assertIsNone(player.get_attribute("src"))
        expect(first).to_be_focused()
        first.press("Space")
        self.page.get_by_role("dialog").click(position={"x": 5, "y": 5})
        expect(player).to_have_js_property("paused", True)
        expect(first).to_be_focused()

    def test_video_decode_failure(self):
        self.inject_media({"events": [["Test clip", "__test__/clip.mp4"]]})
        self.visit("gallery.html?category=events")
        self.page.get_by_role("button", name="Play Test clip").click()
        self.page.route("**/__test__/invalid.mp4", lambda route: route.fulfill(
            content_type="video/mp4", body=b"Invalid video data"
        ))
        self.page.locator("#lightbox-video").evaluate("""video => {
            video.src = '__test__/invalid.mp4';
            video.load();
        }""")
        expect(self.page.get_by_role("status")).to_have_text(
            "This video could not be played. Please try another item."
        )
        self.page.keyboard.press("Escape")
        self.page.get_by_role("button", name="Play Test clip").click()
        expect(self.page.get_by_role("status")).not_to_be_visible()

    def test_phone_and_date_validation(self):
        self.visit()
        phone = self.page.locator("#enquiry-phone")
        for value, valid in (
            ("+44 7700 900000", True), ("020 7946 0958", True),
            ("(020) 7946-0958", True), ("------", False),
            ("123456", False), ("1234567890123456", False),
        ):
            with self.subTest(phone=value):
                phone.fill(value)
                self.assertEqual(phone.evaluate("el => el.checkValidity()"), valid)
        today = date.fromisoformat(self.page.evaluate("new Date().toLocaleDateString('sv-SE')"))
        preferred = self.page.locator("#enquiry-date")
        for value, valid in (
            ("", True), ((today + timedelta(days=1)).strftime("%d%m%Y"), True),
            (today.strftime("%d%m%Y"), False), ("31022099", False),
            ("29022099", False), ("29022100", False), ("29022096", True),
            ("1234", False),
        ):
            with self.subTest(date=value):
                preferred.fill(value)
                self.assertEqual(preferred.evaluate("el => el.checkValidity()"), valid)

    def test_form_payload_with_mocked_submission(self):
        self.visit()
        self.page.locator("#enquiry-name").fill("Regression Test")
        self.page.locator("#enquiry-email").fill("test@example.com")
        self.page.locator("#enquiry-phone").fill("+44 7700 900000")
        self.page.locator("#enquiry-service").select_option(label="Concerts")
        self.page.locator("#enquiry-date").fill("31122099")
        self.page.locator("#enquiry-message").fill("Local test; intercepted before delivery.")
        submitted = []

        def mock_form(route):
            submitted.append(route.request)
            route.fulfill(status=200, content_type="text/html", body="<p>Mock response</p>")

        self.page.route("https://formspree.io/**", mock_form)
        self.page.get_by_role("button", name="Send Enquiry").click()
        self.page.wait_for_url("https://formspree.io/**")
        self.assertEqual(len(submitted), 1)
        self.assertEqual(submitted[0].method, "POST")
        payload = parse_qs(submitted[0].post_data, keep_blank_values=True)
        self.assertEqual(payload["preferred_date"], ["31/12/2099"])
        self.assertEqual(payload["phone"], ["+44 7700 900000"])
        self.assertEqual(payload["service"], ["Concerts"])
        self.assertEqual(payload["_gotcha"], [""])


if __name__ == "__main__":
    unittest.main()
