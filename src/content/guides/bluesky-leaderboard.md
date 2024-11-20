---
title: "Arrr! Building a Bluesky Leaderboard with Bun: A Pirate's Guide"
description: "Set sail on a coding adventure! Learn how to build a real-time Bluesky Leaderboard System using Bun, the fastest JavaScript runtime, and track user activity to crown the kings and queens of Bluesky."
difficulty: "intermediate"
category: "Web Development"
order: 14
heroImage: "/images/bluesky-leaderboard.jpg"
prerequisites:
  - "Basic understanding of JavaScript and TypeScript"
  - "Familiarity with Bun (or willingness to learn)"
  - "A Bluesky account with access to the firehose API"
---

# Arrr! Building a Bluesky Leaderboard with Bun: A Pirate's Guide

Ahoy, matey! Welcome aboard this grand adventure where we'll set sail to build a mighty **Bluesky Leaderboard System** using [Bun](https://bun.sh/), the fastest ship in the JavaScript seas. We'll track user activity, process engagement metrics, and crown the kings and queens of the Bluesky ocean.

So hoist the Jolly Roger, grab yer eyepatch, and let's dive into the code!

---

## 🏴‍☠️ Table of Contents

1. [The Quest Begins: Understanding Our Mission](#the-quest-begins)
2. [Charting the Course: Setting Up Core Types](#charting-the-course)
3. [Hoisting the Sails: Pure Data Processing Functions](#hoisting-the-sails)
4. [Storing the Booty: Database Operations with Bun](#storing-the-booty)
5. [Listening to the Parrot: Connecting to the Firehose](#listening-to-the-parrot)
6. [Manning the Ship: Application Setup](#manning-the-ship)
7. [Guarding the Treasure: Key Implementation Points](#guarding-the-treasure)
8. [The Treasure Map: Directory Structure and Files](#the-treasure-map)
9. [Anchors Aweigh: Deployment and Testing](#anchors-aweigh)
10. [Final Thoughts: Sailing Into the Sunset](#final-thoughts)

---

<a name="the-quest-begins"></a>

## 1. 🏴‍☠️ The Quest Begins: Understanding Our Mission

Imagine you're the captain of a ship, and you want to know which pirates (users) are the most active and influential on the Bluesky seas. Our mission is to build a system that:

- **Collects real-time data** from the Bluesky firehose (like messages in bottles floating our way).
- **Processes and stores** this data securely in our treasure chest (database).
- **Analyzes** the data to generate leaderboards (ranking the fiercest pirates).
- **Runs efficiently** using Bun, our swift and trusty vessel.

---

<a name="charting-the-course"></a>

## 2. 🗺️ Charting the Course: Setting Up Core Types

Before we set sail, we need a map. Let's define the core types that represent the events and data we'll handle.

```typescript
// Define the types of events we'll encounter on the seas
const BLUESKY_EVENT_TYPES = ["post", "like", "repost", "follow", "reply", "quote"] as const;
type BlueskyEventType = typeof BLUESKY_EVENT_TYPES[number];

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
type TimePeriod = typeof TIME_PERIODS[number];

type LeaderboardConfig = {
  period: TimePeriod;
  minimumPosts: number;
  limit: number; // How many pirates to show on the leaderboard
};
```

---

<a name="hoisting-the-sails"></a>

## 3. 🏴‍☠️ Hoisting the Sails: Pure Data Processing Functions

Now that we have our map, let's write some functions to process the treasure we find. These functions are like the wind in our sails—pure and without side effects.

### Parsing the Treasure (Events)

```typescript
// Turn unknown data into valuable treasure, or discard it if it's worthless
const parseBlueskyEvent = (data: unknown): BlueskyEvent | null => {
  if (!isValidEventData(data)) {
    return null; // Throw the junk overboard
  }

  return {
    type: data.type,
    uri: data.uri,
    did: data.did,
    createdAt: data.createdAt,
    text: data.text || undefined,
    replyTo: data.replyTo,
    quotedUri: data.quotedUri,
  };
};
```

### Counting the Loot (User Metrics)

```typescript
// Count up all the treasure each pirate has collected
const calculateUserMetrics = (
  events: BlueskyEvent[],
  userDid: string
): LeaderboardEntry["metrics"] => {
  return events.reduce(
    (metrics, event) => {
      if (event.did !== userDid) return metrics;

      // Increment the right type of treasure
      metrics[event.type as keyof typeof metrics]++;
      return metrics;
    },
    { posts: 0, likes: 0, reposts: 0, replies: 0, quotes: 0, followers: 0 }
  );
};
```

### Scoring the Pirates (Engagement Score)

```typescript
// Calculate how influential a pirate is based on their loot
const calculateEngagementScore = (
  metrics: LeaderboardEntry["metrics"]
): number => {
  const totalEngagements =
    metrics.likes + metrics.reposts * 2 + metrics.quotes * 3;

  // Avoid dividing by zero (we don't want any cursed gold!)
  return metrics.posts === 0 ? 0 : totalEngagements / metrics.posts;
};
```

### Filtering the Treasure (Events by Time Period)

```typescript
// Only keep the freshest treasure from the last voyage
const filterEventsByPeriod = (
  events: BlueskyEvent[],
  period: TimePeriod
): BlueskyEvent[] => {
  const now = new Date();
  const cutoff = new Date(now);

  switch (period) {
    case "24h":
      cutoff.setHours(now.getHours() - 24);
      break;
    case "7d":
      cutoff.setDate(now.getDate() - 7);
      break;
    case "30d":
      cutoff.setDate(now.getDate() - 30);
      break;
  }

  return events.filter((event) => new Date(event.createdAt) >= cutoff);
};
```

### Drawing the Map (Generating the Leaderboard)

```typescript
// Create the leaderboard by ranking pirates based on their treasure
const generateLeaderboard = (
  events: BlueskyEvent[],
  config: LeaderboardConfig,
  handleMap: Map<string, string>
): LeaderboardEntry[] => {
  // Group the treasure by pirate
  const userEvents = events.reduce((grouped, event) => {
    const userEvents = grouped.get(event.did) || [];
    grouped.set(event.did, [...userEvents, event]);
    return grouped;
  }, new Map<string, BlueskyEvent[]>());

  // Calculate metrics and scores for each pirate
  const entries: LeaderboardEntry[] = Array.from(userEvents.entries())
    .map(([did, events]) => {
      const metrics = calculateUserMetrics(events, did);
      return {
        did,
        handle: handleMap.get(did) || did,
        metrics,
        engagementScore: calculateEngagementScore(metrics),
      };
    })
    .filter((entry) => entry.metrics.posts >= config.minimumPosts)
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, config.limit);

  return entries;
};
```

---

<a name="storing-the-booty"></a>

## 4. 💰 Storing the Booty: Database Operations with Bun

Every good pirate needs a place to stash their loot. We'll use SQLite, a lightweight database, to store our treasure.

### Saving the Treasure (Events)

```typescript
// Save the treasure into our chest
const saveEvent = async (db: Database, event: BlueskyEvent): Promise<void> => {
  const query = `
    INSERT INTO events (
      type, uri, did, created_at, text, reply_to, quoted_uri
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  await db.run(query, [
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

### Fetching the Treasure (Events for Leaderboard)

```typescript
// Retrieve the treasure for analysis
const fetchEvents = async (
  db: Database,
  period: TimePeriod
): Promise<BlueskyEvent[]> => {
  const cutoff = getPeriodCutoff(period);

  const query = `
    SELECT * FROM events
    WHERE created_at >= ?
    ORDER BY created_at DESC
  `;

  return db.all(query, [cutoff.toISOString()]);
};
```

### Updating the Pirate Registry (Handle Mapping)

```typescript
// Keep track of which pirate is which
const updateHandle = async (
  db: Database,
  did: string,
  handle: string
): Promise<void> => {
  await db.run("INSERT OR REPLACE INTO handles (did, handle) VALUES (?, ?)", [
    did,
    handle,
  ]);
};
```

---

<a name="listening-to-the-parrot"></a>

## 5. 🦜 Listening to the Parrot: Connecting to the Firehose

Every captain needs a trusty parrot to bring news from the horizon. We'll connect to the Bluesky firehose to receive real-time events.

### Setting Up the Connection

```typescript
// Connect to the Bluesky firehose to receive events
const connectToFirehose = (
  onEvent: (event: BlueskyEvent) => Promise<void>
): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(
      "wss://bsky.social/xrpc/com.atproto.sync.subscribeRepos"
    );

    ws.onopen = () => resolve(ws);

    ws.onmessage = async (message) => {
      const event = parseBlueskyEvent(message.data);
      if (event) {
        await onEvent(event);
      }
    };

    ws.onerror = reject;
  });
};
```

### Handling Stormy Seas (Reconnection Logic)

```typescript
// Reconnect if we get thrown overboard
const createReconnectingFirehose = (
  onEvent: (event: BlueskyEvent) => Promise<void>,
  maxRetries = 5
): Promise<WebSocket> => {
  const connect = async (attempt = 0): Promise<WebSocket> => {
    try {
      return await connectToFirehose(onEvent);
    } catch (error) {
      if (attempt >= maxRetries) throw error;

      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      await new Promise((resolve) => setTimeout(resolve, delay));

      return connect(attempt + 1);
    }
  };

  return connect();
};
```

---

<a name="manning-the-ship"></a>

## 6. ⛵ Manning the Ship: Application Setup

Time to get our crew in order and set sail!

### Initializing the Leaderboard

```typescript
// Main application setup
const initializeLeaderboard = async (config: {
  dbPath: string;
  updateInterval: number;
  leaderboardConfig: LeaderboardConfig;
}) => {
  const db = await initializeDatabase(config.dbPath);

  // Process incoming events
  const processEvent = async (event: BlueskyEvent) => {
    await saveEvent(db, event);
  };

  // Update leaderboard periodically
  const updateLeaderboard = async () => {
    const events = await fetchEvents(db, config.leaderboardConfig.period);
    const handles = await fetchHandleMap(db);

    return generateLeaderboard(events, config.leaderboardConfig, handles);
  };

  // Connect to the firehose
  const ws = await createReconnectingFirehose(processEvent);

  // Start periodic updates
  const intervalId = setInterval(updateLeaderboard, config.updateInterval);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    ws.close();
    db.close();
  };
};

// Start the application
const startLeaderboard = async () => {
  const config = {
    dbPath: process.env.DATABASE_PATH || "./data/leaderboard.db",
    updateInterval: 5 * 60 * 1000, // 5 minutes
    leaderboardConfig: {
      period: "24h" as TimePeriod,
      minimumPosts: 5,
      limit: 100,
    },
  };

  try {
    const cleanup = await initializeLeaderboard(config);

    process.on("SIGTERM", () => {
      cleanup();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start leaderboard:", error);
    process.exit(1);
  }
};
```

---

<a name="guarding-the-treasure"></a>

## 7. 🛡️ Guarding the Treasure: Key Implementation Points

### Pure Functions

- **Predictable and Testable**: Our functions don't have side effects, making them easy to test and reliable as a compass.
- **Maintainable**: Pure functions are like well-kept logs; they make it easier to navigate the codebase.

### Strict Typing with TypeScript

- **Safety First**: By using TypeScript, we avoid unexpected mutinies in our code.
- **Clear Contracts**: Types act like treaties between different parts of our application.

### Simple Loading and Initialization

- **Easy to Set Sail**: The application setup is straightforward, so we can focus on the adventure.
- **Graceful Shutdowns**: We handle cleanup properly, avoiding ghost ships in our fleet.

### Robust Error Handling

- **Resilience**: With reconnection logic, we can weather any storm the seas throw at us.
- **Data Validation**: By ensuring incoming data is valid, we avoid taking on any cursed treasure.

---

<a name="the-treasure-map"></a>

## 8. 🗺️ The Treasure Map: Directory Structure and Files

To keep our ship organized, here's how we've laid out our code:

```
bluesky-leaderboard/
├── src/
│   ├── main.ts          // Entry point of our application
│   ├── config.ts        // Configuration settings
│   ├── types.ts         // TypeScript interfaces and types
│   ├── logger.ts        // Logging setup
│   ├── database.ts      // Database interactions
│   ├── firehose.ts      // Firehose connection logic
│   ├── leaderboard.ts   // Leaderboard generation
│   └── utils.ts         // Utility functions
├── data/
│   ├── leaderboard.db   // SQLite database
│   └── backups/         // Database backups
├── logs/
│   └── app.log          // Application logs
├── package.json         // Project dependencies
├── bunfig.toml          // Bun configuration
├── .env                 // Environment variables (keep this secret!)
└── README.md            // Project documentation
```

---

<a name="anchors-aweigh"></a>

## 9. ⚓ Anchors Aweigh: Deployment and Testing

### Setting Up Your Environment

1. **Install Bun**: Our speedy vessel. Follow the [Bun installation guide](https://bun.sh/docs/installation).
2. **Clone the Repository**: Pull the code to your local machine.
3. **Install Dependencies**:

   ```bash
   bun install
   ```

4. **Set Up the Database**: Initialize your SQLite database.

### Configuration

Create a `.env` file to store your environment variables. Remember, keep this file safe and never commit it to version control.

```env
# Bluesky API Configuration
BLUESKY_HANDLE=your-handle.bsky.social
BLUESKY_APP_PASSWORD=your-app-password

# Database Configuration
DATABASE_PATH=./data/leaderboard.db

# Application Settings
NODE_ENV=production
PORT=42069

# DigitalOcean Spaces for Backups (Sydney Region)
DO_SPACES_ACCESS_KEY=your-spaces-access-key
DO_SPACES_SECRET_KEY=your-spaces-secret-key
DO_SPACES_REGION=syd1
DO_SPACES_BUCKET=your-bucket-name
```

### Running the Application

Start the leaderboard application:

```bash
bun run src/main.ts
```

### Testing

- **Unit Tests**: Write tests for your pure functions to ensure they're working as expected.
- **Integration Tests**: Test the full flow from receiving events to generating the leaderboard.

---

<a name="final-thoughts"></a>

## 10. 🌅 Final Thoughts: Sailing Into the Sunset

With our Bluesky Leaderboard System up and running, we're now the dread pirates of social media analytics! Using Bun has made our ship faster and more efficient, allowing us to process data at lightning speed.

Remember, the code is a treasure map, and every function is a clue leading us to the ultimate prize—a fully functional leaderboard that ranks the most influential pirates on the high seas of Bluesky.

So keep your cutlass sharp and your code sharper. Happy sailing!

---

**Yo ho, yo ho, a coder's life for me!**

_This guide was crafted with love and a bit of rum. May your servers be swift, and your bugs be scarce._
