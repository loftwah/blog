---
title: "🏴‍☠️ Buccaneer's Training Manual: TypeScript & Bun Exercises"
description: "Embark on a swashbuckling journey to master TypeScript and Bun! Tackle exercises ranging from basic type definitions to building a real-time leaderboard, and ascend the ranks from Cabin Boy to Fleet Admiral."
difficulty: "intermediate"
category: "Programming"
order: 17
heroImage: "/images/typescript-bun-buccaneer.jpg"
prerequisites:
  - "Basic knowledge of JavaScript"
  - "Familiarity with TypeScript"
  - "Understanding of Bun runtime (or willingness to learn)"
---

# 🏴‍☠️ Buccaneer's Training Manual: TypeScript & Bun Exercises

Ahoy, ambitious sailor! Ready to prove yourself worthy of joining the TypeScript crew? These challenges will test your mettle and transform you from a lowly cabin boy into a seasoned TypeScript captain!

Whether you're new to TypeScript or looking to sharpen your skills, this manual offers a series of exercises designed to enhance your understanding of TypeScript and the Bun runtime. So grab your compass and set sail on this coding adventure!

---

## 🗺️ Table of Contents

1. [Basic Navigation: TypeScript Types](#basic-navigation)
   - Exercise 1: The Crew Manifest
   - Exercise 2: Ship's Cargo
2. [⚔️ Battle Stations: Functions & Error Handling](#battle-stations)
   - Exercise 3: Calculate Plunder Share
3. [🎯 Advanced Maneuvers: Working with Bun](#advanced-maneuvers)
   - Exercise 4: Event Processing
4. [🗡️ Sword Fighting: Database Operations](#sword-fighting)
   - Exercise 5: The Ship's Log
5. [🌊 High Seas Challenge: Build a Mini-Project](#high-seas-challenge)
   - Exercise 6: The Pirate's Logbook
6. [🏆 Captain's Challenge: System Design](#captains-challenge)
   - Exercise 7: Scale the Fleet
7. [🌟 Final Challenge: The Legendary Quest](#final-challenge)
   - Exercise 8: Build the Leaderboard
8. [🎖️ Rank System](#rank-system)
9. [Closing Remarks](#closing-remarks)

---

<a name="basic-navigation"></a>

## 🗺️ Basic Navigation: TypeScript Types

Let's start with the basics of TypeScript types. These exercises will help you understand how to define and use types effectively.

### Exercise 1: The Crew Manifest

**Task:** Create a type definition for a crew member with the following properties:

- `name` (string)
- `role` (a union type of: `"captain"`, `"firstMate"`, `"navigator"`, `"cook"`)
- `yearsAtSea` (number)
- `skills` (array of strings)
- `isActive` (boolean)

**Instructions:**

- Use a `type` alias.
- Ensure that the `role` property only accepts one of the specified strings.

**Answer and Explanation:**

```typescript
type CrewMember = {
  name: string;
  role: "captain" | "firstMate" | "navigator" | "cook";
  yearsAtSea: number;
  skills: string[];
  isActive: boolean;
};
```

**Explanation:**

- We used a `type` alias called `CrewMember`.
- The `role` property is a union of string literals, ensuring it can only be one of the specified roles.
- `skills` is an array of strings (`string[]`).
- This type can now be used to ensure that any object representing a crew member adheres to this structure.

**How to Use the Type:**

You can now use the `CrewMember` type to define variables or function parameters.

```typescript
const crewMember: CrewMember = {
  name: "Jack Sparrow",
  role: "captain",
  yearsAtSea: 15,
  skills: ["sword fighting", "navigation", "charisma"],
  isActive: true,
};

// Function that accepts a CrewMember
function introduceCrewMember(member: CrewMember) {
  console.log(`Ahoy! I'm ${member.name}, the ${member.role} of this ship.`);
}

introduceCrewMember(crewMember);
// Output: Ahoy! I'm Jack Sparrow, the captain of this ship.
```

**Validating Your Implementation:**

To validate that your type definition is correct:

- Try creating an object of type `CrewMember` as shown above.
- TypeScript should enforce the correct types and allowed values.
- If you try to assign an invalid value to `role`, TypeScript should give you an error.

```typescript
// This should cause a TypeScript error
const invalidCrewMember: CrewMember = {
  name: "Will Turner",
  role: "pirate", // Error: Type '"pirate"' is not assignable to type '"captain" | "firstMate" | "navigator" | "cook"'.
  yearsAtSea: 5,
  skills: ["sword fighting", "blacksmithing"],
  isActive: true,
};
```

---

### Exercise 2: Ship's Cargo

**Task:** Define a type for cargo items that includes:

- `weight` (number)
- `value` (number)
- `isFragile` (boolean)
- `destination` (string)

Then, create a type that represents a cargo hold as an array of these items.

**Instructions:**

- Use a `type` alias for the cargo item.
- Define the cargo hold as an array type.

**Answer and Explanation:**

```typescript
type CargoItem = {
  weight: number;
  value: number;
  isFragile: boolean;
  destination: string;
};

type CargoHold = CargoItem[];
```

**Explanation:**

- `CargoItem` is defined as a type with the specified properties.
- `CargoHold` is an array of `CargoItem` (`CargoItem[]`), representing the ship's cargo hold.
- This structure allows us to manage collections of cargo items with type safety.

**How to Use the Types:**

You can create cargo items and a cargo hold as follows:

```typescript
const item1: CargoItem = {
  weight: 100,
  value: 5000,
  isFragile: false,
  destination: "Port Royal",
};

const item2: CargoItem = {
  weight: 20,
  value: 20000,
  isFragile: true,
  destination: "Tortuga",
};

const cargoHold: CargoHold = [item1, item2];

// Function to calculate total cargo value
function calculateTotalValue(cargo: CargoHold): number {
  return cargo.reduce((total, item) => total + item.value, 0);
}

console.log(`Total cargo value: ${calculateTotalValue(cargoHold)}`);
// Output: Total cargo value: 25000
```

**Validating Your Implementation:**

- Create instances of `CargoItem` and ensure that all properties are correctly typed.
- Attempt to add an item with incorrect property types to see if TypeScript catches the error.

```typescript
// This should cause a TypeScript error
const invalidItem: CargoItem = {
  weight: "heavy", // Error: Type 'string' is not assignable to type 'number'.
  value: 1000,
  isFragile: false,
  destination: "Nassau",
};
```

---

<a name="battle-stations"></a>

## ⚔️ Battle Stations: Functions & Error Handling

Now that you're familiar with types, let's move on to functions and error handling.

### Exercise 3: Calculate Plunder Share

**Task:** Write a function that takes the total treasure value and the number of crew members, then returns each person's share. Include error handling for invalid inputs.

**Instructions:**

- The function should accept two parameters: `treasureValue` (number) and `crewCount` (number).
- Validate that `treasureValue` is a non-negative number.
- Validate that `crewCount` is a positive integer.
- Use `Math.floor` to return the integer part of each share.
- Throw appropriate errors for invalid inputs.

**Answer and Explanation:**

```typescript
function calculatePlunderShare(treasureValue: number, crewCount: number): number {
  if (treasureValue < 0) {
    throw new Error("Arr! Can't have negative treasure!");
  }
  if (!Number.isInteger(crewCount) || crewCount <= 0) {
    throw new Error("Need at least one crew member to share the booty!");
  }
  return Math.floor(treasureValue / crewCount);
}
```

**Explanation:**

- The function checks for invalid inputs:
  - Negative treasure value.
  - Non-integer or non-positive crew count.
- Uses `Math.floor` to ensure the share is an integer.
- Throws meaningful errors to help identify issues when the function is used.

**How to Use the Function:**

```typescript
try {
  const share = calculatePlunderShare(10000, 5);
  console.log(`Each crew member gets ${share} gold coins.`);
  // Output: Each crew member gets 2000 gold coins.
} catch (error) {
  console.error(error.message);
}

try {
  const share = calculatePlunderShare(-5000, 5);
  // This will throw an error
} catch (error) {
  console.error(error.message);
  // Output: Arr! Can't have negative treasure!
}

try {
  const share = calculatePlunderShare(10000, 0);
  // This will throw an error
} catch (error) {
  console.error(error.message);
  // Output: Need at least one crew member to share the booty!
}
```

**Validating Your Implementation:**

- Test the function with valid inputs to see if it returns the correct share.
- Test the function with invalid inputs to ensure it throws the appropriate errors.
- Ensure that error messages are clear and helpful.

---

<a name="advanced-maneuvers"></a>

## 🎯 Advanced Maneuvers: Working with Bun

Let's integrate Bun into our exercises, exploring its capabilities alongside TypeScript.

### Exercise 4: Event Processing

**Task:** Using the types from the tutorial, write a function that filters events by type and date range. Test it with the sample data.

**Sample Data:**

```typescript
type BlueskyEventType = "post" | "like" | "repost" | "follow" | "reply" | "quote";

type BlueskyEvent = {
  type: BlueskyEventType;
  uri: string;
  did: string;
  createdAt: string;
};

const sampleEvents: BlueskyEvent[] = [
  {
    type: "post",
    uri: "abc",
    did: "user1",
    createdAt: "2024-03-15T12:00:00Z",
  },
  {
    type: "like",
    uri: "def",
    did: "user2",
    createdAt: "2024-03-14T12:00:00Z",
  },
  {
    type: "post",
    uri: "ghi",
    did: "user3",
    createdAt: "2024-03-16T09:30:00Z",
  },
  // Add more sample events as needed...
];
```

**Instructions:**

- The function should accept an array of `BlueskyEvent`, an event `type`, a `startDate`, and an `endDate`.
- Return an array of events that match the type and fall within the date range.
- Use proper date comparisons.

**Answer and Explanation:**

```typescript
function filterEvents(
  events: BlueskyEvent[],
  type: BlueskyEventType,
  startDate: Date,
  endDate: Date
): BlueskyEvent[] {
  return events.filter((event) => {
    const eventDate = new Date(event.createdAt);
    return (
      event.type === type &&
      eventDate >= startDate &&
      eventDate <= endDate
    );
  });
}

// Example usage:
const startDate = new Date("2024-03-14T00:00:00Z");
const endDate = new Date("2024-03-16T00:00:00Z");
const filteredEvents = filterEvents(sampleEvents, "post", startDate, endDate);

console.log("Filtered Events:", filteredEvents);
/*
Output:
Filtered Events: [
  {
    type: "post",
    uri: "abc",
    did: "user1",
    createdAt: "2024-03-15T12:00:00Z",
  }
]
*/
```

**Explanation:**

- The `filterEvents` function filters events based on the specified type and date range.
- Converts `createdAt` strings to `Date` objects for accurate comparison.
- Returns a new array containing only the events that meet the criteria.
- The example usage demonstrates how to call the function and output the results.

**Validating Your Implementation:**

- Test the function with different event types and date ranges.
- Ensure that it correctly includes or excludes events based on the criteria.
- Check edge cases where events occur exactly at the start or end date.

---

<a name="sword-fighting"></a>

## 🗡️ Sword Fighting: Database Operations

Now we'll delve into database operations using SQLite with Bun's built-in support.

### Exercise 5: The Ship's Log

**Task:** Write SQLite queries to:

1. Create a table for ship's log entries.
2. Insert a new log entry.
3. Retrieve all entries for a specific date.
4. Update the status of an entry.
5. Delete entries older than 30 days.

**Instructions:**

- Use Bun's SQLite module (`bun:sqlite`).
- Define the table with appropriate columns.
- Ensure that date comparisons are handled correctly in queries.

**Answer and Explanation:**

```typescript
import { Database } from "bun:sqlite";

const db = new Database("ship_log.db");

// 1. Create table
db.run(`
  CREATE TABLE IF NOT EXISTS ship_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    entry TEXT,
    status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

// 2. Insert entry
const insertEntry = db.prepare(`
  INSERT INTO ship_log (date, entry, status)
  VALUES (?, ?, ?);
`);

insertEntry.run("2024-03-15", "Spotted a Kraken off the starboard bow!", "Open");

// 3. Get entries by date
const getEntries = db.prepare(`
  SELECT * FROM ship_log
  WHERE date = ?;
`);

const entries = getEntries.all("2024-03-15");
console.log("Entries for 2024-03-15:", entries);

// 4. Update status
const updateStatus = db.prepare(`
  UPDATE ship_log
  SET status = ?
  WHERE id = ?;
`);

updateStatus.run("Closed", 1);

// 5. Delete old entries
db.run(`
  DELETE FROM ship_log
  WHERE date < date('now', '-30 days');
`);
```

**Explanation:**

- **Create Table:** Sets up the `ship_log` table if it doesn't already exist.
- **Insert Entry:** Adds a new log entry into the `ship_log` table.
- **Retrieve Entries:** Queries the database for entries matching a specific date.
- **Update Status:** Updates the `status` field of a specific log entry.
- **Delete Old Entries:** Removes entries older than 30 days from the current date.

**How to Validate Your Implementation:**

- Run the script and check that the entries are correctly inserted, retrieved, updated, and deleted.
- Use `console.log` to output the results of queries.
- Verify that the database file `ship_log.db` is created and contains the expected data.

---

<a name="high-seas-challenge"></a>

## 🌊 High Seas Challenge: Build a Mini-Project

It's time to combine what you've learned into a small project.

### Exercise 6: The Pirate's Logbook

**Task:** Create a simple CLI application using Bun that:

1. Accepts log entries from the command line.
2. Stores them in SQLite.
3. Allows searching by date.
4. Prints entries in a formatted table.

**Bonus Points:**

- Adding colorful console output using libraries like `chalk`.
- Including ASCII art for a pirate-themed touch.
- Adding pirate-themed success messages.

**Instructions:**

- Use `process.argv` to read command-line inputs.
- Implement commands like `add`, `search`, and `list`.
- Ensure proper error handling and input validation.
- Use Bun's SQLite support for database operations.

**Answer and Explanation:**

```typescript
import { Database } from "bun:sqlite";
// Optional: Import a library for colorful output
// import chalk from "chalk";

// Initialize the database
const db = new Database("logbook.db");

db.run(`
  CREATE TABLE IF NOT EXISTS logbook (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    entry TEXT,
    weather TEXT
  );
`);

// Get command-line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "add":
    addEntryCommand(args.slice(1));
    break;
  case "search":
    searchEntriesCommand(args.slice(1));
    break;
  case "list":
    listEntriesCommand();
    break;
  default:
    displayHelp();
}

function addEntryCommand(args: string[]) {
  if (args.length < 3) {
    console.error("Usage: add <date> <weather> <entry>");
    return;
  }
  const [date, weather, ...entryParts] = args;
  const entry = entryParts.join(" ");
  addEntry(date, entry, weather);
}

function searchEntriesCommand(args: string[]) {
  if (args.length !== 1) {
    console.error("Usage: search <date>");
    return;
  }
  const date = args[0];
  searchEntries(date);
}

function listEntriesCommand() {
  listEntries();
}

function displayHelp() {
  console.log("Pirate's Logbook Commands:");
  console.log("  add <date> <weather> <entry>   - Add a new log entry");
  console.log("  search <date>                  - Search entries by date");
  console.log("  list                           - List all entries");
}

function addEntry(date: string, entry: string, weather: string) {
  db.run(
    "INSERT INTO logbook (date, entry, weather) VALUES (?, ?, ?)",
    date,
    entry,
    weather
  );
  console.log("🏴‍☠️ Yarr! Entry added to the logbook!");
}

function searchEntries(date: string) {
  const entries = db.query("SELECT * FROM logbook WHERE date = ?").all(date);
  if (entries.length === 0) {
    console.log("No entries found for that date.");
    return;
  }
  console.log(`\n=== Ship's Log for ${date} ===\n`);
  entries.forEach((entry: any) => {
    console.log(`Weather: ${entry.weather}`);
    console.log(`Entry: ${entry.entry}\n`);
  });
}

function listEntries() {
  const entries = db.query("SELECT * FROM logbook ORDER BY date DESC").all();
  if (entries.length === 0) {
    console.log("The logbook is empty.");
    return;
  }
  console.log("\n=== Ship's Log Entries ===\n");
  entries.forEach((entry: any) => {
    console.log(`Date: ${entry.date}`);
    console.log(`Weather: ${entry.weather}`);
    console.log(`Entry: ${entry.entry}\n`);
  });
}
```

**Explanation:**

- **Command-Line Parsing:** Uses `process.argv` to determine which command to execute.
- **Commands:**
  - `add`: Adds a new entry to the logbook.
  - `search`: Retrieves entries for a specific date.
  - `list`: Lists all entries in the logbook.
- **Functions:**
  - `addEntry`: Inserts a new entry into the database.
  - `searchEntries`: Fetches and displays entries for a given date.
  - `listEntries`: Displays all entries.
- **Database Operations:** Interacts with the SQLite database using Bun's built-in module.

**How to Run and Validate the Application:**

1. **Add an Entry:**

```bash
bun run pirate-logbook.ts add 2024-03-15 Sunny "Set sail towards the Caribbean."
```

- Check that it outputs: "🏴‍☠️ Yarr! Entry added to the logbook!"

2. **Search Entries by Date:**

```bash
bun run pirate-logbook.ts search 2024-03-15
```

- Should display the entry you just added.

3. **List All Entries:**

```bash
bun run pirate-logbook.ts list
```

- Should list all entries in the logbook.

**Validating Your Implementation:**

- Try adding multiple entries and searching for different dates.
- Ensure that the application handles incorrect inputs gracefully.
- Check the `logbook.db` file to confirm that entries are being stored.

**Bonus Implementations:**

- **Colorful Output:** Use a library like `chalk` to colorize the console output.

```typescript
// import chalk from "chalk";

// In your functions, use chalk to style text
console.log(chalk.green("🏴‍☠️ Yarr! Entry added to the logbook!"));
```

- **ASCII Art:** Add ASCII art when the application starts or after certain commands.

```typescript
function displayBanner() {
  console.log(`
    ____  _     _     _       _           
   |  _ \\| |__ (_) __| | __ _| |_ ___  ___ 
   | |_) | '_ \\| |/ _\` |/ _\` | __/ _ \\/ __|
   |  __/| | | | | (_| | (_| | ||  __/\\__ \\
   |_|   |_| |_|_|\\__,_|\\__,_|\\__\\___||___/
  `);
}

// Call displayBanner() at the start of the application
displayBanner();
```

- **Pirate Messages:** Customize messages throughout the application to enhance the theme.

---

<a name="captains-challenge"></a>

## 🏆 Captain's Challenge: System Design

Now, let's tackle a higher-level challenge focused on system architecture.

### Exercise 7: Scale the Fleet

**Task:** Design a system that can handle multiple ships' worth of data. Consider:

1. How would you shard the database?
2. How would you handle concurrent updates?
3. What caching strategy would you implement?
4. How would you ensure data consistency?

**Instructions:**

- Write a detailed proposal in markdown format.
- Address each point thoroughly, explaining your reasoning.
- Consider the trade-offs of your design choices.

**Answer and Explanation:**

```markdown
# Fleet Scale Architecture Proposal

## 1. Database Sharding

- **Shard by Ship ID:**
  - Partition the database horizontally based on `ship_id`.
  - Each shard contains data for a subset of ships.
- **Advantages:**
  - Distributes load and improves performance.
  - Simplifies data retrieval for individual ships.
- **Considerations:**
  - Requires a routing mechanism to direct queries to the correct shard.
  - Cross-shard queries become more complex.

## 2. Handling Concurrent Updates

- **Optimistic Concurrency Control:**
  - Use version numbers or timestamps for records.
  - Upon update, check if the record has been modified since it was read.
- **Implementation:**
  - Include a `version` field in records.
  - If a conflict is detected, retry the operation or inform the user.
- **Benefits:**
  - Reduces lock contention.
  - Suitable for systems with frequent reads and fewer writes.

## 3. Caching Strategy

- **Use Distributed Caching (e.g., Redis):**
  - Cache frequently accessed data like ship statuses.
- **Cache Invalidation:**
  - Implement mechanisms to invalidate or update cache entries when underlying data changes.
- **Benefits:**
  - Reduces database load.
  - Improves response times for read-heavy operations.

## 4. Ensuring Data Consistency

- **Strong Consistency Models:**
  - Use transactions where necessary to maintain data integrity.
- **Eventual Consistency:**
  - Accept eventual consistency for less critical data to improve performance.
- **Data Replication:**
  - Employ master-slave replication with failover mechanisms.
- **Conflict Resolution:**
  - Define clear rules for resolving conflicts when they occur.

## Additional Considerations

- **Microservices Architecture:**
  - Decompose the system into services (e.g., Ship Service, Fleet Service).
- **API Gateway:**
  - Centralize API management for authentication and routing.
- **Monitoring and Logging:**
  - Implement logging and monitoring tools for visibility and debugging.

**Conclusion**

Designing a scalable system for multiple ships involves balancing performance, scalability, and consistency. By sharding the database, implementing appropriate concurrency controls, and using caching effectively, we can build a robust system capable of handling large amounts of data while maintaining integrity and performance.
```

**Validating Your Implementation:**

- Review your proposal to ensure that it covers all points.
- Compare your reasoning with best practices in system design.
- Discuss your design with peers or mentors to get feedback.

---

<a name="final-challenge"></a>

## 🌟 Final Challenge: The Legendary Quest

This is the ultimate test of your skills—a complete project that brings together everything you've learned.

### Exercise 8: Build the Leaderboard

**Task:** Implement a complete leaderboard system that:

1. Connects to the Bluesky firehose.
2. Processes events in real-time.
3. Maintains user rankings based on engagement.
4. Provides API endpoints for querying the leaderboard.
5. Includes a simple web interface to display rankings.

**Instructions:**

- Use TypeScript and Bun for the backend.
- Utilize Bun's built-in WebSocket and SQLite support.
- Ensure the system is scalable and efficient.
- Include proper error handling and logging.
- Document your code and setup instructions.

**Bonus Points:**

- Add unit tests for critical functions.
- Implement caching to improve performance.
- Deploy the application using a cloud platform like Vercel or DigitalOcean.

**Answer and Explanation:**

As this is a comprehensive project, here's an outline to guide you:

1. **Project Setup:**

   - Initialize a Bun project with TypeScript.
   - Set up the project directory structure.

2. **Connecting to the Bluesky Firehose:**

   - Use Bun's WebSocket support to connect to the Bluesky firehose.
   - Implement reconnection logic to handle connection drops.
   - Parse and validate incoming events.

3. **Processing Events:**

   - Store events in an SQLite database.
   - Use appropriate data models and schemas.
   - Calculate user metrics and engagement scores.
   - Update the leaderboard based on these metrics.

4. **Creating API Endpoints:**

   - Use Bun's HTTP server capabilities to create RESTful endpoints.
   - Implement endpoints for retrieving leaderboard data.

5. **Web Interface:**

   - Build a frontend using a framework like React or plain HTML/CSS/JS.
   - Fetch data from the API and display the leaderboard.

6. **Error Handling and Logging:**

   - Implement robust error handling throughout the application.
   - Use logging to record events and errors.

7. **Documentation:**

   - Write clear setup instructions in a `README.md` file.
   - Include information about configuration and dependencies.

**How to Validate Your Implementation:**

- **Testing:** Write tests for your functions and ensure they pass.
- **Functionality:** Check that events are processed correctly and the leaderboard updates as expected.
- **API Testing:** Use tools like Postman or curl to test your API endpoints.
- **Frontend:** Ensure the web interface displays data correctly and is user-friendly.
- **Performance:** Monitor resource usage and optimize as needed.

**Deployment:**

- **Local Deployment:** Run the application locally and ensure all components work together.
- **Cloud Deployment:** Deploy your application to a cloud platform, ensuring that the database and server are properly configured.

---

<a name="rank-system"></a>

## 🎖️ Rank System

Track your progress with these ranks:

- 🔵 **Cabin Boy** (Exercises 1-2)
- 🟢 **Deck Hand** (Exercises 3-4)
- 🟡 **First Mate** (Exercises 5-6)
- 🔴 **Captain** (Exercise 7)
- ⭐ **Fleet Admiral** (Exercise 8)

**Remember, matey:**

> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand."
>
> — Martin Fowler, Pirate of the Caribbean Code

---

<a name="closing-remarks"></a>

## Closing Remarks

Congratulations on making it through the Buccaneer's Training Manual! Whether you're a seasoned developer or just starting out, continuous learning and practice are key to mastering the art of coding.

Now, set sail and may the winds of TypeScript be at your back! 🏴‍☠️

---

**Happy Coding!**

---