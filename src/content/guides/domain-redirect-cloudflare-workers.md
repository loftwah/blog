---
title: "Setting Up Cloudflare Workers for Domain Redirects"
description: "A comprehensive guide to using Cloudflare Workers for managing domain redirects, including HTTPS enforcement, path preservation, and DNS configuration."
difficulty: "intermediate"
category: "Web Infrastructure & DNS Management"
order: 5
heroImage: "/images/cloudflare-cover.jpg"
prerequisites:
  [
    "Cloudflare account with domains managed on Cloudflare",
    "Familiarity with basic JavaScript syntax",
    "Basic understanding of DNS and SSL/TLS settings",
    "Cloudflare API key and Zone IDs for domains",
  ]
---

# Comprehensive Guide to Setting Up Cloudflare Workers for Domain Redirects

This guide provides a complete walkthrough for using Cloudflare Workers to handle domain redirects. We’ll cover everything, including an introduction to Cloudflare Workers, setting up DNS and SSL/TLS settings, configuring the Worker code, and testing and troubleshooting the setup.

### Use Cases in This Guide:
1. Redirect `deanlofts.xyz` and `www.deanlofts.xyz` to `blog.deanlofts.xyz`, preserving paths and query parameters.
2. Redirect `loftwah.com` and `www.loftwah.com` to `linkarooie.com/loftwah`, without path preservation.

---

## What Are Cloudflare Workers?

Cloudflare Workers are lightweight, serverless functions that run directly on Cloudflare’s global edge network. They allow you to write JavaScript code to handle HTTP requests and responses, intercepting and processing them before they reach your origin server. This is especially useful for tasks like redirection, security headers, and caching, as the code runs close to the user, reducing latency and load on your server.

### Key Benefits of Cloudflare Workers for Redirects
- **Performance**: Redirects are processed at the edge, reducing round-trip time and improving response speed.
- **Reliability**: Cloudflare’s global network ensures consistent redirect performance, regardless of user location.
- **Ease of Management**: You can update and manage redirect rules directly in Cloudflare without modifying your origin server.

---

## Prerequisites

1. **Cloudflare Account**: Set up an account at [Cloudflare](https://www.cloudflare.com/).
2. **Domains Added to Cloudflare**: The domains you want to redirect must be added to Cloudflare and use Cloudflare’s nameservers.
3. **API Key and Zone IDs**: Familiarize yourself with where to find your API key and zone IDs, as these may be needed for testing or API configurations.

---

## Step 1: DNS and SSL/TLS Configuration

To make sure your redirects function over HTTPS, you’ll need to verify DNS and SSL/TLS settings for each domain in Cloudflare.

### A. Set Up DNS Records for Each Domain

For each domain, ensure that the traffic routes through Cloudflare. Here’s how:

1. Go to **DNS** in your Cloudflare dashboard.
2. **Create or Verify DNS Records**:
   - Add or verify an **A** record pointing to any IP address (e.g., `192.0.2.1`) or a **CNAME** record pointing to your primary domain.
   - Ensure **Proxy Status** is set to **Proxied** (indicated by an orange cloud icon). This enables Cloudflare to intercept requests.
   
> **Note**: If you don’t want your origin IP exposed, use a dummy IP (e.g., `192.0.2.1`) as long as traffic is proxied through Cloudflare.

### B. Configure SSL/TLS Settings for HTTPS

For HTTPS enforcement, make sure the SSL/TLS settings are correctly configured:

1. Navigate to **SSL/TLS** > **Overview** in the Cloudflare dashboard.
2. **Set SSL Mode** to **Flexible** or higher. (Recommendation: **Full** if your origin supports HTTPS).
   
> **Flexible** SSL means Cloudflare will handle HTTPS for incoming traffic but doesn’t require HTTPS between Cloudflare and your origin. **Full** SSL secures the entire connection from end to end.

---

## Step 2: Creating a Cloudflare Worker

Now that your DNS and SSL are configured, it’s time to create the Worker.

1. In your Cloudflare dashboard, go to **Workers**.
2. Select **Create a Service**.
3. Name your Worker (e.g., `domain-redirect`) and select **HTTP handler**.
4. Click **Create service** to open the Worker editor.

---

## Step 3: Writing the Worker Code

In the Worker editor, add the following code to handle redirects for `deanlofts.xyz` and `loftwah.com` as specified.

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const pathname = url.pathname
  const search = url.search

  // Redirect `deanlofts.xyz` and `www.deanlofts.xyz` to `blog.deanlofts.xyz`, preserving path and query
  if (url.hostname === 'deanlofts.xyz' || url.hostname === 'www.deanlofts.xyz') {
    return Response.redirect(`https://blog.deanlofts.xyz${pathname}${search}`, 301)
  }

  // Redirect `loftwah.com` and `www.loftwah.com` to `linkarooie.com/loftwah`
  if (url.hostname === 'loftwah.com' || url.hostname === 'www.loftwah.com') {
    return Response.redirect('https://linkarooie.com/loftwah', 301)
  }

  // Fallback for unmatched requests, returning 404
  return new Response('Not Found', { 
    status: 404,
    headers: { 'Content-Type': 'text/plain' }
  })
}
```

### Code Breakdown
- **Path and Query Preservation**: `pathname` and `search` ensure paths and query parameters are preserved.
- **301 Redirects**: We use permanent redirects (`301`) to benefit SEO.
- **404 Fallback**: Any requests that don’t match a redirect rule receive a 404 response with a `text/plain` content type.

### How the Worker Code Works
1. When a request is made, the `handleRequest` function examines the domain (`url.hostname`).
2. Depending on the domain, it issues a redirect to the appropriate target URL:
   - Requests to `deanlofts.xyz` or `www.deanlofts.xyz` go to `blog.deanlofts.xyz`.
   - Requests to `loftwah.com` or `www.loftwah.com` go to `linkarooie.com/loftwah`.
3. If no matching rule is found, a `404 Not Found` response is returned.

---

## Step 4: Deploy the Worker

1. Click **Save and Deploy** in the Worker editor.
2. The Worker is now live, but you need to assign specific routes to apply the Worker to each domain.

---

## Step 5: Assign Routes to the Worker

To link your Worker to specific domains, configure routes:

1. In the **Workers** dashboard, select the Worker you created (`domain-redirect`).
2. Scroll to **Triggers** and add routes for each domain:
   - For `deanlofts.xyz`: `deanlofts.xyz/*`
   - For `www.deanlofts.xyz`: `www.deanlofts.xyz/*`
   - For `loftwah.com`: `loftwah.com/*`
   - For `www.loftwah.com`: `www.loftwah.com/*`
   
Each route will apply the Worker code to requests for that domain.

> **Tip**: If you only want certain paths to trigger the Worker, specify those paths in the routes (e.g., `deanlofts.xyz/blog/*`).

---

## Step 6: Testing the Redirects

After deploying and setting up routes, it’s time to test the redirects.

1. **Visit `https://deanlofts.xyz`**: You should be redirected to `https://blog.deanlofts.xyz`, with any paths or query parameters preserved (e.g., `https://deanlofts.xyz/article?id=123` redirects to `https://blog.deanlofts.xyz/article?id=123`).
2. **Visit `https://loftwah.com`**: This should redirect to `https://linkarooie.com/loftwah`, without preserving any path or query parameters.

---

## Troubleshooting Common Issues

### Issue 1: Redirects Not Working
- **Check Routes**: Make sure each domain has the correct route in **Triggers**.
- **Proxy Status**: Verify that DNS entries for each domain are set to **Proxied** (orange cloud icon).
- **Clear Browser Cache**: Cached redirects can sometimes interfere with testing. Clear your cache or use incognito mode.

### Issue 2: HTTPS Not Working
- **SSL/TLS Mode**: Confirm SSL Mode is set to **Flexible** or higher under **SSL/TLS** in Cloudflare.
- **DNS Record**: Ensure you have a valid **A** or **CNAME** record for each domain.

### Issue 3: Path or Query Parameters Not Preserved
- **Code Check**: Ensure the `pathname` and `search` variables are included in the redirect URL to preserve paths and parameters.

---

## Summary

This guide has shown you how to set up domain redirects with Cloudflare Workers, including DNS and SSL/TLS configurations, Worker code setup, and testing. By leveraging Cloudflare’s network and serverless Workers, you can create a high-performance redirect system that’s flexible and easy to manage. 

### Key Takeaways:
- Cloudflare Workers allow you to intercept requests at the edge, improving performance and simplifying redirect management.
- Path and query preservation ensures user experience and SEO are maintained.
- Configuring routes ensures your redirects only apply to specified domains.

Now you’re ready to manage your domain redirects with Cloudflare Workers effectively. If you need to add more domains, simply update the Worker code and add new routes.

 Happy redirecting!

--- 
