---
title: "Adding Guides to Your Astro Blog"
description: "Learn how to extend your Astro blog with a dedicated guides section, complete with categories, difficulty levels, and prerequisites"
difficulty: "intermediate"
category: "Site Features"
order: 1
heroImage: "/images/blog-placeholder-2.jpg"
prerequisites:
  ["Existing Astro Blog", "Basic TypeScript", "Basic Astro Knowledge"]
---

# Adding Guides to Your Astro Blog

When you're running a technical blog, sometimes you want to create content that's more structured and permanent than regular blog posts. That's where guides come in! This guide will walk you through how we added the very guide system you're reading right now.

## Why Separate Guides from Blog Posts?

While blog posts are great for timely updates, tutorials, and thoughts, guides serve a different purpose:

- They're more evergreen content
- They can be organized by difficulty level
- They can specify prerequisites
- They can be categorized and ordered manually
- They don't need to be sorted by date

## Step 1: Define the Guides Collection

First, we'll modify our `src/content/config.ts` file to add a new collection for guides alongside our blog posts:

```typescript
const guides = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    category: z.string(),
    order: z.number().optional(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    prerequisites: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, guides };
```

The key differences from blog posts are:

- Added `difficulty` enum
- Added `category` for organization
- Added `order` for manual sorting
- Added `prerequisites` array
- Removed required `pubDate` since guides are evergreen

## Step 2: Create the Guides Directory

Create a new directory for your guides:

```bash
mkdir src/content/guides
```

## Step 3: Create the Guides Index Page

Create a new file at `src/pages/guides/index.astro` that will list all your guides, grouped by category. This page includes:

- A grid layout for guide cards
- Visual difficulty indicators
- Category grouping
- Prerequisites display
- Responsive design

## Step 4: Add Guide Styling

The guides index page includes custom styling for:

- Guide cards with hover effects
- Difficulty badges with color coding:
  - Beginner: Green
  - Intermediate: Orange
  - Advanced: Pink
- Category headers with accent underlines
- Responsive grid layout

## Step 5: Writing Your First Guide

When creating a new guide (like this one!), start with the frontmatter:

```markdown
---
title: "Adding Guides to Your Astro Blog"
description: "Learn how to extend your Astro blog with a dedicated guides section"
difficulty: "intermediate"
category: "Site Features"
order: 1
prerequisites:
  ["Existing Astro Blog", "Basic TypeScript", "Basic Astro Knowledge"]
---
```

Then write your guide content using standard Markdown. Consider including:

- Clear step-by-step instructions
- Code examples
- Explanations of key concepts
- Tips and best practices
- Common pitfalls to avoid

## Best Practices for Guides

1. **Choose the Right Difficulty Level**

   - Beginner: No special knowledge required
   - Intermediate: Requires basic understanding of concepts
   - Advanced: Requires significant prior knowledge

2. **List Prerequisites Clearly**

   - Be specific about what knowledge is needed
   - Link to relevant beginner guides when possible

3. **Use Consistent Categories**

   - Create broad categories that can group multiple guides
   - Use existing categories when possible

4. **Order Thoughtfully**
   - Use the `order` field to create learning paths
   - Lower numbers appear first in the category

## What's Next?

Now that you have guides set up, consider:

- Creating a "Getting Started" guide series
- Adding more advanced features like:
  - Guide series/sequences
  - Progress tracking
  - Guide completion status
  - Related guides suggestions

Remember, guides are living documents - keep them updated as your site evolves!
