---
title: "Effectively Leveraging Twitter/X Data: Insights and Strategies"
description: "Learn how to analyze and leverage Twitter/X followers and following data that you've collected, identify common trends, and find great accounts to follow."
difficulty: "advanced"
category: "Data Analysis & Strategy"
order: 3
heroImage: "/images/twitter-data-analysis.jpg"
prerequisites:
  [
    "Collected Twitter/X followers and following data using Bash and SocialData API",
    "Basic data manipulation skills",
    "Spreadsheet software or basic Python/Pandas knowledge",
    "Curiosity to find connections and insights in social data",
  ]
---

# Effectively Leveraging Twitter/X Data: Insights and Strategies

You've successfully set up your data collection with Bash scripts and cron jobs, and you now have followers and following data neatly organized into CSV files every week. But what next? How do you turn this data into something meaningful that helps you grow your network or stay informed? In this guide, we’ll explore how to leverage the data you’ve gathered, extract insights, and use those insights to refine your social media strategy. This guide continues where our previous one left off ([collecting data](/guides/curl-x-cron-csv), but with a focus on analysis and strategic use.

## Goals of the Analysis

Here are some questions we want to answer with our data analysis:
- **Who are the most influential followers and followings?**
- **Are there common accounts followed by multiple target users?**
- **Who are the newest additions to the network, and what do they bring to the table?**
- **Are there interesting patterns or themes among the profiles we’re tracking?**

This kind of insight can help you identify trends, find accounts worth engaging with, and understand the dynamics of influence within your network.

## Step 1: Getting the Data Ready for Analysis

### Tools You Can Use

1. **Spreadsheet Software**: Excel, Google Sheets, or LibreOffice Calc are great for those who prefer a visual approach.
2. **Python with Pandas**: If you’re comfortable coding, Pandas is a powerful library for data manipulation and offers endless possibilities.

Let’s start by cleaning and organizing the CSV data into a format that's easy to explore.

### Organizing Your CSV Files

Ensure all your CSVs (followers and following data) are well-labeled in the `~/twitter_tracking/followers/` and `~/twitter_tracking/following/` directories. For easier analysis, you might want to merge multiple CSVs together to have a comprehensive view of all your tracked profiles. You can merge CSV files like so:

```bash
cd ~/twitter_tracking/followers/
cat *.csv > all_followers_combined.csv
```

Do the same for `following` data, if required.

## Step 2: Data Analysis Techniques

### 1. Identifying Influencers and Key Accounts

Use metrics such as `followers_count` and `friends_count` to determine influential accounts:

- **High `followers_count`** with a relatively low `friends_count` can indicate influential figures (they are followed by many but follow fewer).
- Sort your CSV by `followers_count` to see who has the highest reach.

If using Python, here’s a quick Pandas snippet to find the top influencers:

```python
import pandas as pd

# Load data
df = pd.read_csv('all_followers_combined.csv')

# Sort by followers count
top_influencers = df.sort_values(by='followers_count', ascending=False).head(10)
print(top_influencers[['name', 'screen_name', 'followers_count']])
```

### 2. Finding Common Followings

To identify common accounts followed by multiple target users (e.g., Loftwah, ThePrimeagen, Theo, and DanielW_Kiwi), merge their respective CSVs and look for duplicates.

Using a spreadsheet, concatenate all the following data into one sheet, then use a **Pivot Table** to see which accounts appear most frequently.

In Python, you can use:

```python
# Load following data from multiple users
loftwah_following = pd.read_csv('following/loftwah-following.csv')
primeagen_following = pd.read_csv('following/theprimeagen-following.csv')

theo_following = pd.read_csv('following/theo-following.csv')
daniel_following = pd.read_csv('following/danielw_kiwi-following.csv')

# Concatenate data frames
combined_df = pd.concat([loftwah_following, primeagen_following, theo_following, daniel_following])

# Count occurrences of each screen_name
common_followings = combined_df['screen_name'].value_counts().head(10)
print(common_followings)
```

This will reveal which accounts are popular among all of your target profiles, potentially highlighting influencers worth following.

### 3. Detecting New and Interesting Accounts

Tracking the changes week-to-week can help you identify new and potentially interesting accounts. Compare last week's CSV to this week's to see who joined the list.

If you prefer doing this with Python:

```python
# Load last week's and this week's data
last_week = pd.read_csv('followers/last_week_followers.csv')
this_week = pd.read_csv('followers/this_week_followers.csv')

# Find new followers this week
new_followers = this_week[~this_week['id'].isin(last_week['id'])]
print(new_followers[['name', 'screen_name']])
```

## Step 3: Acting on the Insights

Once you’ve gathered insights, use them to take action:

- **Follow Key Influencers**: Accounts with a high followers count but who aren’t following many could be worth following to get high-value content in your feed.
- **Engage with Popular Accounts**: Accounts followed by multiple of your tracked profiles are likely influential in your niche—consider engaging with their posts or networking with them.
- **Track Your Own Growth**: Keep an eye on the followers who recently started following you or those with high engagement. Building relationships with these accounts can be a powerful growth strategy.

## Step 4: Automate Your Analysis (Optional)

If you want to make this analysis part of your weekly routine, consider writing a Python script to automate it and schedule it with cron. The script could generate an automated report that gets emailed to you.

For example, use Python’s **smtplib** to email yourself the insights each week.

```python
import smtplib
from email.mime.text import MIMEText

# Create a summary report
report = "New followers this week:\n" + new_followers.to_string()

msg = MIMEText(report)
msg['Subject'] = 'Weekly Twitter/X Analysis Report'
msg['From'] = 'your_email@example.com'
msg['To'] = 'your_email@example.com'

# Send the email
with smtplib.SMTP('smtp.example.com', 587) as server:
    server.starttls()
    server.login('your_email@example.com', 'your_password')
    server.send_message(msg)
```

Note: If you're running this locally and want to use Gmail for SMTP, be aware that setting up an SMTP relay can be complicated due to Gmail's security measures. A simpler option might be to use a dedicated email service like **Mailgun** or **SendGrid** for smoother integration.

Add this script to cron to run after the data collection scripts finish executing.

## Step 5: Using Python with UV

For managing Python environments effectively, consider using **uv**. UV is a Python runtime manager that simplifies environment setup and script running.

### Installing UV and Python

To install UV:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

To install Python with UV:

```bash
uv python install 3.12
```

You can then use UV to run Python scripts efficiently:

```bash
uv run example.py
```

UV manages environments on-demand and ensures dependencies are handled automatically, which can make your workflow smoother, especially for repeated tasks like these analyses.

## Wrapping Up

With this guide, you now have the tools to leverage the Twitter/X data you've collected to gain actionable insights. This is just the beginning—once you understand these trends, you can refine your social media strategy, build new relationships, and ultimately make data-driven decisions to enhance your presence.

Stay curious, and keep exploring those data trends! If you need any more help or want to extend your analysis further, just holler.

