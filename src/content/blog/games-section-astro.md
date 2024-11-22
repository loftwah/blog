---
title: "Creating a Games Section for My Astro Blog"
description: "How I designed and built a games section in my Astro blog, complete with filtering, sorting, and enhanced user experience."
pubDate: "Nov 21, 2024"
heroImage: "/images/games-section-astro.jpg"
author: "Dean Lofts (Loftwah)"
---

# Creating a Games Section for My Astro Blog

**Author:** Dean Lofts (Loftwah)  
**Date:** November 21, 2024  
**Description:** How I built a dynamic Games section in my Astro blog with markdown-driven content, filtering, and performance-focused design.

---

## Introduction

Gaming has been a cornerstone of my free time, and like many, I’ve accumulated a backlog of titles that I’ve wanted to track and organise. As a developer, I saw this as the perfect opportunity to blend my love for gaming with my skills in Astro, TypeScript, and Tailwind CSS. The result? A dynamic, scalable Games section for my blog.

This guide walks you through how I built this feature from scratch, covering:

1. Structuring game data with markdown and schemas
2. Creating reusable components
3. Adding client-side filtering and sorting
4. Optimising for performance and accessibility

---

## Goals

1. **Markdown-Driven Content**: Use markdown for game metadata and updates.
2. **Dynamic Pages**: Auto-generate individual pages for each game.
3. **Interactive Filtering and Sorting**: Enable users to filter by platform, status, and more.
4. **Performance Optimisation**: Ensure fast loading with optimised images and lazy loading.
5. **Accessibility**: Make it usable for everyone.

---

## Step 1: Define Types and Schemas

To manage game data efficiently, I started by defining strict TypeScript types and schemas.

### Game Type (`src/types/games.ts`)

```typescript
export type Platform = "PC" | "Xbox" | "PlayStation" | "Switch";
export type Genre = "RPG" | "Simulation" | "Action" | "Adventure";
export type GameStatus = "completed" | "in-progress" | "backlog" | "wishlist";

export type Game = {
  title: string;
  description: string;
  releaseDate: Date;
  platforms: Platform[];
  genres: Genre[];
  heroImage: string;
  thumbnailImage: string;
  tags: string[];
  status: GameStatus;
  rating?: number;
  playtime?: number;
  lastPlayed?: Date;
};
```

### Content Schema (`src/content/games/_schema.ts`)

```typescript
import { z } from "astro:content";

export const gameSchema = z.object({
  title: z.string(),
  description: z.string(),
  releaseDate: z.string().transform((date) => new Date(date)),
  platforms: z.array(z.string()),
  genres: z.array(z.string()),
  heroImage: z.string(),
  thumbnailImage: z.string(),
  tags: z.array(z.string()),
  status: z.enum(["completed", "in-progress", "backlog", "wishlist"]),
  rating: z.number().min(1).max(5).optional(),
  playtime: z.number().optional(),
  lastPlayed: z.string().transform((date) => new Date(date)).optional(),
});
```

Update your Astro content configuration:

```typescript
import { defineCollection } from "astro:content";
import { gameSchema } from "./games/_schema";

export const collections = {
  games: defineCollection({ schema: gameSchema }),
};
```

---

## Step 2: Add Game Content

Each game entry is stored as a markdown file. Here’s an example for **Arcade Paradise**:

```markdown
---
title: "Arcade Paradise"
description: "Turn a laundromat into a thriving arcade in this quirky management sim."
releaseDate: "2022-08-11"
platforms:
  - "PC"
  - "Xbox"
  - "PlayStation"
genres:
  - "Simulation"
  - "Action"
heroImage: "/images/games/arcade-paradise-hero.jpg"
thumbnailImage: "/images/games/arcade-paradise-thumb.jpg"
tags:
  - "indie"
  - "nostalgia"
status: "in-progress"
rating: 4
playtime: 10
lastPlayed: "2024-11-19"
---
## My Progress
- Purchased 8 arcade machines
- Weekly income: $1,500
- Goal: Unlock all hidden mini-games

## Tips
- Upgrade arcade machines to increase revenue.
- Keep the laundromat clean for bonus income.
```

---

## Step 3: Build Components

### GameCard Component (`src/components/GameCard.tsx`)

```tsx
import type { Game } from "../types/games";

export const GameCard = ({ game }: { game: Game }) => {
  const statusColors = {
    completed: "bg-green-100 text-green-800",
    "in-progress": "bg-blue-100 text-blue-800",
    backlog: "bg-gray-100 text-gray-800",
    wishlist: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="game-card bg-white rounded-lg shadow-md overflow-hidden">
      <img src={game.thumbnailImage} alt={game.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-bold">{game.title}</h3>
        <p className="text-sm">{game.description}</p>
        <span className={`px-2 py-1 rounded-full ${statusColors[game.status]}`}>{game.status}</span>
      </div>
    </div>
  );
};
```

### GameFilter Component (`src/components/GameFilter.tsx`)

```tsx
import { useState } from "react";

export const GameFilter = ({ onFilterChange }: { onFilterChange: Function }) => {
  const [status, setStatus] = useState("all");

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    onFilterChange({ status: e.target.value });
  };

  return (
    <div className="game-filter">
      <select value={status} onChange={handleStatusChange}>
        <option value="all">All Statuses</option>
        <option value="completed">Completed</option>
        <option value="in-progress">In Progress</option>
        <option value="backlog">Backlog</option>
        <option value="wishlist">Wishlist</option>
      </select>
    </div>
  );
};
```

---

## Step 4: Create Pages

### Games Index Page (`src/pages/games/index.astro`)

```astro
---
// Astro imports
import { getCollection } from "astro:content";
import GameCard from "../../components/GameCard";
import GameFilter from "../../components/GameFilter";

const games = await getCollection("games");
---

<GameFilter client:load />

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {games.map((game) => (
    <GameCard game={game.data} />
  ))}
</div>
```

### Individual Game Page (`src/pages/games/[slug].astro`)

```astro
---
// Astro imports
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const games = await getCollection("games");
  return games.map((game) => ({
    params: { slug: game.slug },
  }));
}

const { game } = Astro.props;
---

<article>
  <h1>{game.data.title}</h1>
  <img src={game.data.heroImage} alt={game.data.title} />
  <p>{game.data.description}</p>
  <Content />
</article>
```

---

## Step 5: Add Filtering and Sorting

Integrate client-side JavaScript for interactivity.

```javascript
const filterGames = () => {
  const status = document.getElementById("status-filter").value;
  const cards = document.querySelectorAll(".game-card");

  cards.forEach((card) => {
    const matchesStatus = status === "all" || card.dataset.status === status;
    card.style.display = matchesStatus ? "block" : "none";
  });
};

document.getElementById("status-filter").addEventListener("change", filterGames);
```

---

## Conclusion

Creating this Games section combined my passion for gaming with my love of development. With Astro’s content collections, TypeScript, and Tailwind CSS, I built a feature-rich, dynamic, and accessible section that I can expand over time.

If you’re looking to do something similar, I hope this guide provides inspiration. Time to dive back into **Arcade Paradise**!

--- 
