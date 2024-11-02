---
title: "Setting Up Cloudflare Workers for Flexible Domain Redirects"
description: "Learn how to manage domain redirects with Cloudflare Workers, including HTTPS enforcement, path preservation, and structured DNS configuration."
difficulty: "intermediate"
category: "Web Infrastructure & DNS Management"
order: 5
heroImage: "/images/cloudflare-cover.jpg"
prerequisites:
  [
    "Cloudflare account with domains managed on Cloudflare",
    "Access to the Workers & Pages section",
    "Ability to add custom domains",
    "Basic JavaScript/TypeScript knowledge",
    "Understanding of DNS and SSL/TLS settings",
  ]
---

# Cloudflare Workers: Setting Up Domain Redirects with Wrangler CLI

This guide walks you through creating a Cloudflare Worker for flexible domain redirects with path and query preservation, using Wrangler CLI for setup and deployment.

## Prerequisites

1. [Cloudflare Account](https://dash.cloudflare.com/sign-up)
2. Node.js installed (we recommend a Node version manager for easier version management)

---

### Step 1: Create a New Worker Project with Wrangler

In your terminal, create a new Cloudflare Worker project:

```bash
bun create cloudflare@latest my-domain-redirect-worker
```

During setup, select the following options:

- **What would you like to start with?**: **Hello World example**
- **Which template would you like to use?**: **Hello World Worker**
- **Which language do you want to use?**: **TypeScript**
- **Do you want to use git for version control?**: **Yes**
- **Do you want to deploy your application?**: **No**

Once the setup is complete, navigate to the project folder:

```bash
cd my-domain-redirect-worker
```

---

### Step 2: Install Wrangler Locally

To keep Wrangler scoped to your project, install it as a development dependency:

```bash
npm install wrangler --save-dev
```

Now, you can run Wrangler commands via `npx`.

---

### Step 3: Add Redirect Logic in `src/index.ts`

Open `src/index.ts` and replace the contents with the following code to define simple redirect rules:

```typescript
// src/index.ts

// Define the redirect mappings: source domains -> target URLs
const redirectRules: Record<string, string> = {
  "deanlofts.xyz": "https://blog.deanlofts.xyz",
  "www.deanlofts.xyz": "https://blog.deanlofts.xyz",
  "loftwah.com": "https://linkarooie.com/loftwah",
  "www.loftwah.com": "https://linkarooie.com/loftwah",
};

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const target = redirectRules[url.hostname];

    if (!target) {
      return new Response("Domain not found", { status: 404 });
    }

    // Redirect with preserved path and query parameters
    return Response.redirect(`${target}${url.pathname}${url.search}`, 301);
  },
};
```

### Explanation:

- **Redirect Rules**: `redirectRules` maps source domains to destination URLs.
- **Path & Query Preservation**: Paths and query parameters from the original URL are appended to the redirect URL.
- **SEO-Friendly**: 301 permanent redirects ensure search engines update their links.

---

### Step 4: Develop Locally with Wrangler

To test the Worker locally, use:

```bash
npx wrangler dev
```

Visit `http://localhost:8787` in your browser to preview the Worker. Wrangler will prompt you to log in to Cloudflare if it’s your first time using it.

---

### Step 5: Deploy Your Worker

When ready to deploy your Worker to a Cloudflare-managed subdomain, run:

```bash
npx wrangler deploy
```

Wrangler will prompt you to set up a subdomain if it’s your first deployment.

---

### Step 6: Set Up Custom Domains for Redirects

1. In the Cloudflare dashboard, go to **Workers & Pages**.
2. Find your Worker (e.g., `my-domain-redirect-worker`) and select **Add Custom Domain**.
3. Add each domain listed in your `redirectRules`:
   - `deanlofts.xyz`
   - `www.deanlofts.xyz`
   - `loftwah.com`
   - `www.loftwah.com`

### DNS Setup for Redirect Domains

1. In the **DNS** tab of your Cloudflare dashboard, add an **A record** for each domain you want to redirect.
   - Use a placeholder IP (e.g., `192.0.2.1`).
   - Set the proxy status to **Proxied** (orange cloud icon).

---

### Step 7: Test and Verify Redirects

Test each domain to ensure that redirects are working:

1. **Basic redirect**:
   - Visit: `https://deanlofts.xyz`
   - **Expected**: Redirects to `https://blog.deanlofts.xyz`
2. **Path preservation**:
   - Visit: `https://deanlofts.xyz/example?q=1`
   - **Expected**: Redirects to `https://blog.deanlofts.xyz/example?q=1`

---

### Troubleshooting

- **DNS Settings**: Confirm that each domain is set to **Proxied** in the DNS tab.
- **Custom Domains**: Verify all necessary custom domains are added in the Worker configuration.
- **Cache**: Clear your browser’s cache or use incognito mode if redirects do not update as expected.

---
