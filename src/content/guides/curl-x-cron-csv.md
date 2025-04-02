---
title: "Automated Weekly Collection of Twitter/X Followers and Following Data Using Bash & SocialData API"
description: "Learn how to use Bash scripts, SocialData API, and cron jobs to collect and track Twitter/X followers and following data for multiple accounts weekly, with outputs in CSV format for easy analysis."
difficulty: "advanced"
category: "Data Collection & Automation"
order: 2
heroImage: "/images/socialdata-tools.jpg"
prerequisites:
  [
    "API Key from SocialData.tools",
    "Basic Bash Scripting",
    "Basic JSON Handling",
    "Basic cron job scheduling",
    "Knowledge of Unix/Linux command line",
  ]
---

# Automated Weekly Collection of Twitter/X Followers and Following Data Using Bash & SocialData API

Alright, legend, let's take it up a notch! We're going to automate data collection to track who’s following and who’s being followed by specific Twitter/X accounts—every single week. Using the SocialData API with Bash, we’re setting up an automated process that runs weekly via cron, collects the data for multiple accounts (including Loftwah, ThePrimeagen, DanielW_Kiwi, and Theo), and outputs CSV files for analysis. The goal? To find new, interesting accounts to follow and to observe any common trends or relationships.

This guide builds on earlier scripts that focus on [collecting followers](/guides/curl-x-followers-csv) data for Twitter/X users using Bash and SocialData API. If you haven't checked it out yet, take a look and it will help you understand the basics that we’re expanding upon here.

This guide will show you how to combine those scripts and use cron to automate the process, ultimately saving the output in a structured directory for easy data analysis.

## Tools of the Trade

Here’s what you need to get started:

1. **API Key**: Grab one from [SocialData.tools](https://socialdata.tools). You’ll need this to access their API.
2. **cURL and jq**: We’ll use these command-line tools for making API requests and parsing JSON data.
   - Install cURL: `sudo apt-get install curl -y`
   - Install jq: `sudo apt-get install jq -y`
3. **Bash Shell**: We’re assuming you’re on Ubuntu (or any Unix/Linux flavor, like WSL2).
4. **cron**: We’re using cron to schedule the weekly execution.

## Setting Up Your Directory Structure

Start by creating a dedicated directory to store the CSV files and scripts:

```bash
mkdir -p ~/twitter_tracking/{followers,following,logs}
cd ~/twitter_tracking
```

This will create a directory called `twitter_tracking` with three subfolders: `followers`, `following`, and `logs`.

## The Scripts

You’ll need two Bash scripts: one for **followers** and one for **following**. Let's reuse and expand upon the earlier scripts.

### 1. Collecting Followers Script

Save the following as `collect_followers.sh` in the `twitter_tracking` directory:

```bash
#!/bin/bash

# Replace these with your actual values
API_KEY="YOUR_API_KEY"
SCREEN_NAME=$1
OUTPUT_FILE="followers/$SCREEN_NAME-followers.csv"

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
URL="https://api.socialdata.tools/Twitter/X/followers/list?user_id=${USER_ID}"

# Function to perform cURL request
get_followers() {
  local url=$1
  curl -s -X GET "$url" \
       -H "Authorization: Bearer $API_KEY" \
       -H "Accept: application/json"
}

# Fetch followers until all pages are retrieved
next_cursor=""
page_count=0
> "$OUTPUT_FILE" # Clear the output file

echo "id,name,screen_name,location,followers_count,friends_count" >> "$OUTPUT_FILE" # Add header row

while true; do
  if [[ -n "$next_cursor" ]]; then
    url_with_cursor="${URL}&cursor=${next_cursor}"
  else
    url_with_cursor="$URL"
  fi

  response=$(get_followers "$url_with_cursor")

  if echo "$response" | grep -q '"status":"error"'; then
    echo "Error: $(echo "$response" | jq -r '.message')"
    exit 1
  fi

  users=$(echo "$response" | jq -c '.users[]')
  next_cursor=$(echo "$response" | jq -r '.next_cursor')

  echo "$users" | while read user; do
    id=$(echo "$user" | jq -r '.id')
    name=$(echo "$user" | jq -r '.name')
    screen_name=$(echo "$user" | jq -r '.screen_name')
    location=$(echo "$user" | jq -r '.location')
    followers_count=$(echo "$user" | jq -r '.followers_count')
    friends_count=$(echo "$user" | jq -r '.friends_count')

    echo "$id,$name,$screen_name,$location,$followers_count,$friends_count" >> "$OUTPUT_FILE"
  done

  ((page_count++))

  if [[ -z "$next_cursor" || "$next_cursor" == "null" ]]; then
    break
  fi
done
```

### 2. Collecting Following Script

Save the following as `collect_following.sh` in the `twitter_tracking` directory:

```bash
#!/bin/bash

# Replace these with your actual values
API_KEY="YOUR_API_KEY"
SCREEN_NAME=$1
OUTPUT_FILE="following/$SCREEN_NAME-following.csv"

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

# Fetch following until all pages are retrieved
next_cursor=""
page_count=0
> "$OUTPUT_FILE" # Clear the output file

echo "id,name,screen_name,location,followers_count,friends_count" >> "$OUTPUT_FILE" # Add header row

while true; do
  if [[ -n "$next_cursor" ]]; then
    url_with_cursor="${URL}&cursor=${next_cursor}"
  else
    url_with_cursor="$URL"
  fi

  response=$(get_following "$url_with_cursor")

  if echo "$response" | grep -q '"status":"error"'; then
    echo "Error: $(echo "$response" | jq -r '.message')"
    exit 1
  fi

  users=$(echo "$response" | jq -c '.users[]')
  next_cursor=$(echo "$response" | jq -r '.next_cursor')

  echo "$users" | while read user; do
    id=$(echo "$user" | jq -r '.id')
    name=$(echo "$user" | jq -r '.name')
    screen_name=$(echo "$user" | jq -r '.screen_name')
    location=$(echo "$user" | jq -r '.location')
    followers_count=$(echo "$user" | jq -r '.followers_count')
    friends_count=$(echo "$user" | jq -r '.friends_count')

    echo "$id,$name,$screen_name,$location,$followers_count,$friends_count" >> "$OUTPUT_FILE"
  done

  ((page_count++))

  if [[ -z "$next_cursor" || "$next_cursor" == "null" ]]; then
    break
  fi
done
```

## Setting Up Cron Jobs for Weekly Automation

Now that you have your scripts ready, let’s schedule them to run every week using cron, with organized output management.

1. **Open your crontab editor**:

   ```bash
   crontab -e
   ```

2. **Add the following lines** to run the scripts every Sunday at 2 AM:

   ```
   0 2 * * 0 /bin/bash ~/twitter_tracking/collect_followers.sh loftwah >> ~/twitter_tracking/logs/loftwah_followers.log 2>&1
   0 2 * * 0 /bin/bash ~/twitter_tracking/collect_followers.sh ThePrimeagen >> ~/twitter_tracking/logs/theprimeagen_followers.log 2>&1
   0 2 * * 0 /bin/bash ~/twitter_tracking/collect_followers.sh DanielW_Kiwi >> ~/twitter_tracking/logs/danielw_kiwi_followers.log 2>&1
   0 2 * * 0 /bin/bash ~/twitter_tracking/collect_followers.sh theo >> ~/twitter_tracking/logs/theo_followers.log 2>&1
   15 2 * * 0 /bin/bash ~/twitter_tracking/collect_following.sh loftwah >> ~/twitter_tracking/logs/loftwah_following.log 2>&1
   15 2 * * 0 /bin/bash ~/twitter_tracking/collect_following.sh ThePrimeagen >> ~/twitter_tracking/logs/theprimeagen_following.log 2>&1
   15 2 * * 0 /bin/bash ~/twitter_tracking/collect_following.sh DanielW_Kiwi >> ~/twitter_tracking/logs/danielw_kiwi_following.log 2>&1
   15 2 * * 0 /bin/bash ~/twitter_tracking/collect_following.sh theo >> ~/twitter_tracking/logs/theo_following.log 2>&1
   ```

3. **Organize the logs** by ensuring the `logs` directory exists:

   ```bash
   mkdir -p ~/twitter_tracking/logs
   ```

This setup ensures:

- Each script runs at the specified time.
- Outputs are saved in the proper CSV file within the correct directory (`followers` or `following`).
- Logs are created in a `logs` folder for easy troubleshooting.

## Wrapping Up

With this setup, you now have an automated solution to track followers and followings for some key Twitter/X accounts using Bash, SocialData API, and cron jobs. The data is stored in organized CSV files every week, allowing you to analyze trends and discover interesting new profiles to follow.

If you need further customization or want to enhance your analysis capabilities, just shout out. Now, go and find some epic Twitter/X profiles to follow!
