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

Creating well-structured and engaging guides is key to offering a positive learning experience. By following these best practices, you can ensure that your guides provide value to both beginners and experts alike.

### 1. **Select the Right Difficulty Level**

Choosing the appropriate difficulty level is essential in setting the right expectations for your readers. Make sure each guide has a clearly defined difficulty level that matches the knowledge and experience required.

* **Beginner**:\
  Designed for those with little or no prior experience. No prerequisites should be necessary. Walk the reader through the basics, using simple language and clear explanations.

  * **Tip**: Focus on explaining concepts clearly without assuming prior knowledge.

* **Intermediate**:\
  Assumes the reader has some prior knowledge but may still need guidance with key concepts. These guides should aim to deepen understanding and introduce moderately complex topics.

  * **Tip**: Provide practical examples and encourage experimentation to reinforce learning.

* **Advanced**:\
  Suitable for experienced users who are familiar with advanced concepts. These guides should explore more complex topics and cutting-edge techniques.

  * **Tip**: Use a more technical tone and include challenging real-world examples.

### 2. **List Prerequisites Clearly**

Clearly state what your readers should know before starting the guide. This not only helps set expectations but also ensures that your readers can follow along without feeling lost.

* **Be Specific**:\
  Instead of simply saying "Basic JavaScript knowledge," list specific concepts (e.g., "Understanding of promises and async/await").

* **Link to Resources**:\
  Link to relevant documentation, tutorials, or previous guides for users to catch up if they lack the required knowledge.

  * **Tip**: If you have existing guides that cover these prerequisites, link to them to increase internal engagement.

### 3. **Use Consistent and Relevant Categories**

Organizing your guides into consistent, relevant categories makes it easier for users to find the content they need. The categories should be broad enough to cover related topics while still being specific enough to allow for precise classification.

* **Keep Categories Logical**:\
  Categories should reflect logical groupings like "Getting Started," "Advanced Techniques," or "API Integrations."

* **Cross-Link Content**:\
  If a guide fits into multiple categories or covers concepts relevant to other sections, cross-link guides to improve navigation.

  * **Tip**: Don’t create too many narrow categories—this can make navigation overwhelming. Strike a balance.

### 4. **Order Your Guides Thoughtfully**

The `order` field allows you to control how guides are presented, especially when creating learning paths or series. Guides should follow a logical progression, building knowledge step-by-step.

* **Create Learning Paths**:\
  Use the `order` field to guide your readers through a series of related guides, starting from the basics and progressing to more advanced topics. This helps structure the learning journey.

  * **Tip**: For multi-part series or sequential guides, be sure to include references to previous and upcoming guides in the series.

### 5. **Use Clear and Descriptive Titles**

A guide's title should give readers an immediate understanding of the topic and difficulty level. Descriptive titles help set expectations and improve searchability.

* **Avoid Jargon in Titles**:\
  Use terms that are widely understood, even by beginners. If jargon is necessary, explain it early in the guide.

  * **Tip**: Include actionable phrases in your titles, like "How to" or "Understanding," to help readers quickly grasp the content's purpose.

### 6. **Break Down Content with Headers and Lists**

Breaking down complex ideas into digestible sections is key to maintaining readability and engagement.

* **Use Headers for Structure**:\
  Clear, descriptive headers help guide readers through the content and make the guide skimmable. Subdivide content into logical sections to maintain flow.

* **Use Lists for Clarity**:\
  Bulleted or numbered lists are great for conveying sequential steps or summarizing key points concisely.

  * **Tip**: Keep sections concise. Long blocks of text can overwhelm readers.

### 7. **Include Visual Aids**

Adding screenshots, diagrams, and videos can dramatically improve comprehension, especially for complex topics.

* **Screenshots**:\
  Visual aids like screenshots or GIFs can highlight specific parts of code, user interfaces, or outputs, making it easier for readers to follow along.

* **Diagrams**:\
  When explaining systems or workflows, diagrams can simplify abstract concepts.

  * **Tip**: Label all visual aids clearly and reference them in the guide to connect them with the related content.

### 8. **Provide Code Examples**

Ensure that you include well-structured code examples to support your explanations. Readers should be able to copy-paste the examples into their own projects to see results.

* **Break Down Code**:\
  Explain what each part of the code does, especially for more complex examples. This allows readers to understand the logic, not just copy-paste.

* **Highlight Common Pitfalls**:\
  Anticipate mistakes or potential misunderstandings and address them directly in your explanations.

  * **Tip**: Use syntax highlighting in code blocks to improve readability.

### 9. **Test Your Guides**

Before publishing a guide, thoroughly test each step to ensure that the instructions are correct and work as expected.

* **Walkthrough as a Reader**:\
  Go through the guide yourself, or ask someone with a similar knowledge level to follow it. This will help you spot unclear instructions or missing steps.

  * **Tip**: Update guides when dependencies or frameworks change, to ensure they remain relevant and functional.

### 10. **Keep Guides Evergreen**

Since guides are meant to be more permanent than blog posts, periodically update them to reflect changes in technology, frameworks, or tools.

* **Version Control**:\
  For guides that depend on specific versions of software or tools, include version numbers and note when updates affect the guide.

* **Mark Updated Sections**:\
  When making updates, highlight what has changed to make it easier for returning readers.

  * **Tip**: Regularly review older guides to ensure their relevance and accuracy.

## Next Steps: Feature Enhancements

Once you have your guides section set up, consider adding these advanced features to improve the user experience:

- **Guide series/sequences:** Group related guides into a series that can be followed in sequence.
- **Progress tracking:** Allow users to track their progress through a series of guides.
- **Completion status:** Implement a system to mark guides as "complete" once a reader finishes.
- **Related guides:** Suggest related guides to readers at the end of each guide.

## Conclusion

Guides offer a more structured, evergreen way of presenting content. With the setup above, you can create categories, define difficulty levels, and offer prerequisites to help users navigate your content more easily. Remember to update your guides as your blog evolves—guides are living documents that can grow and adapt over time.

---
