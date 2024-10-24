# Dean "Loftwah" Lofts Blog

Welcome to the blog of Dean "Loftwah" Lofts. This project is built with [Astro](https://astro.build/) and deployed using GitHub Pages. It features blog posts about tech, beats, and innovation.

## 🚀 Project Overview

This site is hosted on a custom domain: [https://blog.deanlofts.xyz](https://blog.deanlofts.xyz).

### Key Features

- **Built with Astro**: Lightweight and fast static site generation.
- **MDX Support**: Write posts with Markdown and MDX.
- **Sitemap & SEO**: Automatically generated sitemap and OpenGraph metadata for SEO.
- **GitHub Pages Deployment**: Automated deploys on the `main` branch using GitHub Actions.
- **Custom Domain**: Uses a custom domain (`blog.deanlofts.xyz`).

## 🧑‍💻 Installation and Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/loftwah/blog.git
   cd blog
   ```

2. Install dependencies with Bun:

   ```bash
   bun install
   ```

3. Run the local development server:

   ```bash
   bun run dev
   ```

4. To build the site:

   ```bash
   bun run build
   ```

5. Preview the production build:

   ```bash
   bun run preview
   ```

## 📂 Project Structure

```text
├── public/
│   └── CNAME                   # Custom domain file
├── src/
│   ├── components/             # Reusable components (e.g., Header, Footer)
│   ├── content/                # Blog posts in Markdown/MDX
│   ├── layouts/                # Layouts for pages and posts
│   ├── pages/                  # Main pages (index, blog, about)
│   └── styles/                 # Global CSS
├── astro.config.mjs            # Astro configuration file
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── .github/workflows/deploy.yml # GitHub Actions for deployment
```

## ⚙️ Configuration

- **Custom Domain**: The file `public/CNAME` contains the custom domain `blog.deanlofts.xyz`. This is used for GitHub Pages deployment.
- **Astro Config**: Located in `astro.config.mjs`, the configuration includes site metadata and integrations like MDX and sitemap.

## 🚀 Deployment

Deployment is automated using GitHub Actions. Every push to the `main` branch triggers the build and deploy process:

1. The site is built using the `withastro/action@v3`.
2. The output is pushed to GitHub Pages.

### GitHub Actions Workflow

The workflow file is located at `.github/workflows/deploy.yml`. It handles the entire deployment process to GitHub Pages.

## 📚 Blog Posts

All blog content is written in Markdown or MDX and located in the `src/content/blog/` directory. Each post is a Markdown file with frontmatter for metadata (title, description, date, etc.).

## License

This project is licensed under the [MIT License](./LICENSE).

---

Feel free to explore the site at [https://blog.deanlofts.xyz](https://blog.deanlofts.xyz).
