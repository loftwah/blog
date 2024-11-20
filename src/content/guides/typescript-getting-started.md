---
title: "Ahoy! Set Sail with TypeScript and Bun: A Pirate's Guide for 2024"
description: "Hoist the sails and navigate the coding seas! Master the fundamentals of TypeScript and Bun to embark on a legendary programming adventure and craft your own digital treasures."
difficulty: "beginner"
category: "Web Development"
order: 15
heroImage: "/images/bun.png"
prerequisites:
  - "Basic understanding of JavaScript"
  - "Willingness to embrace pirate puns"
  - "An eagerness to learn and explore Bun"
---

# Arrr! Building a Bluesky Leaderboard with Bun: A Pirate's Guide

Ahoy, matey! Welcome aboard this grand adventure where we'll set sail to build a mighty **Bluesky Leaderboard System** using [Bun](https://bun.sh/), the fastest ship in the JavaScript seas. We'll track user activity, process engagement metrics, and crown the kings and queens of the Bluesky ocean.

So hoist the Jolly Roger, grab yer eyepatch, and let's dive into the code!

---

## 🏴‍☠️ Table of Contents

1. [The Quest Begins: Understanding Our Mission](#the-quest-begins)
2. [Preparation: Setting Up the Environment](#preparation)
3. [Charting the Course: Defining Data Types](#charting-the-course)
4. [Hoisting the Sails: Writing Data Processing Functions](#hoisting-the-sails)
5. [Storing the Booty: Working with SQLite in Bun](#storing-the-booty)
6. [Listening to the Parrot: Connecting to the Firehose](#listening-to-the-parrot)
7. [Manning the Ship: Putting It All Together](#manning-the-ship)
8. [Anchors Aweigh: Running and Testing the Application](#anchors-aweigh)
9. [Guarding the Treasure: Key Implementation Points](#guarding-the-treasure)
10. [The Treasure Map: Directory Structure and Files](#the-treasure-map)
11. [Final Thoughts: Sailing Into the Sunset](#final-thoughts)

---

<a name="the-quest-begins"></a>

## 1. 🏴‍☠️ The Quest Begins: Understanding Our Mission

Imagine you're the captain of a ship, and you want to know which pirates (users) are the most active and influential on the Bluesky seas. Our mission is to build a system that:

- **Collects real-time data** from the Bluesky firehose (like messages in bottles floating our way).
- **Processes and stores** this data securely in our treasure chest (database).
- **Analyzes** the data to generate leaderboards (ranking the fiercest pirates).
- **Runs efficiently** using Bun, our swift and trusty vessel.

By the end of this guide, you'll have a working application that collects data from Bluesky, processes it, and displays a leaderboard of the most engaged users.

---

<a name="preparation"></a>

## 2. 🧰 Preparation: Setting Up the Environment

### Install Bun

First, we need to install Bun, a fast JavaScript runtime like Node.js but with superpowers.

Follow the [Bun installation guide](https://bun.sh/docs/installation):

```bash
curl -fsSL https://bun.sh/install | bash
```

### Verify the Installation

Ensure Bun is installed correctly:

```bash
bun --version
```

You should see the version number printed out.

### Create a Project Directory

Let's create a new directory for our project:

```bash
mkdir bluesky-leaderboard
cd bluesky-leaderboard
```

### Initialize a Bun Project

Initialize the project with Bun:

```bash
bun init
```

This command will prompt you to set up your `package.json` file.

---

<a name="charting-the-course"></a>

## 3. 🗺️ Charting the Course: Defining Data Types

Let's define the data structures we'll be working with.

Create a `src/types.ts` file:

```typescript
// Define the types of events we'll encounter on the seas
const BLUESKY_EVENT_TYPES = ["post", "like", "repost", "follow", "reply", "quote"] as const;
type BlueskyEventType = (typeof BLUESKY_EVENT_TYPES)[number];

// The treasure we find (events) have these properties
type BlueskyEvent = {
  type: BlueskyEventType;
  uri: string;
  did: string; // Decentralized Identifier of the pirate
  createdAt: string;
  text?: string;
  replyTo?: string;
  quotedUri?: string;
};

// Each pirate's stats for the leaderboard
type LeaderboardEntry = {
  did: string;
  handle: string;
  metrics: {
    posts: number;
    likes: number;
    reposts: number;
    replies: number;
    quotes: number;
    followers: number;
  };
  engagementScore: number;
};

// Time periods for our treasure hunts
const TIME_PERIODS = ["24h", "7d", "30d"] as const;
type TimePeriod = (typeof TIME_PERIODS)[number];

type LeaderboardConfig = {
  period: TimePeriod;
  minimumPosts: number;
  limit: number; // How many pirates to show on the leaderboard
};
```

**Explanation:**

- **BlueskyEventType**: Represents the types of events we can receive using `const` assertions for unions.
- **BlueskyEvent**: The structure of an event from Bluesky.
- **LeaderboardEntry**: Represents a user's metrics and engagement score.
- **TimePeriod**: The time frames for which we can generate leaderboards.

---

<a name="hoisting-the-sails"></a>

## 4. 🏴‍☠️ Hoisting the Sails: Writing Data Processing Functions

Create a `src/utils.ts` file to hold our utility functions.

### Parsing Events

```typescript
import { BlueskyEvent, BLUESKY_EVENT_TYPES } from './types';

// Validate if data is a valid BlueskyEvent
const isValidEventData = (data: any): data is BlueskyEvent => {
  return (
    data &&
    BLUESKY_EVENT_TYPES.includes(data.type) &&
    typeof data.uri === 'string' &&
    typeof data.did === 'string' &&
    typeof data.createdAt === 'string'
  );
};

// Parse raw data into a BlueskyEvent
export const parseBlueskyEvent = (data: unknown): BlueskyEvent | null => {
  if (typeof data !== 'object' || data === null) return null;
  if (!isValidEventData(data)) return null;

  return {
    type: data.type,
    uri: data.uri,
    did: data.did,
    createdAt: data.createdAt,
    text: data.text,
    replyTo: data.replyTo,
    quotedUri: data.quotedUri,
  };
};
```

**Explanation:**

- **isValidEventData**: A type guard to check if the data conforms to `BlueskyEvent`.
- **parseBlueskyEvent**: Parses raw data into a `BlueskyEvent` if valid.

### Calculating User Metrics

```typescript
import { BlueskyEvent, LeaderboardEntry } from './types';

// Calculate metrics for a user
export const calculateUserMetrics = (
  events: BlueskyEvent[],
  userDid: string
): LeaderboardEntry['metrics'] => {
  return events.reduce(
    (metrics, event) => {
      if (event.did !== userDid) return metrics;

      switch (event.type) {
        case 'post':
          metrics.posts++;
          break;
        case 'like':
          metrics.likes++;
          break;
        case 'repost':
          metrics.reposts++;
          break;
        case 'reply':
          metrics.replies++;
          break;
        case 'quote':
          metrics.quotes++;
          break;
        case 'follow':
          metrics.followers++;
          break;
      }

      return metrics;
    },
    { posts: 0, likes: 0, reposts: 0, replies: 0, quotes: 0, followers: 0 }
  );
};
```

### Calculating Engagement Score

```typescript
// Calculate engagement score based on user metrics
export const calculateEngagementScore = (
  metrics: LeaderboardEntry['metrics']
): number => {
  const totalEngagements =
    metrics.likes + metrics.reposts * 2 + metrics.quotes * 3;

  return metrics.posts === 0 ? 0 : totalEngagements / metrics.posts;
};
```

### Filtering Events by Time Period

```typescript
import { TimePeriod } from './types';

// Get the cutoff date based on the time period
export const getPeriodCutoff = (period: TimePeriod): Date => {
  const now = new Date();
  const cutoff = new Date(now);

  switch (period) {
    case '24h':
      cutoff.setHours(now.getHours() - 24);
      break;
    case '7d':
      cutoff.setDate(now.getDate() - 7);
      break;
    case '30d':
      cutoff.setDate(now.getDate() - 30);
      break;
  }

  return cutoff;
};

// Filter events based on the time period
export const filterEventsByPeriod = (
  events: BlueskyEvent[],
  period: TimePeriod
): BlueskyEvent[] => {
  const cutoff = getPeriodCutoff(period);
  return events.filter((event) => new Date(event.createdAt) >= cutoff);
};
```

### Generating the Leaderboard

```typescript
import { LeaderboardConfig, LeaderboardEntry } from './types';
import { calculateUserMetrics, calculateEngagementScore } from './utils';

// Generate the leaderboard
export const generateLeaderboard = (
  events: BlueskyEvent[],
  config: LeaderboardConfig,
  handleMap: Map<string, string>
): LeaderboardEntry[] => {
  // Group events by user
  const userEventsMap = new Map<string, BlueskyEvent[]>();

  events.forEach((event) => {
    if (!userEventsMap.has(event.did)) {
      userEventsMap.set(event.did, []);
    }
    userEventsMap.get(event.did)!.push(event);
  });

  // Calculate metrics and scores
  const entries: LeaderboardEntry[] = [];

  userEventsMap.forEach((userEvents, did) => {
    const metrics = calculateUserMetrics(userEvents, did);
    if (metrics.posts < config.minimumPosts) return;

    const engagementScore = calculateEngagementScore(metrics);
    const handle = handleMap.get(did) || did;

    entries.push({
      did,
      handle,
      metrics,
      engagementScore,
    });
  });

  // Sort and limit the leaderboard
  return entries
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, config.limit);
};
```

---

<a name="storing-the-booty"></a>

## 5. 💰 Storing the Booty: Working with SQLite in Bun

Bun provides built-in support for SQLite, so we don't need any external libraries.

### Setting Up the Database

Create a `src/database.ts` file:

```typescript
import { Database } from 'bun:sqlite';
import { BlueskyEvent } from './types';

export const initializeDatabase = (dbPath: string): Database => {
  const db = new Database(dbPath);

  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      uri TEXT,
      did TEXT,
      created_at TEXT,
      text TEXT,
      reply_to TEXT,
      quoted_uri TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS handles (
      did TEXT PRIMARY KEY,
      handle TEXT
    )
  `);

  return db;
};
```

### Saving Events

```typescript
import { Database } from 'bun:sqlite';
import { BlueskyEvent } from './types';

// Save an event to the database
export const saveEvent = (db: Database, event: BlueskyEvent): void => {
  const query = `
    INSERT INTO events (
      type, uri, did, created_at, text, reply_to, quoted_uri
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    event.type,
    event.uri,
    event.did,
    event.createdAt,
    event.text || null,
    event.replyTo || null,
    event.quotedUri || null,
  ]);
};
```

### Fetching Events

```typescript
import { Database } from 'bun:sqlite';
import { BlueskyEvent, TimePeriod } from './types';
import { getPeriodCutoff } from './utils';

// Fetch events from the database based on time period
export const fetchEvents = (
  db: Database,
  period: TimePeriod
): BlueskyEvent[] => {
  const cutoff = getPeriodCutoff(period).toISOString();

  const query = `
    SELECT * FROM events
    WHERE created_at >= ?
    ORDER BY created_at DESC
  `;

  const statement = db.query(query);
  const rows = statement.all([cutoff]) as any[];

  return rows.map((row) => ({
    type: row.type,
    uri: row.uri,
    did: row.did,
    createdAt: row.created_at,
    text: row.text || undefined,
    replyTo: row.reply_to || undefined,
    quotedUri: row.quoted_uri || undefined,
  }));
};
```

### Handling User Handles

```typescript
// Update or insert a user handle
export const updateHandle = (
  db: Database,
  did: string,
  handle: string
): void => {
  db.run(
    `INSERT OR REPLACE INTO handles (did, handle) VALUES (?, ?)`,
    [did, handle]
  );
};

// Fetch the handle map
export const fetchHandleMap = (db: Database): Map<string, string> => {
  const rows = db.query('SELECT * FROM handles').all();
  const handleMap = new Map<string, string>();

  rows.forEach((row) => {
    handleMap.set(row.did, row.handle);
  });

  return handleMap;
};
```

---

<a name="listening-to-the-parrot"></a>

## 6. 🦜 Listening to the Parrot: Connecting to the Firehose

Create a `src/firehose.ts` file.

### Connecting to the Firehose

Bun has built-in WebSocket support, so we can use it directly.

```typescript
import { parseBlueskyEvent } from './utils';
import { saveEvent } from './database';
import { Database } from 'bun:sqlite';

// Connect to the Bluesky firehose
export const connectToFirehose = (db: Database): void => {
  const ws = new WebSocket(
    'wss://bsky.social/xrpc/com.atproto.sync.subscribeRepos'
  );

  ws.addEventListener('open', () => {
    console.log('Connected to the Bluesky firehose.');
  });

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data.toString());
    const blueskyEvent = parseBlueskyEvent(data);
    if (blueskyEvent) {
      saveEvent(db, blueskyEvent);
    }
  });

  ws.addEventListener('close', () => {
    console.log('Disconnected from the firehose. Reconnecting in 5 seconds...');
    setTimeout(() => connectToFirehose(db), 5000);
  });

  ws.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
    ws.close();
  });
};
```

**Explanation:**

- **WebSocket Connection**: Uses Bun's built-in WebSocket to connect to the Bluesky firehose.
- **Event Handling**: Parses and saves events as they come in.
- **Reconnection Logic**: Automatically reconnects if the connection is lost.

---

<a name="manning-the-ship"></a>

## 7. ⛵ Manning the Ship: Putting It All Together

Create a `src/main.ts` file.

```typescript
import { initializeDatabase } from './database';
import { connectToFirehose } from './firehose';
import { generateLeaderboard } from './utils';
import { LeaderboardConfig, TimePeriod } from './types';
import { fetchEvents, fetchHandleMap } from './database';

// Configuration
const config = {
  dbPath: './data/leaderboard.db',
  updateInterval: 5 * 60 * 1000, // 5 minutes
  leaderboardConfig: {
    period: '24h' as TimePeriod,
    minimumPosts: 5,
    limit: 100,
  } as LeaderboardConfig,
};

const main = () => {
  // Initialize the database
  const db = initializeDatabase(config.dbPath);

  // Connect to the firehose
  connectToFirehose(db);

  // Periodically generate the leaderboard
  setInterval(() => {
    const events = fetchEvents(db, config.leaderboardConfig.period);
    const handleMap = fetchHandleMap(db);
    const leaderboard = generateLeaderboard(
      events,
      config.leaderboardConfig,
      handleMap
    );

    // For now, we'll just log the leaderboard
    console.log('Current Leaderboard:', leaderboard);
  }, config.updateInterval);
};

main();
```

---

<a name="anchors-aweigh"></a>

## 8. ⚓ Anchors Aweigh: Running and Testing the Application

### Running the Application

Ensure your directory structure looks like this:

```
bluesky-leaderboard/
├── src/
│   ├── main.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── database.ts
│   └── firehose.ts
├── data/
├── package.json
├── tsconfig.json
└── bunfig.toml
```

Create the `data` directory to store your database:

```bash
mkdir data
```

Run the application:

```bash
bun run src/main.ts
```

You should see logs indicating that you're connected to the firehose and the leaderboard being updated.

### Testing the Functions

To ensure everything works correctly, consider writing unit tests for your utility functions. You can use any testing framework compatible with Bun.

---

<a name="guarding-the-treasure"></a>

## 9. 🛡️ Guarding the Treasure: Key Implementation Points

### TypeScript Best Practices

- **Types Over Interfaces**: We've used `type` aliases instead of `interfaces` for better flexibility.
- **Const Assertions for Unions**: Used `const` assertions to define union types instead of enums.
- **Inferred Types**: Avoided explicit type annotations where TypeScript can infer the types.

### Bun's Built-in Support

- **SQLite**: Utilized Bun's built-in SQLite support without external libraries.
- **WebSockets**: Used Bun's native WebSocket implementation.

### Error Handling

- **Resilience**: The application reconnects to the firehose if the connection drops.
- **Data Validation**: Invalid data is discarded early on.

### Scalability

- **Modular Design**: The code is organized into modules (`utils`, `database`, `firehose`) for better maintainability.
- **Configuration**: Important settings are centralized, making it easier to adjust as needed.

---

<a name="the-treasure-map"></a>

## 10. 🗺️ The Treasure Map: Directory Structure and Files

Here's how our project is organized:

```
bluesky-leaderboard/
├── src/
│   ├── main.ts          // Entry point of our application
│   ├── types.ts         // TypeScript types
│   ├── utils.ts         // Utility functions
│   ├── database.ts      // Database interactions
│   └── firehose.ts      // Firehose connection logic
├── data/
│   └── leaderboard.db   // SQLite database
├── package.json         // Project dependencies
├── tsconfig.json        // TypeScript configuration
└── bunfig.toml          // Bun configuration
```

---

<a name="final-thoughts"></a>

## 11. 🌅 Final Thoughts: Sailing Into the Sunset

Congratulations! You've built a real-time leaderboard system that connects to the Bluesky firehose, processes incoming events, and calculates user engagement scores.

This project not only demonstrates how to use Bun for efficient JavaScript execution but also provides a template for building scalable, real-time applications.

Remember, every great pirate keeps exploring and learning. Feel free to expand this project by adding a frontend to display the leaderboard or integrating more complex analytics.

So keep your cutlass sharp and your code sharper. Happy sailing!

---

**Yo ho, yo ho, a coder's life for me!**

_This guide was crafted with love and a bit of rum. May your servers be swift, and your bugs be scarce._