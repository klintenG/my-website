# klinteng.com

Personal portfolio for Bill Klinten Guduru, a software engineer in Bengaluru. The site presents enterprise product experience, selected AI projects, case studies, and contact information.

The site uses static HTML, CSS, and JavaScript. GitHub Pages can serve it without a build step. The homepage, project pages, and contact links work without an AI backend.

## Local preview

```bash
python3 -m http.server 8766
# Open http://127.0.0.1:8766/
```

The optional portfolio assistant, resume-fit experiment, and code-review experiment require a separate Gemini proxy. On the public site the proxy URL in `js/config.js` is empty, so those controls show an unavailable state before visitors enter data. A local proxy can be started with `cd server && npm install && npm start` after configuring `server/.env`; see `server/.env.example`. A healthy local proxy with a configured API key enables the experiments. Project HER is an independent external demo whose availability can vary. Its embedded generator is hidden until its backend and output are verified; the playground links to the external demo and case study.

## Content and evidence

- The homepage distinguishes a personal project, a hackathon prototype, and internal tools.
- The four DocViz specialist agents are followed by a separate QA step.
- The public case studies describe architecture, contribution, limits, and next steps. Internal artifacts are omitted.
- `assets/project_her_demo.mp4` is a promotional overview, not a recorded generated output.
- The browser-delivered `js/profile-data.js` contains only professional information intended to be public.
- `review-private/claims-to-verify.md` is an ignored local checklist of claims and assets to confirm before publication. It is not part of the public source.

## Checks

The focused browser smoke test covers the homepage and all routes at four widths, JavaScript errors, overflow, resume links, mobile navigation, tabs, project filters, contact actions, the missing AI backend, no-JavaScript navigation, and reduced motion. It uses an existing Puppeteer installation:

```bash
PUPPETEER_MODULE=/absolute/path/to/puppeteer/module.js \
SITE_URL=http://127.0.0.1:8766 \
node tests/browser-smoke.mjs
```

`PORTFOLIO_CHROME` can point to a Chrome binary when auto-detection is unavailable. The test saves screenshots to `/private/tmp/portfolio-final` by default. It never calls a paid AI generation endpoint.

## Source

`index.html` is the recruiter-facing overview. `projects/` contains the project index and case studies. `playground/` contains optional experiments. Shared site behavior is in `js/main.js`; `js/config.js` holds public links and endpoint settings. `css/style.css` retains the existing design system, while `css/portfolio.css` contains the focused portfolio and shared route refinements.

All personal project code © 2026 Bill Klinten Guduru. All rights reserved.
