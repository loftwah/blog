---
title: "Complete Guide to Getting Started with Bluesky: The New Home of Tech Twitter"
description: "Learn how to set up your Bluesky account, customize your profile, connect with the tech community, and discover the best starter packs to follow."
difficulty: "beginner"
category: "Social Media"
order: 12
heroImage: "/images/bluesky-signup.jpg"
prerequisites:
  [
    "Valid email address for signup",
    "Profile picture and banner image ready to upload",
    "Links to your projects and online presence",
  ]
---

# Complete Guide to Getting Started with Bluesky: The New Home of Tech Twitter

## What is Bluesky?

Bluesky is an emerging social platform designed for tech enthusiasts, developers, and digital makers. It offers a space for genuine discussions, meaningful connections, and a unique opportunity to establish your tech presence.

## 1. Creating Your Account

Start your journey on Bluesky by:

1. Visiting [bsky.app](https://bsky.app) and signing up.
2. Choosing a handle that reflects your brand (e.g., `loftwah.bsky.social`).
3. Creating a strong password.

## 2. Setting Up Your Profile

Your profile is your calling card. Make it stand out:

- **Profile Picture**: Use a clear and recognisable image (recommended size: **1000x1000 pixels**).
- **Banner Image**: Showcase your work or personality with a banner (recommended size: **1500x500 pixels**).
- **Bio**: Highlight who you are, what you do, and why people should follow you.
- **Key Links**: Include links to your GitHub, portfolio, or your [Linkarooie](https://linkarooie.com) profile.

### Adding Your Pronouns

If you’re new here, it’s recommended to add your pronouns to help others address you correctly. Follow [@pronouns.adorable.mom](https://bsky.app/profile/pronouns.adorable.mom) and:

1. **Subscribe** to their account.
2. **Like the posts that match your pronouns**. You can add up to four different pronoun labels by liking multiple posts.
3. To find the pronoun posts, visit the **Posts tab** on [@pronouns.adorable.mom](https://bsky.app/profile/pronouns.adorable.mom) or use the search function.
4. If you need to remove any pronoun labels, see the pinned post on [@pronouns.adorable.mom](https://bsky.app/profile/pronouns.adorable.mom) for instructions.

![Screenshot of Pronouns account](/images/bluesky-pronouns.jpg)

## 3. Exploring Starter Packs

One of the most exciting features of Bluesky is the Starter Packs. They help you find the best people to follow and dive straight into relevant conversations. Here’s a curated list of standout packs for different tech interests:

### Must-Follow Starter Packs for Developers & Tech Enthusiasts

1. **Python🐍** by [@savannah.dev](https://bsky.app/starter-pack/savannah.dev/3l7y3twh7xm2l)
2. **OSS TypeScript Wizards** by [@colinhacks.com](https://bsky.app/starter-pack/did:plc:fkuikrrp65r77vzzpa54mgqd/3l7whzknnnf2l)
3. **Ruby and Rails Starter Pack** by [@joshuawood.net](https://bsky.app/starter-pack/joshuawood.net/3kw3olx5gf72m)
4. **Ruby, Rails and Web** by [@julianpinzon.com](https://bsky.app/starter-pack/julianpinzon.com/3l7zyk5zr6u2m)
5. **Front-end Friends** by [@kevinpowell.co](https://bsky.app/starter-pack/kevinpowell.co/3la4ubo64h32f)
6. **Syntax Guests** by [@syntax.fm](https://bsky.app/starter-pack/syntax.fm/3l7y2yf62cc2o)
7. **Indie Hackers** by [@tsanlis.bsky.social](https://bsky.app/starter-pack/tsanlis.bsky.social/3la4d6u4brk2v)
8. **Web Witch's Magic Makers in Tech** by [@seaotta.bsky.social](https://bsky.app/starter-pack/seaotta.bsky.social/3la4zssfkxw2x)
9. **Diversify Tech's Starter Pack** by [@diversifytech.com](https://bsky.app/starter-pack/diversifytech.com/3l7bakgvapc2m)
10. **Concept Artists** by [@arvalis.bsky.social](https://bsky.app/starter-pack/arvalis.bsky.social/3la2alhrfdy2t)
11. **NLP Researchers** by [@mariaa.bsky.social](https://bsky.app/starter-pack/mariaa.bsky.social/3la4hhvdgsp2s)
12. **Data Science** by [@chrisalbon.com](https://bsky.app/starter-pack/chrisalbon.com/3l7teencn4f2r)
13. **Retro FPS GameDev** by [@uk-resistant.bsky.social](https://bsky.app/starter-pack-short/2HPFAbA)
14. **Sentry and Friends** by [@sentry.io](https://bsky.app/starter-pack/sentry.io/3la4aiq4ga62y)

For a complete list of packs, visit [Bluesky Directory](https://blueskydirectory.com/starter-packs/all) or check this [Bluesky post on starter packs](https://bsky.app/profile/danawoodman.com/post/3l7yeqhnopp2s).

![Screenshot of Bluesky starter packs](/images/bluesky-starterpacks.jpg)

You're absolutely correct; this section is handling two distinct setups—one for a custom domain and another for using GitHub Pages as a handle. Let’s structure it so each setup is clearly separated, without redundant steps. Here’s a revised version that distinguishes between the two approaches:

---

## 4. Custom Domain Setup

Bluesky allows you to use a custom domain as your handle, giving your profile a professional edge. You can either set up a domain you own (like `loftwah.com`) or use GitHub Pages (like `loftwah.github.io`) if you don’t have a personal domain.

### Option 1: Using a Custom Domain (e.g., `loftwah.com`)

If you have a custom domain, you can link it to your Bluesky handle in just a few steps.

1. **Locate Your DID**: In Bluesky, go to **Settings → Change Handle → Custom Domain**. Your DID (Decentralized Identifier) will be displayed here (e.g., `did:plc:axc7n2yjep6ggdz7fuztluc4`).
2. **Configure Your DNS**: Go to your domain’s DNS settings and add a **TXT** record with the following details:
   - **Host/Name**: `_atproto`
   - **Type**: `TXT`
   - **Value**: `did=did:plc:YOUR_DID_HERE` (replace `YOUR_DID_HERE` with the DID displayed in Bluesky)
3. **Verify**: Return to **Settings → Change Handle → Custom Domain** in Bluesky and click **Verify**.

This will set your Bluesky handle to your custom domain.

### Option 2: Using GitHub Pages as Your Handle (e.g., `loftwah.github.io`)

If you don’t have a custom domain, you can use GitHub Pages to create a professional handle. Here’s how:

1. **Enable GitHub Pages**:

   - Go to your GitHub repository for the site you want to use as your handle (e.g., `loftwah.github.io`).
   - In **Settings → Pages**, select a branch to publish from, typically `main` or `master`, and save.

2. **Create the `.well-known` Folder**:

   - In your repository, create a folder named `.well-known`.
   - Inside this folder, add a file named `atproto-did`. In this file, enter your DID as shown in Bluesky (e.g., `did:plc:axc7n2yjep6ggdz7fuztluc4`).

3. **Add `_config.yml` to Include `.well-known`**:

   - In the root of your repository, create a file named `_config.yml`.
   - Add the following to include `.well-known` in the GitHub Pages build:
     ```yml
     include: [".well-known"]
     ```

4. **Publish and Verify**:
   - Once your GitHub Pages site is live at `https://loftwah.github.io`, go to **Settings → Change Handle → Custom Domain** in Bluesky, and enter `loftwah.github.io` as your custom domain.
   - Click **Verify** to complete the setup.

For a working example, you can reference this helpful [GitHub repo example](https://github.com/w3cj/w3cj.github.io).

### Option 3: Using GitLab Pages as Your Handle (e.g., `your-username.gitlab.io/your-repo-name`)

If you prefer GitLab Pages, you can set it up similarly to GitHub Pages.

1. **Enable GitLab Pages**:

   - Create a public repository in GitLab (e.g., `loftwah`) and clone it to your local machine.

   - In the repository, create a `.gitlab-ci.yml` file in the root to enable GitLab Pages:

     ```yaml
     pages:
       stage: deploy
       script:
         - mkdir -p public
         - cp -r .well-known public/
       artifacts:
         paths:
           - public
     ```

2. **Create the `.well-known` Folder**:

   - Inside the cloned repository, create a folder named `.well-known`.
   - In `.well-known`, create a file named `atproto-did`, and add your DID as shown in Bluesky (e.g., `did:plc:axc7n2yjep6ggdz7fuztluc4`).

3. **Commit and Push Changes to GitLab**:

   - Save the files, commit, and push your changes:

     ```bash
     git add .
     git commit -m "Add DID verification for GitLab Pages"
     git push origin main
     ```

4. **Find and Use Your GitLab Pages URL**:

   - Once your site is deployed, GitLab will provide a URL like `https://your-username.gitlab.io/your-repo-name`.
   - Go to **Settings → Change Handle → Custom Domain** in Bluesky and enter your GitLab Pages URL as your custom domain.

5. **Verify**:

   - Once GitLab Pages is live, click **Verify** in Bluesky to complete the setup.

---

For more information on GitLab Pages, check out GitLab’s documentation [here](https://docs.gitlab.com/ee/user/project/pages/). This setup allows you to use GitLab Pages as your handle in Bluesky without needing a custom domain.

---

For a working example, you can reference this helpful [GitLab repo example](https://gitlab.com/loftwah/loftwah.gitlab.io).

---

![Custom domain setup on Bluesky](/images/bluesky-custom-domain.jpg)

## 5. Managing Moderation and Content Preferences

Bluesky provides robust moderation tools to tailor your experience:

- **Content Filters**: Adjust your preferences in **Settings → Content Filters**.
- **Reporting**: Manage issues with built-in reporting tools.

![Bluesky moderation settings](/images/bluesky-moderation.jpg)

---

## 6. Setting Up the GitHub Labeler Bot

The GitHub Labeler bot (`@github-labeler.bsky.social`) helps you automatically add labels to repositories you contribute to. Here’s how to set it up correctly, step-by-step.

### Setup Instructions

1. **Follow the Labeler Bot**:

   * Go to the labeler’s profile: [github-labeler.bsky.social](https://bsky.app/profile/did:plc:xpxsa5aviwecd7cv6bzbmr5n).
   * Click on the **"..." menu** and select **Follow** to initiate the setup.

2. **Subscribe to the Labeler Bot**:

   * Go back to the labeler’s profile and select **Subscribe**. This confirms your agreement to allow the bot to interact with your repositories.

3. **Like the Labeler’s Profile**:

   * **Like** the labeler’s profile by tapping the heart icon. This step sends a direct message to the bot to confirm setup, allowing it to proceed with verification.

> **Important**: Make sure to follow these steps in the exact order above. If the order is incorrect, you may need to start over by unfollowing and then refollowing the bot to reset the process.

### Verifying Your GitHub Account

Once the initial steps are complete, the bot will prompt you to verify your GitHub account. Here’s what to do:

1. **Update Your GitHub Profile**:

   * Add your Bluesky handle to your GitHub profile bio. This step is necessary for the bot to verify your GitHub account.

2. **Send Your GitHub Username**:

   * In the chat with the bot, type your GitHub username in the format:

     ```plaintext
     github: loftwah
     ```

3. **Confirmation**:

   * The bot should respond with a success message once your account is verified.

### Linking a GitHub Repository

After verifying your GitHub account, you can link a repository to add labels. Here’s how:

1. **Send the Repository Name**:

   * In the chat with the bot, type the repository name in the format:

     ```plaintext
     repo: loftwah/linkarooie
     ```

2. **Wait for Confirmation**:

   * The bot will verify your ownership or contributor status for the specified repository and confirm that it qualifies for label management.

3. **Label Assignment**:

   * It may take a few minutes for the label to appear on the specified repository. The bot will automatically handle label updates going forward.

### Troubleshooting Tips

* **Incorrect Setup Order**: If you make a mistake during setup, you can **unfollow** the bot, then follow the steps again from the beginning.
* **Profile Verification Error**: Make sure your GitHub profile includes your Bluesky handle; otherwise, the bot can’t verify your account.
* **Repo Access Issues**: Only public repositories you own or contribute to can be managed by the labeler.

This setup gives your repositories a professional edge with automated label management on GitHub. Now you’re ready to stay organized with labels for your contributions!

![GitHub Labeller Profile](/images/bsky-github-labeller.jpg)

---

## Best Practices

- **Engage Authentically**: Make meaningful connections by sharing projects and insights.
- **Stay Consistent**: Regularly update your profile and posts to stay connected with your community.
- **Create Lists**: Share lists you’ve curated to help others find valuable accounts.

## Troubleshooting Common Issues

- **Domain Verification**: Ensure your `_atproto` record is set correctly.
- **Handle Availability**: Add context like your profession if your preferred handle is taken.

## Additional Resources

- [Bluesky Documentation](https://docs.bsky.app/)
- [Community Guidelines](https://bsky.social/about/support/community-guidelines)

**Last updated**: 12th of November, 2024

---
