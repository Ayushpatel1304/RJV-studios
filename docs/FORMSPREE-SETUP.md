# Connect the RJV Studios enquiry form to Formspree

The contact form on the homepage is prepared to send submissions to Formspree. It keeps the existing RJV Studios form layout and styling.

## 1. Create a Formspree form

1. Open [Formspree](https://formspree.io/) and sign in or create an account.
2. Create a new form for **RJV Studios**.
3. Set the notification email address where you want to receive new client enquiries.
4. Copy the form endpoint. It looks like `https://formspree.io/f/xxxxxxxx`.

## 2. Add your endpoint to the website

1. Open `index.html` in this repository.
2. Find the contact form's `action` attribute:
   `action="https://formspree.io/f/YOUR_FORM_ID"`
3. Replace `YOUR_FORM_ID` with the ID from your Formspree endpoint. Keep the rest of the URL unchanged.
4. Commit the change to the `main` branch.

Cloudflare Pages will publish the update automatically if the GitHub repository is connected to your Cloudflare Pages project.

## 3. Test the form

1. Open the live RJV Studios website.
2. Submit a test enquiry using an email address you can access.
3. Confirm the submission appears in Formspree and the notification arrives in your inbox.
4. Check the spam folder if the notification does not arrive.

## Fields collected

- Name (required)
- Email (required)
- Service (required)
- Preferred date (optional)
- Project details (required)

The form also includes a hidden honeypot field to help reduce automated spam submissions.

## Important

The repository currently contains the placeholder `YOUR_FORM_ID`. The form will not submit successfully until you replace it with the real endpoint ID from your Formspree account. Do not put passwords or private API keys in the website code; the public form endpoint is intended to be used in the HTML form action.
