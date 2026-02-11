# klinteng.com — Personal Resume Website

A modern, responsive resume/portfolio website for **Bill Klinten Guduru** — Full Stack Developer & Agentic AI Developer.

**Live:** [https://klinteng.com](https://klinteng.com)

## Features

- **Visual Resume** — Complete professional profile with experience timeline, skills visualization, and project showcase
- **Dark/Light Theme** — Toggle between themes with preference saved in localStorage
- **Responsive Design** — Fully responsive across all devices (mobile, tablet, desktop)
- **Animations** — Smooth scroll animations, typing effect, animated skill bars, and counter animations
- **Print-Friendly** — Optimized print styles for recruiter-friendly PDF export
- **Project Filtering** — Filter projects by category (Enterprise / AI)
- **Contact Form** — Mailto-based contact form
- **SEO Ready** — Meta tags, Open Graph, and semantic HTML

## Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript** — No dependencies, no build tools
- **Font Awesome** — Icons
- **Google Fonts** — Inter + JetBrains Mono

## Project Structure

```
my-website/
├── index.html          # Main resume page
├── css/
│   └── style.css       # All styles (light/dark themes, responsive)
├── js/
│   └── main.js         # Interactions (theme toggle, animations, typing effect)
├── assets/
│   └── favicon.svg     # SVG favicon
├── CNAME               # Custom domain for GitHub Pages
└── README.md
```

## Deployment

This site is designed to be hosted on **GitHub Pages**:

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch** → `main` / `root`
4. If using a custom domain, ensure DNS is configured to point to GitHub Pages

## Local Development

Simply open `index.html` in a browser, or use a local server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .
```

## Customization

- Edit `index.html` to update content (experience, projects, skills, etc.)
- Modify CSS variables in `:root` in `css/style.css` to change colors and theme
- Add a profile photo by replacing the avatar placeholder in the hero section

## License

© 2026 Bill Klinten Guduru. All Rights Reserved.
