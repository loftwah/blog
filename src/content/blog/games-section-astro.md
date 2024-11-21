---
title: "Building a Games Section for My Astro Blog"
description: "How I created a Games section in my Astro blog with markdown-driven content, filtering, and a focus on accessibility and performance."
pubDate: "Nov 21, 2024"
heroImage: "/images/games-section-astro.jpg"
author: "Dean Lofts (Loftwah)"
---

# Building a Games Section for My Astro Blog

Gaming has been a lifelong passion, but balancing work, family, and hobbies often pushes it aside. Recently, with a week off work and an Xbox GamePass subscription, I saw an opportunity to organize my gaming backlog while diving deeper into Astro's features.

This post outlines how I built a **Games section** for my Astro blog, featuring markdown-driven content, dynamic filtering, rich metadata, and accessibility-focused design.

---

## Goals

- **Markdown-Driven Content**: Manage game data like descriptions, progress, and metadata using markdown files.
- **Dynamic Pages**: Automatically generate individual game pages with rich metadata and related game suggestions.
- **Filtering and Sorting**: Provide client-side filtering by platform, status, and sorting options.
- **Performance and SEO**: Ensure fast loading times, optimized images, and accessible design.
- **Scalability**: Create a maintainable structure for easy expansion.

---

## Step 1: Define Game Metadata

The foundation of the Games section starts with defining the `Game` type and its associated metadata schema. This ensures consistent data handling across components and pages.

### TypeScript Game Type

```typescript
export type GameStatus = "completed" | "in-progress" | "backlog";

export type Game = {
  title: string;
  description: string;
  releaseDate: string;
  platforms: string[];
  genres: string[];
  heroImage: string;
  thumbnailImage: string;
  tags: string[];
  status?: GameStatus;
  rating?: number;
  playtime?: number;
  lastPlayed?: string;
};
```

### Astro Content Schema

```typescript
import { defineCollection, z } from "astro:content";

export const gamesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    releaseDate: z.string(),
    platforms: z.array(z.string()),
    genres: z.array(z.string()),
    heroImage: z.string(),
    thumbnailImage: z.string(),
    tags: z.array(z.string()),
    status: z.enum(["completed", "in-progress", "backlog"]).optional(),
    rating: z.number().min(1).max(5).optional(),
    playtime: z.number().optional(),
    lastPlayed: z.string().optional(),
  }),
});
```

---

## Step 2: Adding Game Content

Each game is stored as a markdown file. Here's an example for **Arcade Paradise**:

### File: `src/content/games/arcade-paradise.md`

```markdown
---
title: "Arcade Paradise"
description: "A quirky management sim where you turn a laundromat into a thriving arcade."
releaseDate: "2022-08-11"
platforms:
  - PC
  - Xbox
  - PlayStation
genres:
  - Simulation
  - Management
heroImage: "/images/games/arcade-paradise-3x1.jpg"
thumbnailImage: "/images/games/arcade-paradise-1x1.jpg"
tags:
  - Simulation
  - Indie
  - Nostalgia
status: "in-progress"
rating: 4
playtime: 10
lastPlayed: "2024-11-19"
---

## Getting Started

- Start by running the laundromat to earn cash.
- Use your earnings to purchase arcade machines and upgrades.

## Tips

- Upgrade machines strategically to boost revenue.
- Keep the laundromat clean to maximize customer satisfaction.
```

---

## Step 3: Create the GameCard Component

The `GameCard` component displays individual game summaries and links to detail pages.

```astro
---
import type { Game } from '../types/games';

type Props = {
  game: Game;
  slug: string;
};

const { game, slug } = Astro.props;

const getStatusColor = (status: Game['status']) => {
  const colors = {
    completed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    backlog: 'bg-gray-100 text-gray-800',
  };
  return status ? colors[status] : '';
};
---

<article
  class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
  data-platforms={game.platforms.join(',')}
  data-status={game.status}
  data-rating={game.rating}
  data-title={game.title}
  data-last-played={game.lastPlayed}
>
  <a href={`/games/${slug}`} class="block">
    <img src={game.thumbnailImage} alt={game.title} class="w-full h-48 object-cover" />
    <div class="p-4">
      <h2 class="font-bold">{game.title}</h2>
      <p>{game.description}</p>
      <span>{game.rating ? `Rating: ${game.rating}/5` : 'No rating yet'}</span>
    </div>
  </a>
</article>
```

---

## Step 4: Build the Games Index Page

The index page dynamically lists all games and supports filtering and sorting.

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import GameCard from '../components/GameCard.astro';

const games = await getCollection('games');
---

<BaseLayout>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-4xl font-bold mb-8">Games Collection</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {games.map((game) => (
        <GameCard game={game.data} slug={game.slug} />
      ))}
    </div>
  </div>
</BaseLayout>
```

---

## Step 5: Filtering and Sorting with JavaScript

To enhance user experience, I added client-side filtering and sorting. Users can filter by platform, status, or sort by rating.

```javascript
const filterGames = () => {
  const platform = document.getElementById("platform-filter").value;
  const status = document.getElementById("status-filter").value;
  const sort = document.getElementById("sort-filter").value;

  const cards = document.querySelectorAll(".game-card");
  cards.forEach((card) => {
    const matchesPlatform =
      platform === "all" || card.dataset.platforms.includes(platform);
    const matchesStatus = status === "all" || card.dataset.status === status;

    if (matchesPlatform && matchesStatus) {
      card.classList.remove("hidden");
    } else {
      card.classList.add("hidden");
    }
  });

  // Sorting logic
};
```

---

## Step 6: Individual Game Pages

Each game page includes detailed information, progress updates, and related game suggestions.

```astro
<BaseLayout>
  <h1>{game.title}</h1>
  <img src={game.heroImage} alt={game.title} />
  <Content />
  {relatedGames.length > 0 && <RelatedGames games={relatedGames} />}
</BaseLayout>
```

---

## Performance and SEO Enhancements

1. **Image Optimization**: Lazy loading and responsive sizing.
2. **SEO Improvements**: Meta tags, structured data, and canonical URLs.
3. **Accessibility**: ARIA labels, keyboard navigation, and semantic HTML.

---

## Conclusion

Building this Games section was an enjoyable challenge. It allowed me to combine my love for gaming with Astro's powerful features, creating a dynamic and scalable solution for organizing my gaming backlog.

Time to tackle my GamePass library!
