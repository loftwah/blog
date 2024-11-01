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
    "Basic JavaScript knowledge",
    "Understanding of DNS and SSL/TLS settings",
    "Cloudflare API key and Zone IDs",
  ]
---

# Comprehensive Guide to Setting Up Cloudflare Workers for Domain Redirects

This guide covers setting up Cloudflare Workers for efficient domain redirection. We’ll go through Cloudflare Workers basics, configuring DNS and SSL/TLS settings, writing the Worker code, and testing and troubleshooting the setup.

### Use Cases in This Guide:

1. Redirect `deanlofts.xyz` and `www.deanlofts.xyz` to `blog.deanlofts.xyz`, preserving paths and query parameters.
2. Redirect `loftwah.com` and `www.loftwah.com` to `linkarooie.com/loftwah`, without preserving paths.

---

## What Are Cloudflare Workers?

Cloudflare Workers are serverless JavaScript functions that run on Cloudflare’s global edge network. They can intercept HTTP requests, allowing you to modify, redirect, or manage traffic before it reaches your server.

### Benefits of Using Cloudflare Workers for Redirects

- **High Performance**: Processes redirects close to users, reducing latency.
- **Reliability**: Cloudflare’s network ensures consistent performance.
- **Ease of Management**: Redirect rules can be directly updated within Cloudflare.

---

## Prerequisites

1. **Cloudflare Account**: Set up an account at [Cloudflare](https://www.cloudflare.com/).
2. **Domains on Cloudflare**: Domains must be added to Cloudflare and use Cloudflare’s nameservers.
3. **API Key and Zone IDs**: Familiarize yourself with your API key and zone IDs, which are useful for testing or API configurations.

---

## Step 1: Configuring DNS and SSL/TLS Settings

To ensure HTTPS redirects, verify DNS and SSL/TLS settings for each domain.

### A. DNS Records Setup

For each domain, route traffic through Cloudflare:

1. Go to **DNS** in your Cloudflare dashboard.
2. **Add or Verify DNS Records**:
   - Set up an **A** record pointing to any IP (e.g., `192.0.2.1`) or a **CNAME** record pointing to your main domain.
   - Ensure **Proxy Status** is set to **Proxied** (orange cloud icon), enabling Cloudflare to intercept requests.

> **Note**: To keep your origin IP private, use a placeholder IP (e.g., `192.0.2.1`) as long as traffic is proxied through Cloudflare.

### B. SSL/TLS Configuration

Set up SSL/TLS to enforce HTTPS:

1. Navigate to **SSL/TLS** > **Overview** in the Cloudflare dashboard.
2. **Set SSL Mode** to **Flexible** or higher (recommended: **Full** if your origin supports HTTPS).

> **Flexible** SSL handles HTTPS for incoming traffic, but doesn’t require HTTPS between Cloudflare and your origin. **Full** SSL secures the connection end-to-end.

---

## Step 2: Creating a Cloudflare Worker

1. Go to **Workers** in your Cloudflare dashboard.
2. Select **Create a Service** and name it (e.g., `domain-redirect`).
3. Choose **HTTP handler** as the Worker type and click **Create service** to open the Worker editor.

---

## Step 3: Writing Modern Worker Code

In the Worker editor, use the following code to set up structured redirect rules for `deanlofts.xyz` and `loftwah.com`.

```javascript
// Types for better IDE support and documentation
/**
 * @typedef {Object} RedirectRule
 * @property {string} target - The target domain for redirection
 * @property {boolean} preservePath - Whether to preserve the request path and query string
 */

/**
 * Handles incoming requests and redirects based on hostname
 * @param {Request} request - The incoming request object
 * @returns {Response} The response object
 */
const handleRequest = async (request) => {
  const url = new URL(request.url);
  const { pathname, search, hostname } = url;

  // Define redirect rules for domains
  const redirectRules = {
    "deanlofts.xyz": { target: "blog.deanlofts.xyz", preservePath: true },
    "www.deanlofts.xyz": { target: "blog.deanlofts.xyz", preservePath: true },
    "loftwah.com": { target: "linkarooie.com/loftwah", preservePath: false },
    "www.loftwah.com": {
      target: "linkarooie.com/loftwah",
      preservePath: false,
    },
  };

  const rule = redirectRules[hostname];

  if (rule) {
    const redirectUrl = rule.preservePath
      ? `https://${rule.target}${pathname}${search}`
      : `https://${rule.target}`;

    return new Response(null, {
      status: 301,
      headers: {
        Location: redirectUrl,
        "Cache-Control": "max-age=3600",
      },
    });
  }

  return new Response("Not Found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-store",
    },
  });
};

export default {
  fetch: handleRequest,
};
```

### Code Overview

- **Modular Redirect Rules**: The `redirectRules` object stores each domain's redirection target and whether it should preserve paths and query parameters.
- **301 Redirects**: Redirects use `status: 301` for SEO benefits.
- **404 Response**: Any unmatched domains return a 404 response with `no-store` cache control to avoid caching.

---

## Step 4: Deploying the Worker

1. Click **Save and Deploy** in the Worker editor.
2. Now that the Worker is live, configure routes to link it to each domain.

---

## Step 5: Assign Routes to the Worker

Configure routes for each domain:

1. In **Workers**, select your Worker (`domain-redirect`).
2. Go to **Triggers** and add routes:
   - For `deanlofts.xyz`: `deanlofts.xyz/*`
   - For `www.deanlofts.xyz`: `www.deanlofts.xyz/*`
   - For `loftwah.com`: `loftwah.com/*`
   - For `www.loftwah.com`: `www.loftwah.com/*`

This setup links the Worker to intercept requests to specified domains.

> **Tip**: For specific paths, set routes like `deanlofts.xyz/blog/*`.

---

## Step 6: Testing the Redirects

1. **Visit `https://deanlofts.xyz`**: This should redirect to `https://blog.deanlofts.xyz`, preserving paths and query strings (e.g., `https://deanlofts.xyz/article?id=123` redirects to `https://blog.deanlofts.xyz/article?id=123`).
2. **Visit `https://loftwah.com`**: This should redirect to `https://linkarooie.com/loftwah` without preserving paths.

---

## Troubleshooting Common Issues

### Issue 1: Redirects Not Working

- **Check Routes**: Confirm each domain has the correct route in **Triggers**.
- **Verify Proxy Status**: Ensure DNS records are set to **Proxied** (orange cloud icon).
- **Clear Browser Cache**: Cached redirects may interfere with testing. Use incognito mode or clear your cache.

### Issue 2: HTTPS Issues

- **SSL/TLS Mode**: Confirm SSL Mode is set to **Flexible** or higher in Cloudflare.
- **DNS Record Check**: Ensure a valid **A** or **CNAME** record exists for each domain.

### Issue 3: Path or Query Parameters Not Preserved

- **Code Check**: Verify `pathname` and `search` are included in the redirect URL for path preservation.

---

## Summary

By following this guide, you’ve set up a robust, scalable domain redirect system using Cloudflare Workers. With redirects happening at the edge, users experience faster response times and seamless redirection, whether paths are preserved or not.

### Key Takeaways:

- Cloudflare Workers allow edge-based request handling, enhancing redirect performance.
- Flexible, object-based rules simplify adding new redirects or updating existing ones.
- SSL/TLS and DNS configurations ensure HTTPS enforcement and optimal performance.

With this setup, managing multiple domain redirects is efficient and straightforward. Just update the `redirectRules` object and routes as needed.

Happy redirecting!

---
