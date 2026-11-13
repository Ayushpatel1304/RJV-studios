"""Browser regressions for the static site; no real form submissions are sent."""

import functools
from datetime import date, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
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


class SiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(
            ("127.0.0.1", 0), functools.partial(QuietHandler, directory=str(ROOT))
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

    def test_all_uploaded_photographs_are_available(self):
        for category in ("concerts", "real-estate"):
            with self.subTest(category=category):
                self.visit("gallery.html?category=" + category)
                photos = self.page.locator(".photo img")
                expected = {
                    path.relative_to(ROOT).as_posix()
                    for path in (ROOT / "images/galleries" / category).iterdir()
                    if path.suffix.lower() in {".webp", ".jpg", ".jpeg", ".png"}
                }
                actual = set(photos.evaluate_all("images => images.map(img => img.getAttribute('src'))"))
                self.assertEqual(actual, expected)
                expect(self.page.locator("#photo-count")).to_have_text(f"{len(expected)} images")
                for image in photos.all():
                    image.scroll_into_view_if_needed()
                    expect(image).to_have_js_property("complete", True)
                    self.assertGreater(image.evaluate("img => img.naturalWidth"), 0)

    def test_empty_and_invalid_categories(self):
        for category in ("portraits", "events", "commercial", "unknown", "__proto__", "constructor", "toString"):
            with self.subTest(category=category):
                self.visit("gallery.html?category=" + category)
                expect(self.page.locator("#empty-state")).to_be_visible()
                expect(self.page.locator(".photo")).to_have_count(0)
                if category in {"portraits", "events", "commercial"}:
                    expect(self.page.locator("#photo-count")).to_have_text("0 images")
                else:
                    expect(self.page.locator("#gallery-title")).to_have_text("Collection not found")

    def test_home_assets_and_responsive_layout(self):
        for path in ("index.html", "gallery.html?category=concerts"):
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
        first = self.page.locator(".photo-open").first
        first.scroll_into_view_if_needed()
        self.page.wait_for_function("document.querySelector('.photo img').naturalWidth > 0")
        first.focus()
        self.page.keyboard.press("Enter")
        dialog = self.page.get_by_role("dialog")
        expect(dialog).to_be_visible()
        close = self.page.get_by_role("button", name="Close", exact=True)
        expect(close).to_be_focused()
        self.assertTrue(self.page.locator("main").evaluate("el => el.inert"))
        self.assertEqual(self.page.evaluate("document.body.style.overflow"), "hidden")
        images = self.page.locator(".photo img").evaluate_all("els => els.map(el => el.getAttribute('src'))")
        self.page.keyboard.press("ArrowLeft")
        expect(self.page.locator("#lightbox-image")).to_have_attribute("src", images[-1])
        self.page.keyboard.press("ArrowRight")
        expect(self.page.locator("#lightbox-image")).to_have_attribute("src", images[0])
        self.page.get_by_role("button", name="Next photo").click()
        expect(self.page.locator("#lightbox-image")).to_have_attribute("src", images[1])
        self.page.keyboard.press("Tab")
        expect(close).to_be_focused()
        self.page.keyboard.press("Shift+Tab")
        expect(self.page.get_by_role("button", name="Next photo")).to_be_focused()
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
