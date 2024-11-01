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

# Setting Up Domain Redirects with Cloudflare Workers

This guide walks you through setting up domain redirects using Cloudflare Workers. We’ll configure a simple worker to handle redirects across multiple domains, preserving paths and query parameters.

## Prerequisites

1. **Cloudflare account** with:
   - Access to the **Workers & Pages** section
   - Ability to add custom domains
2. **Domains** set to use **Cloudflare's nameservers**
3. **Basic JavaScript/TypeScript knowledge**

## Step 1: DNS Setup

1. In the Cloudflare Dashboard, go to **DNS**.
2. For each domain you want to redirect, add an **A record**:
   - Point to any IP address (e.g., `192.0.2.1`) as a placeholder.
   - Set the proxy status to **Proxied** (orange cloud icon).

## Step 2: Create the Worker

1. In the Cloudflare Dashboard, go to **Workers & Pages**.
2. Click **Create Application**.
3. Select **Create Worker** and name it (e.g., `domain-redirect`).

## Step 3: Add the Code

Replace the default worker code with the following:

```typescript
type RedirectRules = Record<string, string>;

// Define your redirects: source -> target
const redirectRules: RedirectRules = {
  "deanlofts.xyz": "blog.deanlofts.xyz",
  "www.deanlofts.xyz": "blog.deanlofts.xyz",
  "loftwah.com": "linkarooie.com/loftwah",
  "www.loftwah.com": "linkarooie.com/loftwah",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const { pathname, search, hostname } = url;

    const target = redirectRules[hostname];
    if (!target) {
      return new Response("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return Response.redirect(`https://${target}${pathname}${search}`, 301);
  },
};
```

### Code Explanation

- **Domain Mapping**: The `redirectRules` object maps source domains to target domains.
- **Path and Query Preservation**: Paths and query parameters from the original request are appended to the redirect URL.
- **SEO-Friendly Redirects**: Permanent 301 redirects are used for search engine optimisation.
- **Unknown Domains**: If a domain isn’t listed, a 404 response is returned.

## Step 4: Add Custom Domains

1. In **Workers**, find your worker (e.g., `domain-redirect`).
2. Click **Add Custom Domain**.
3. Add each domain in your `redirectRules`:
   - `deanlofts.xyz`
   - `www.deanlofts.xyz`
   - `loftwah.com`
   - `www.loftwah.com`

## Testing

Test your redirects by visiting:

1. **Basic redirect**:
   - Visit: `https://deanlofts.xyz`
   - **Expected**: Redirects to `https://blog.deanlofts.xyz`
2. **Path preservation**:

   - Visit: `https://deanlofts.xyz/test?q=1`
   - **Expected**: Redirects to `https://blog.deanlofts.xyz/test?q=1`

3. **Alternate domain**:
   - Visit: `https://loftwah.com`
   - **Expected**: Redirects to `https://linkarooie.com/loftwah`

## Troubleshooting

If the redirects aren’t working as expected:

1. **Check DNS Settings**: Ensure each domain is set to **Proxied** in the DNS tab.
2. **Verify Custom Domains**: Confirm all necessary custom domains are added to the worker.
3. **Clear Cache**: Clear your browser’s cache or try testing in an incognito window.

## Customising the Worker

To add additional redirects, simply update the `redirectRules` object with more source-target pairs:

```typescript
const redirectRules: RedirectRules = {
  "olddomain.com": "newdomain.com",
  "www.olddomain.com": "newdomain.com",
};
```

And that’s it! Your domains should now be properly redirected as configured.
