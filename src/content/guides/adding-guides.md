---
title: "Adding Guides to Your Astro Blog"
description: "Learn how to extend your Astro blog with a dedicated guides section, complete with categories, difficulty levels, and prerequisites."
difficulty: "intermediate"
category: "Site Features"
order: 1
heroImage: "/images/guides-xzibit.jpg"
prerequisites:
  ["Existing Astro Blog", "Basic TypeScript", "Basic Astro Knowledge"]
---

# Adding Guides to Your Astro Blog

Running a technical blog often means creating content that’s evergreen, structured, and easily referenced, which blog posts alone can't always provide. Guides serve as a dedicated section for this type of content. In this guide, we’ll walk through how to set up a guide system for your Astro blog, including adding features like categories, difficulty levels, and prerequisites.

## Why Create a Separate Guide Section?

Blog posts are great for timely updates, tutorials, and reflections, but guides are better suited for content that’s meant to be referenced over time. Here’s why you might want a dedicated guide section:

- **Evergreen content:** Guides aren’t tied to dates; they remain relevant for longer periods.
- **Difficulty levels:** You can sort guides by skill level (beginner, intermediate, advanced).
- **Prerequisites:** You can list required knowledge or resources up front.
- **Manual ordering:** Guides can be arranged in a specific sequence, creating learning paths.
- **Category grouping:** Group guides into logical categories for easy navigation.

## Step 1: Define the Guide Collection

First, you need to define a collection specifically for guides in your `src/content/config.ts`. This defines the schema for your guides and allows for features like difficulty, categories, and more. Here's what the schema looks like:

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

**Explanation:**

- **title & description:** These fields describe the guide content.
- **difficulty:** This enum allows you to define difficulty levels (e.g., beginner, intermediate, advanced).
- **category:** A string to group guides by topics like “Front-end,” “Back-end,” etc.
- **order:** Optional field for manually ordering guides within categories.
- **updatedDate:** Optional date field for when the guide was last updated.
- **heroImage:** Optional field for a visual header image.
- **prerequisites:** A list of skills or knowledge the reader should have before diving into the guide.

### Why We Made These Changes:

- **Guides vs. Blog Posts:** The schema is more specific than a blog post schema because guides benefit from structure, prerequisites, and manual sorting rather than chronological order.
- **Evergreen focus:** Unlike blogs, guides don't have a `pubDate` as they aren't tied to a specific date.

## Step 2: Create a Directory for Guides

To keep your project organized, create a new folder for storing your guide files:

```bash
mkdir src/content/guides
```

Each guide will reside in its own Markdown file within this directory, similar to how you store blog posts, but under its own dedicated folder.

## Step 3: Build the Guides Index Page

To display all your guides, create an index page at `src/pages/guides/index.astro`. This page will:

- Group guides by category.
- Display difficulty levels visually with badges or labels.
- Show prerequisites and relevant information for each guide.

### Example Code for Index Page:

```astro
---
import { getCollection } from 'astro:content';
const guides = await getCollection('guides');
---

<h1>Guides</h1>
{guides
  .filter(guide => guide.category)
  .reduce((categories, guide) => {
    (categories[guide.category] ||= []).push(guide);
    return categories;
  }, {}) |> Object.entries
  |> sortCategoriesByOrder
}.map(([category, guides]) => (
  <>
    <h2>{category}</h2>
    <div class="guide-grid">
      {guides.map(guide => (
        <div class="guide-card">
          <img src={guide.heroImage} alt="" />
          <h3>{guide.title}</h3>
          <p>{guide.description}</p>
          <div class="badge {guide.difficulty.toLowerCase()}">{guide.difficulty}</div>
          {guide.prerequisites.length ? (
            <ul>
              {guide.prerequisites.map(pre => (
                <li>{pre}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  </>
))
```

**Features:**

- **Category grouping:** Guides are grouped by their category field.
- **Visual difficulty indicator:** Badges for difficulty levels (beginner, intermediate, advanced).
- **Prerequisites list:** Displayed for each guide, ensuring readers know what’s needed beforehand.

## Step 4: Custom Styling for Guides

You’ll want your guides to have a unique visual identity compared to your blog posts. Here are some ideas for custom styles:

- **Difficulty badges:** Use color coding for each difficulty level. For example:
  - Beginner: Green
  - Intermediate: Orange
  - Advanced: Pink
- **Card layout:** Guides should be displayed as cards with hover effects.
- **Category headers:** Add a custom underline or accent color for each category header to visually separate sections.
- **Responsive grid:** Ensure the grid of guide cards is responsive and adapts well to different screen sizes.

Example CSS:

```css
.guide-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  transition: transform 0.2s;
}

.guide-card:hover {
  transform: translateY(-5px);
}

.badge {
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
}

.badge.beginner { background-color: #28a745; }
.badge.intermediate { background-color: #ff9800; }
.badge.advanced { background-color: #e91e63; }

.guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
```

## Step 5: Write Your First Guide

When creating a new guide, you’ll define frontmatter just like a blog post. Here’s an example:

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

Write the guide content in Markdown, making sure to:

- Provide **step-by-step instructions**.
- Include **code examples** that readers can easily copy and modify.
- Explain **key concepts** and **best practices**.
- Highlight **common pitfalls** and how to avoid them.

## Best Practices for Writing Guides

To make your guides more effective, keep the following in mind:

1. **Select the Right Difficulty Level**:  
   Be clear about the target audience:
   - Beginner: Suitable for newcomers with no prerequisites.
   - Intermediate: Requires basic knowledge in the topic.
   - Advanced: Assumes significant expertise.

2. **List Prerequisites Clearly**:  
   Provide links to relevant tutorials or documentation. This helps readers know if they’re ready for the guide.

3. **Use Consistent Categories**:  
   Organize your guides under broad categories that make navigation easier. Keep these categories relevant to your content.

4. **Order Your Guides Thoughtfully**:  
   The `order` field allows you to arrange guides into logical learning paths, making it easy for readers to follow along.

## Next Steps: Feature Enhancements

Once you have your guides section set up, consider adding these advanced features to improve the user experience:

- **Guide series/sequences:** Group related guides into a series that can be followed in sequence.
- **Progress tracking:** Allow users to track their progress through a series of guides.
- **Completion status:** Implement a system to mark guides as "complete" once a reader finishes.
- **Related guides:** Suggest related guides to readers at the end of each guide.

## Conclusion

Guides offer a more structured, evergreen way of presenting content. With the setup above, you can create categories, define difficulty levels, and offer prerequisites to help users navigate your content more easily. Remember to update your guides as your blog evolves—guides are living documents that can grow and adapt over time.

---
