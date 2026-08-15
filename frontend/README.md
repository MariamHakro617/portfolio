# Frontend

Static HTML/CSS/JS for the portfolio, blog, and admin panel. No build step, no framework, no bundler.

> **Setup, running, and deploying this along with its backend live in the [root README](../README.md).** This file only covers editing and customizing content.

## Structure

```
frontend/
├── index.html          # Home, About, Skills, Technologies, Projects, Experience,
│                        # Education, Certifications, Services, Resume, Testimonials, Contact
├── blog.html             # Blog listing
├── blog-post.html         # Single post (reads ?id= from the URL)
├── admin/
│   ├── login.html          # Admin sign-in
│   └── dashboard.html       # Content management dashboard
├── css/style.css              # Design system
├── css/admin.css               # Admin panel styles
├── js/data.js                   # API client — fetches content from the backend, caches it in memory
├── js/main.js                    # Renders sections, nav, scroll reveal, contact form
├── js/admin.js                    # Admin auth + CRUD forms for the dashboard
├── resume/resume.pdf               # Downloadable résumé (placeholder — replace with yours)
└── assets/                          # Add real photos/screenshots here
```

## Editing Content

All content — profile, skills, projects, experience, education, certifications, services, testimonials, blog posts — lives in the backend's SQLite database now, not in this folder. Two ways to edit it:

1. **Through the admin panel** (recommended) — go to `/admin/login.html`, sign in, and edit everything through forms. Changes save immediately and are visible to every visitor.
2. **Directly in the database** — if you'd rather script bulk changes, the backend exposes `PUT /api/content/:key` (see the root README's API reference). You could also inspect/edit `backend/data/portfolio.db` directly with a SQLite browser, though going through the API is safer since it validates the request shape.

The old `js/data.js` default-content object (from the static version of this site) has been moved to `backend/src/seedData.js` — that's what populates the database the first time you run `npm run seed`, and what `POST /api/data/reset` restores from.

## Replacing Placeholder Content

- **Résumé:** replace `resume/resume.pdf` with your real PDF (same filename, or update the download links in `index.html`).
- **Project screenshots:** project cards currently render a generated blueprint-grid placeholder. Drop real screenshots into `assets/` and swap the `.project-thumb` div in `js/main.js`'s `renderProjects()` for an `<img>` tag.
- **Profile photo:** the hero/title-block shows initials on a colored tile. Add a photo to `assets/` and swap the `.avatar` div in `index.html` for an `<img>`.
- **Social links, email, phone:** edit via the admin panel's Profile tab.

## Accessibility & Performance Notes

- Semantic HTML5 landmarks (`nav`, `header`, `section`, `footer`, `article`).
- Visible focus states (`:focus-visible`) and `prefers-reduced-motion` support.
- Form fields have associated `<label>` elements and inline validation messages, validated both client-side and server-side.
- Fonts load from Google Fonts with `preconnect` for performance; no heavy JS frameworks or bundlers.
- Basic SEO meta tags (`description`, `keywords`, Open Graph) are in `index.html`; `robots.txt` and `sitemap.xml` are at the project root.

## Tech Stack

HTML5, CSS3 (custom design system), vanilla JavaScript (ES6+, `fetch`/`async`-`await`). Fonts: Space Grotesk, IBM Plex Sans, IBM Plex Mono via Google Fonts.
