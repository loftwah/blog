---
title: "Complete Guide to Fetching All DNS Records with `dig`, Automating with Bash Scripts, and Integrating with GitHub Actions Using Resend.com"
description: "Learn how to automate DNS record retrieval, format and store output using Bash, and integrate this process with GitHub Actions for DNS monitoring and reporting with Resend.com."
difficulty: "advanced"
category: "DevOps & Networking"
order: 11
heroImage: "/images/dns-automation.jpg"
prerequisites:
  [
    "Familiarity with Bash scripting",
    "Basic understanding of DNS records",
    "Access to GitHub Actions and repository management",
    "Resend.com account setup for API usage",
  ]
---

# **Complete Guide to Fetching All DNS Records with `dig`, Automating with Bash Scripts, and Integrating with GitHub Actions Using Resend.com**

Managing DNS configurations for my domain, **deanlofts.xyz**, requires a quick and efficient way to retrieve all essential DNS records. The default `dig` command can be cumbersome, and running multiple commands for different record types is time-consuming.

In this guide, I'll show you how to:

- Use `dig` to fetch all useful DNS records in one go.
- Create a Bash script that processes the output and saves it in `.txt` and `.csv` formats.
- Utilize the output creatively for various DevOps use cases.
- Integrate the process with **GitHub Actions** for continuous monitoring and notification.
- Use **Resend.com** for sending email notifications and reports.

---

## Table of Contents

1. [Fetching All DNS Records at Once](#1-fetching-all-dns-records-at-once)
2. [Organizing and Saving the Output](#2-organizing-and-saving-the-output)
3. [Processing Output with Bash Scripts](#3-processing-output-with-bash-scripts)
4. [Creative Uses of the Output](#4-creative-uses-of-the-output)
5. [DevOps Use Cases with GitHub Actions](#5-devops-use-cases-with-github-actions)
   - 5.1 [Automating DNS Monitoring](#51-automating-dns-monitoring)
   - 5.2 [Integrating with CI/CD Pipelines](#52-integrating-with-cicd-pipelines)
   - 5.3 [Generating DNS Reports](#53-generating-dns-reports)
6. [Conclusion](#6-conclusion)

---

## 1. Fetching All DNS Records at Once

### The Challenge

By default, `dig` retrieves one DNS record type at a time. Running multiple commands is inefficient.

### The Solution

Use a Bash loop to query multiple DNS record types in one command.

```bash
for type in A AAAA MX NS CNAME TXT SOA; do
  dig deanlofts.xyz "$type" +noall +answer
done
```

**Sample Output:**

```
deanlofts.xyz.    300 IN A     104.21.35.16
deanlofts.xyz.    300 IN A     172.67.167.178
deanlofts.xyz.    300 IN AAAA  2606:4700:3036::6815:2310
deanlofts.xyz.    300 IN AAAA  2606:4700:3035::ac43:a7b2
deanlofts.xyz.    0   IN MX    1 aspmx.l.google.com.
...
```

---

## 2. Organizing and Saving the Output

### Adding Headers

To make the output more readable, add headers for each record type.

```bash
for type in A AAAA MX NS CNAME TXT SOA; do
  echo "===== $type Records ====="
  dig deanlofts.xyz "$type" +noall +answer
done
```

### Saving to a Text File

You can redirect the output to a `.txt` file.

```bash
for type in A AAAA MX NS CNAME TXT SOA; do
  echo "===== $type Records =====" >> dns_records.txt
  dig deanlofts.xyz "$type" +noall +answer >> dns_records.txt
done
```

**Check the File:**

```bash
cat dns_records.txt
```

---

## 3. Processing Output with Bash Scripts

### Creating a Bash Script

#### Step 1: Create `get_dns_records.sh`

```bash
nano get_dns_records.sh
```

#### Step 2: Add the Following Script

```bash
#!/bin/bash

DOMAIN="deanlofts.xyz"
OUTPUT_FILE="dns_records.txt"

# Record types to query
RECORD_TYPES=(A AAAA MX NS CNAME TXT SOA)

# Remove output file if it exists
rm -f "$OUTPUT_FILE"

for type in "${RECORD_TYPES[@]}"; do
  echo "===== $type Records =====" >> "$OUTPUT_FILE"
  dig "$DOMAIN" "$type" +noall +answer >> "$OUTPUT_FILE"
done
```

#### Step 3: Make the Script Executable

```bash
chmod +x get_dns_records.sh
```

#### Step 4: Run the Script

```bash
./get_dns_records.sh
```

---

## 4. Creative Uses of the Output

### Exporting to CSV Format

#### Step 1: Create `dns_to_csv.sh`

```bash
nano dns_to_csv.sh
```

#### Step 2: Add the Script Content

```bash
#!/bin/bash

DOMAIN="deanlofts.xyz"
OUTPUT_FILE="dns_records.csv"

# Initialize CSV file with headers
echo "Record Type,Name,TTL,Class,Type,Data" > "$OUTPUT_FILE"

RECORD_TYPES=(A AAAA MX NS CNAME TXT SOA)

for type in "${RECORD_TYPES[@]}"; do
  dig "$DOMAIN" "$type" +noall +answer |
  awk -v rt="$type" '{print rt "," $1 "," $2 "," $3 "," $4 "," substr($0, index($0,$5))}' >> "$OUTPUT_FILE"
done
```

#### Step 3: Make the Script Executable

```bash
chmod +x dns_to_csv.sh
```

#### Step 4: Run the Script

```bash
./dns_to_csv.sh
```

#### Step 5: View the CSV File

```bash
cat dns_records.csv
```

**Sample CSV Output:**

```
Record Type,Name,TTL,Class,Type,Data
A,deanlofts.xyz.,300,IN,A,104.21.35.16
A,deanlofts.xyz.,300,IN,A,172.67.167.178
AAAA,deanlofts.xyz.,300,IN,AAAA,2606:4700:3036::6815:2310
...
```

### Parsing Specific Data

Extract just the IP addresses from A records.

```bash
dig deanlofts.xyz A +short > ip_addresses.txt
```

---

## 5. DevOps Use Cases with GitHub Actions

### 5.1 Automating DNS Monitoring

Monitor DNS records for changes and alert when discrepancies occur.

#### Step 1: Create a Repository

- Create a new GitHub repository to store your scripts.

#### Step 2: Add Your Scripts

- Upload `get_dns_records.sh` and `dns_to_csv.sh` to the repository.

#### Step 3: Create a GitHub Actions Workflow

Create a file `.github/workflows/dns-monitor.yml` in your repository.

```yaml
name: DNS Monitor

on:
  schedule:
    - cron: '0 0 * * *'  # Runs daily at midnight
  workflow_dispatch:

jobs:
  check-dns:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Run DNS Records Script
        run: |
          chmod +x get_dns_records.sh
          ./get_dns_records.sh

      - name: Compare with Previous Records
        run: |
          if [ -f dns_records_previous.txt ]; then
            DIFF=$(diff dns_records_previous.txt dns_records.txt || true)
            if [ "$DIFF" != "" ]; then
              echo "DNS records have changed."
              echo "$DIFF" > dns_diff.txt
            else
              echo "No changes in DNS records."
            fi
          else
            echo "No previous DNS records found."
          fi
          cp dns_records.txt dns_records_previous.txt

      - name: Upload Diff Artifact
        if: exists('dns_diff.txt')
        uses: actions/upload-artifact@v3
        with:
          name: dns_diff
          path: dns_diff.txt

      - name: Send Notification via Resend.com
        if: exists('dns_diff.txt')
        run: |
          curl -X POST https://api.resend.com/emails \
          -H "Authorization: Bearer ${{ secrets.RESEND_API_KEY }}" \
          -H "Content-Type: application/json" \
          -d '{
            "from": "DNS Monitor <monitor@deanlofts.xyz>",
            "to": ["youremail@example.com"],
            "subject": "DNS Records Changed for deanlofts.xyz",
            "text": "The DNS records for deanlofts.xyz have changed. See the attached diff for details.",
            "attachments": [
              {
                "filename": "dns_diff.txt",
                "content": "'"$(base64 dns_diff.txt)"'",
                "content_type": "text/plain"
              }
            ]
          }'
```

#### Step 4: Set Up Resend.com

- **Create a Resend.com account**: [Resend.com Signup](https://resend.com/signup).
- **Obtain an API Key**: Navigate to the API keys section and create a new API key.
- **Add Secret to GitHub**:
  - `RESEND_API_KEY`: Your Resend.com API key.

#### Step 5: Configure DNS for Email Sending

- **Verify Your Domain**: Resend.com will provide DNS records to verify your domain ownership and enable email sending.
- **Add the Required DNS Records**: Use your DNS provider to add the TXT and MX records provided by Resend.com.

#### Step 6: Commit and Push

```bash
git add .
git commit -m "Add DNS monitoring workflow with Resend.com notifications"
git push origin main
```

### Why Use Resend.com?

- **API-Based Email Sending**: Resend.com provides a straightforward API for sending emails, which works well with GitHub Actions.
- **No SMTP Restrictions**: Since you're using an API, you avoid the SMTP issues that can occur with Gmail or other SMTP servers.
- **Attachment Support**: Resend.com allows you to send attachments, which is useful for including the `dns_diff.txt` file.

### 5.2 Integrating with CI/CD Pipelines

Ensure DNS records are correct before deploying applications.

#### Step 1: Modify Your Deployment Workflow

Add a step in your existing GitHub Actions deployment workflow to validate DNS records.

```yaml
- name: Validate DNS Records
  run: |
    chmod +x get_dns_records.sh
    ./get_dns_records.sh
    # Add validation logic here
    # For example, check if the A record matches the expected IP
    EXPECTED_IP="104.21.35.16"
    ACTUAL_IP=$(dig deanlofts.xyz A +short | head -n1)
    if [ "$ACTUAL_IP" != "$EXPECTED_IP" ]; then
      echo "DNS A record does not match the expected IP."
      exit 1
    fi
```

#### Step 2: Proceed with Deployment

If the validation passes, the workflow continues to deploy your application.

### 5.3 Generating DNS Reports

Provide stakeholders with regular reports on DNS configurations.

#### Step 1: Schedule Report Generation

Modify your GitHub Actions workflow to generate reports weekly.

```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Runs weekly on Sundays at midnight
```

#### Step 2: Add Report Generation Step

```yaml
- name: Generate DNS CSV Report
  run: |
    chmod +x dns_to_csv.sh
    ./dns_to_csv.sh

- name: Upload DNS Report
  uses: actions/upload-artifact@v3
  with:
    name: dns_report
    path: dns_records.csv
```

#### Step 3: Send Reports via Email Using Resend.com

Integrate an action to send the report via Resend.com.

```yaml
- name: Send Weekly DNS Report via Resend.com
  run: |
    curl -X POST https://api.resend.com/emails \
    -H "Authorization: Bearer ${{ secrets.RESEND_API_KEY }}" \
    -H "Content-Type: application/json" \
    -d '{
      "from": "DNS Report <report@deanlofts.xyz>",
      "to": ["youremail@example.com"],
      "subject": "Weekly DNS Report for deanlofts.xyz",
      "text": "Please find the attached DNS report for deanlofts.xyz.",
      "attachments": [
        {
          "filename": "dns_records.csv",
          "content": "'"$(base64 dns_records.csv)"'",
          "content_type": "text/csv"
        }
      ]
    }'
```

**Note:** Ensure that you have set up your Resend.com account and verified your domain to send emails from `@deanlofts.xyz`.

---

## 6. Conclusion

By customizing the `dig` command and leveraging Bash scripting, we've:

- Created a personalized and efficient way to fetch all DNS records.
- Developed scripts to process and save output in `.txt` and `.csv` formats.
- Explored creative and practical applications for DevOps workflows.
- Integrated the entire process with **GitHub Actions** for automated monitoring and reporting.
- Used **Resend.com** to send email notifications and reports, avoiding SMTP restrictions.

These tools not only streamline daily tasks but also enhance monitoring and reporting capabilities for DNS configurations, all within your preferred CI/CD environment.

---

**Additional Notes:**

- **Resend.com Benefits**: By using Resend.com, you can send emails reliably from GitHub Actions without worrying about SMTP server restrictions or IP blocks.
- **API Usage**: The Resend.com API allows you to send emails with attachments, which is ideal for including diffs or reports.
- **Domain Verification**: Make sure to complete domain verification steps provided by Resend.com to send emails from your domain.

**Alternative Notification Methods:**

If you prefer not to use email notifications, you can integrate other services like Slack, Microsoft Teams, or even SMS notifications using appropriate APIs and GitHub Actions.

**Using Slack Notifications:**

```yaml
- name: Send Slack Notification
  if: exists('dns_diff.txt')
  uses: slackapi/slack-github-action@v1.23.0
  with:
    payload: |
      {
        "channel": "#your-channel",
        "text": "DNS records have changed for deanlofts.xyz. See the attached diff.",
        "attachments": [
          {
            "text": "$(cat dns_diff.txt)"
          }
        ]
      }
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

- **Note:** You'll need to create a Slack app and obtain a bot token. Add `SLACK_BOT_TOKEN` to your GitHub repository secrets.

---
