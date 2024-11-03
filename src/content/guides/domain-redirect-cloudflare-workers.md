---
title: "Real-World Domain Redirects with Cloudflare Workers: A Journey"
description: "A detailed walkthrough of implementing domain redirects using Cloudflare Workers, based on actual experience with troubleshooting and lessons learned."
difficulty: "intermediate"
category: "Web Infrastructure & DNS Management"
order: 5
heroImage: "/images/cloudflare-cover.jpg"
prerequisites:
  [
    "Cloudflare account with domains managed on Cloudflare",
    "Access to the Workers & Pages section",
    "Basic JavaScript/TypeScript knowledge",
    "Patience for DNS propagation",
  ]
---

# Setting Up Domain Redirects with Cloudflare Workers: My Implementation Story

This guide documents my journey setting up domain redirects using Cloudflare Workers. While it might seem straightforward at first, there were several valuable lessons learned about DNS propagation, worker environments, and the importance of patience. I'm sharing my experience to help others avoid the same pitfalls I encountered.

## My Use Case

I needed to set up redirects for multiple domains:

- Redirect both `deanlofts.xyz` and its www subdomain to my blog at `blog.deanlofts.xyz`
- Redirect both `loftwah.com` and its www subdomain to my Linkaroo profile at `linkarooie.com/loftwah`

This seemed simple enough, but there were several important lessons along the way.

## Prerequisites

Before you start, make sure you have:

1. A Cloudflare account with your domains already added and configured
2. Node.js/Bun installed on your system (I prefer Bun for its speed)
3. Your domains properly configured on Cloudflare
4. Most importantly: **patience**. DNS changes take time, and rushing to change configurations because "it's not working" can lead to confusion

---

### Step 1: Setting Up Your Worker Project

First, we'll create a new Worker project. I'm using Bun, but npm works just as well:

```bash
bun create cloudflare@latest my-domain-redirect-worker
```

During the setup process, you'll be asked several questions. Here's what I chose and why:

- **What would you like to start with?**: Choose "Hello World example" - it gives us a clean slate
- **Which template would you like to use?**: "Hello World Worker" - perfect for our needs
- **Which language do you want to use?**: "TypeScript" - gives us better type safety
- **Do you want to use git for version control?**: "Yes" - always good practice
- **Do you want to deploy your application?**: "No" - we'll deploy manually later

After creation, navigate to your project and install Wrangler as a development dependency:

```bash
cd my-domain-redirect-worker
bun install wrangler --save-dev
```

This keeps Wrangler scoped to your project, which is a better practice than installing it globally.

---

### Step 2: Configuring Your Worker

Create a `wrangler.toml` file in your project root. This is where I learned my first important lesson about worker environments:

```toml
name = "my-domain-redirect-worker"
main = "src/index.ts"
compatibility_date = "2024-10-22"
compatibility_flags = ["nodejs_compat"]

[observability]
enabled = true  # This is crucial for troubleshooting!

[env.production]
account_id = "YOUR_ACCOUNT_ID"  # Get this from your Cloudflare dashboard

routes = [
  { pattern = "deanlofts.xyz/*", zone_id = "YOUR_ZONE_ID_1" },
  { pattern = "www.deanlofts.xyz/*", zone_id = "YOUR_ZONE_ID_1" },
  { pattern = "loftwah.com/*", zone_id = "YOUR_ZONE_ID_2" },
  { pattern = "www.loftwah.com/*", zone_id = "YOUR_ZONE_ID_2" }
]
```

Finding your IDs:

- Account ID: Found in your Cloudflare dashboard under Account Home
- Zone IDs: Found in the Overview section of each domain in your Cloudflare dashboard

**Important**: Never share or commit your real account ID or zone IDs. I learned this the hard way - always use environment variables or keep these in a separate, git-ignored file for production.

---

### Step 3: Setting Up the Redirect Logic

Create your `src/index.ts` file. I added extensive logging to help with troubleshooting:

```typescript
const redirectRules: Record<string, string> = {
  "deanlofts.xyz": "https://blog.deanlofts.xyz",
  "www.deanlofts.xyz": "https://blog.deanlofts.xyz",
  "loftwah.com": "https://linkarooie.com/loftwah",
  "www.loftwah.com": "https://linkarooie.com/loftwah",
};

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    console.log("Incoming request:", {
      url: url.toString(),
      hostname: url.hostname,
      pathname: url.pathname,
    });

    const target = redirectRules[url.hostname];
    console.log("Target URL:", target);

    if (!target) {
      console.log("No target found for hostname:", url.hostname);
      return new Response("Domain not found", { status: 404 });
    }

    const redirectUrl = `${target}${url.pathname}${url.search}`;
    console.log("Redirecting to:", redirectUrl);

    return Response.redirect(redirectUrl, 301);
  },
};
```

The logging here proved invaluable during troubleshooting. It helped me understand exactly what the Worker was seeing and doing with each request.

---

### Step 4: The Deployment Process - A Tale of Two Workers

This is where I encountered my biggest gotcha. There are two ways to deploy, and using the wrong one caused confusion:

```bash
# DON'T do this (creates a worker without routes):
npx wrangler deploy

# DO this instead (creates the production worker with routes):
npx wrangler deploy --env production
```

If you accidentally created both workers like I did, here's how to fix it:

```bash
# First, remove the non-production worker
npx wrangler delete my-domain-redirect-worker

# Then deploy only to production
npx wrangler deploy --env production
```

**Why This Matters**: Having two workers running simultaneously can cause confusion about which one is handling requests. Always check your Workers & Pages dashboard to ensure you only have one worker running.

---

### Step 5: Testing and the Art of Patience

This was perhaps the most important lesson: DNS propagation takes time, and different domains propagate at different rates. Here's what I experienced:

Testing with curl:

```bash
# Test the redirects
curl -I https://deanlofts.xyz
curl -I https://www.loftwah.com
```

What I learned:

1. Curl might show success before browsers work
2. Different domains propagate at different speeds
3. Just because one domain works doesn't mean they all will immediately
4. **Patience is crucial** - I initially thought something was wrong, but everything started working after giving DNS time to propagate

---

### Troubleshooting Guide - Based on Real Experience

When things aren't working, check these in order:

1. **Worker Environment Issues**:

   - Check Workers & Pages dashboard
   - Make sure only the production worker exists
   - Verify routes are properly configured
   - Always use `--env production` when deploying

2. **DNS Configuration**:

   - Verify A records exist for both @ and www
   - Confirm orange cloud (proxy) is enabled
   - Check zone IDs match your domains

3. **SSL/TLS Settings**:

   - Set SSL/TLS to "Full"
   - Verify Edge Certificates are on "Automatic"
   - Check for any Page Rules that might interfere

4. **Testing Methods**:

   ```bash
   # Check DNS propagation
   dig +short yourdomain.com

   # Test redirects (might work before browsers)
   curl -I https://yourdomain.com

   # Follow redirects to verify full path
   curl -L -I https://yourdomain.com
   ```

5. **The Waiting Game**:
   - Give DNS changes at least 30 minutes
   - Use incognito mode to avoid cache issues
   - Test from different networks if possible
   - Monitor Workers logs for request handling

---

### Success Indicators

You know everything is working correctly when:

1. curl shows 301 redirect responses
2. Browsers successfully redirect to target URLs
3. Both www and root domains redirect properly
4. Path and query parameters are preserved in redirects

In my case, perfect functionality arrived gradually as DNS propagated, even though all configurations were correct from the start.

---

### Lessons Learned

1. **Patience is Key**: DNS propagation takes time. Don't rush to change configurations.
2. **Environment Matters**: Always use `--env production` for deployment.
3. **Logging Helps**: Extensive logging in your Worker code helps troubleshooting.
4. **Security First**: Never expose real account or zone IDs.
5. **DNS Details**: The orange cloud (proxy) status is crucial for Workers.

Remember: If curl shows it's working but browsers don't, wait longer. DNS propagation can take time, but if your configuration is correct, it will work!

---
