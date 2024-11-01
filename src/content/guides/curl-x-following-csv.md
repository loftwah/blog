---
title: "Loftwah's Ultimate Guide to Collecting Twitter/X Following Data Using Bash & SocialData API"
description: "Learn how to use Bash scripts with the SocialData API to retrieve all the Twitter/X profiles that a particular user is following, complete with pagination, test mode, and output flexibility."
difficulty: "intermediate"
category: "Data Collection & Automation"
order: 8
heroImage: "/images/socialdata-tools.jpg"
prerequisites:
  ["API Key from SocialData.tools", "Basic Bash Scripting", "Basic JSON Handling"]
---

# Loftwah's Ultimate Guide to Collecting Twitter/X Following Data Using Bash & SocialData API

Alright, legends, let's dig in! If you've ever wondered how to pull data on who someone's following on Twitter/X like a tech-savvy sleuth, you're in the right place. We're diving into Bash scripts with the SocialData API to fetch all those spicy follows from any Twitter/X user. We’ll craft a script that collects following data, handles pagination, spits out either JSON or CSV, and even has a "chill mode" (aka test mode) for gathering just a few pages. By the end of this guide, you'll have a nifty script tailored to your needs, primed to scrape those following lists like a boss.

## Tools of the Trade

Before we get stuck in, you’re going to need a few essentials:

1. **API Key**: Grab one from [SocialData.tools](https://socialdata.tools). This is your golden ticket to get access.
2. **cURL and jq**: These command-line wizards help make API requests and parse JSON data.
   - Install cURL: `sudo apt-get install curl -y`
   - Install jq: `sudo apt-get install jq -y`
3. **Bash Shell**: We’re assuming you’re rocking a Unix-like setup (like a real techie).

## What's in the Script?

This script’s got it all:

1. **Get User ID**: We’ll turn a Twitter/X handle into a user ID.
2. **Collect Following Info**: Get all the juicy profiles that the user follows.
3. **Handle Pagination**: We'll manage the `next_cursor` to grab every last follower.
4. **Output the Goods**: Export in JSON or CSV—whatever floats your boat.

The script is flexible, letting you run in test mode, set the screen name, and pick your output format. Let’s break it down step-by-step.

## Step-by-Step Walkthrough

### Step 1: Building Your Script

Let’s dive into the full script, tailored with you in mind:

```bash
#!/bin/bash

# Replace these with your actual values
API_KEY="YOUR_API_KEY"
SCREEN_NAME="loftwah"
TEST_MODE=false
MAX_PAGES=2
OUTPUT_FORMAT="json"

# Parse input arguments
if [[ $# -eq 0 ]]; then
  echo "Usage: $0 [-t] [-f screen_name] [-o output_format(json/csv)]"
  exit 1
fi

while getopts "tf:o:" opt; do
  case ${opt} in
    t )
      TEST_MODE=true
      ;;
    f )
      SCREEN_NAME="$OPTARG"
      ;;
    o )
      OUTPUT_FORMAT="$OPTARG"
      ;;
    * )
      echo "Usage: $0 [-t] [-f screen_name] [-o output_format(json/csv)]"
      exit 1
      ;;
  esac
done

# Fetch user ID from screen name
get_user_id() {
  local screen_name=$1
  curl -s -X GET "https://api.socialdata.tools/Twitter/X/user/${screen_name}" \
       -H "Authorization: Bearer $API_KEY" \
       -H "Accept: application/json" | jq -r '.id'
}

# Retrieve the user ID using the screen name
USER_ID=$(get_user_id "$SCREEN_NAME")

if [[ -z "$USER_ID" || "$USER_ID" == "null" ]]; then
  echo "Error: Unable to retrieve user ID for screen name $SCREEN_NAME"
  exit 1
fi

# Initial request URL with user_id
URL="https://api.socialdata.tools/Twitter/X/friends/list?user_id=${USER_ID}"

# Function to perform cURL request
get_following() {
  local url=$1
  curl -s -X GET "$url" \
       -H "Authorization: Bearer $API_KEY" \
       -H "Accept: application/json"
}

# Fetch followers until all pages are retrieved
next_cursor=""
page_count=0
while true; do
  # Append cursor to URL if it's not empty
  if [[ -n "$next_cursor" ]]; then
    url_with_cursor="${URL}&cursor=${next_cursor}"
  else
    url_with_cursor="$URL"
  fi

  # Perform the cURL request
  response=$(get_following "$url_with_cursor")

  # Check if response contains an error
  if echo "$response" | grep -q '"status":"error"'; then
    echo "Error: $(echo "$response" | jq -r '.message')"
    exit 1
  fi

  # Extract users and next_cursor from the response
  users=$(echo "$response" | jq -c '.users[]')
  next_cursor=$(echo "$response" | jq -r '.next_cursor')

  # Output the users based on selected output format
  echo "$users" | while read user; do
    id=$(echo "$user" | jq -r '.id')
    name=$(echo "$user" | jq -r '.name')
    screen_name=$(echo "$user" | jq -r '.screen_name')
    location=$(echo "$user" | jq -r '.location')
    followers_count=$(echo "$user" | jq -r '.followers_count')
    friends_count=$(echo "$user" | jq -r '.friends_count')

    if [[ "$OUTPUT_FORMAT" == "csv" ]]; then
      echo "$id,$name,$screen_name,$location,$followers_count,$friends_count"
    else
      echo "$user"
    fi
  done

  # Increment page count and check if in test mode
  ((page_count++))
  if [[ "$TEST_MODE" == true && "$page_count" -ge "$MAX_PAGES" ]]; then
    echo "Test mode: Reached maximum of $MAX_PAGES pages. Exiting."
    break
  fi

  # If next_cursor is empty or null, break out of the loop
  if [[ -z "$next_cursor" || "$next_cursor" == "null" ]]; then
    break
  fi
done
```

### Step 2: Command-Line Options

You can tweak the script with these flags:

- **`-t`**: This puts the script in **test mode**. We’ll only grab the first couple of pages (chill vibes only).
- **`-f` `screen_name`**: Set the **Twitter/X handle** you want to stalk—err—analyse.
- **`-o` `output_format`**: Decide on **JSON or CSV** for your data dump.

If you're lost, running the script with no args will show you how it’s done.

### Step 3: Running the Script Like a Pro

Here’s how you can use this script, with some examples:

- **JSON output** of Elon’s following:

  ```bash
  ./collect_Twitter/X_following.sh -f elonmusk -o json
  ```

- **CSV output**, maybe to check out who Elon’s mingling with:

  ```bash
  ./collect_Twitter/X_following.sh -f elonmusk -o csv > following_data.csv
  ```

- Run it in **test mode** for just a taste:
  ```bash
  ./collect_Twitter/X_following.sh -t -f elonmusk -o csv
  ```

### Step 4: Output Options

- **JSON**: Good if you need structure or plan to feed it into another app/script.
- **CSV**: Classic, simple, and perfect for spreadsheets.

Wanna save the output? Redirect it with `>` like the good ol' days.

### Step 5: The Details You Need

- **Argument Parsing**: We use `getopts` to handle optional flags and keep things flexible.
- **Get User ID**: We call the SocialData API to convert a Twitter/X handle into the user ID.
- **Following Retrieval**: Our loop will keep grabbing pages until there’s no more left—no data left behind.
- **Output Handling**: Choose between JSON and CSV depending on what you want to do with the data.

### Step 6: Chill/Test Mode

Use test mode if you're short on time or just want to give it a quick spin without hammering the API—perfect for those quick "Is it working?" moments.

## Wrapping Up

Boom, there you have it! Loftwah’s custom script to collect Twitter/X following data. We’ve covered JSON and CSV output, command-line args, pagination, and more. Feel free to make it your own, remix it, add your flair, or automate it into a bigger workflow.

If you get stuck or want to build on it, just holler. Happy following-fetching, and keep it legendary!
