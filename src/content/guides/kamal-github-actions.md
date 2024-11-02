---
title: "Automating Linkarooie Deployment with Kamal and GitHub Actions"
description: "A complete guide to automating the deployment of the Linkarooie application using Kamal and GitHub Actions, covering secrets, Redis, Sidekiq, and SSL configuration."
difficulty: "intermediate"
category: "Deployment Automation"
order: 10
heroImage: "/images/guide-linkarooie-deployment.jpg"
prerequisites:
  [
    "Existing Kamal setup",
    "Basic GitHub Actions knowledge",
    "Familiarity with Docker and Redis",
  ]
---

# Automating Linkarooie Deployment with Kamal and GitHub Actions

This guide is tailored to automate the deployment of **Linkarooie** using **Kamal** and **GitHub Actions**, based on a CI-driven workflow with clear deployment stages. This configuration supports both automatic and manual deployments with concurrency controls, ensuring stable and conflict-free releases.

---

## Workflow Overview

Your deployment follows this critical sequence:

**Push code to branch → CI runs on branch → Merge to main → Deploy from main**

With this flow, code is rigorously tested before deployment, minimizing risks in production. Here’s a breakdown of the five essential files that support this process:

1. **Automatic Deployment Workflow** (Triggered by main branch)
2. **Manual Deployment Workflow** (Triggered on demand)
3. **Kamal Command Runner Workflow** (For specific commands)
4. **Setup Composite Action** (Configures environment)
5. **Kamal Deploy Composite Action** (Handles deployment)

### Folder Structure

```plaintext
.github/
└── workflows/
    ├── 01-deploy-to-production.yml
    ├── 02-deploy-manually.yml
    ├── 03-kamal-run-command.yml
    ├── setup/
    │   └── action.yml
    └── kamal-deploy/
        └── action.yml
```

---

## Prerequisites

Before starting, ensure you have:

- **Kamal** set up on the server
- Familiarity with **GitHub Actions**
- Basic knowledge of **Docker** and **Redis**

---

## Step 1: Setting Up Secrets in GitHub

Configure the following secrets under **Settings → Secrets → Actions** in your GitHub repository:

- `DROPLET_SSH_PRIVATE_KEY`
- `KAMAL_HOST`
- `KAMAL_REGISTRY_USERNAME`
- `KAMAL_REGISTRY_PASSWORD`
- `SECRET_KEY_BASE`
- `AXIOM_API_KEY`
- `DO_TOKEN`
- `SPACES_REGION`
- `SPACES_BUCKET_NAME`
- `SPACES_BUCKET_CONTENT`
- `SPACES_ACCESS_KEY_ID`
- `SPACES_SECRET_ACCESS_KEY`
- `RAILS_MASTER_KEY`

These secrets ensure secure access to credentials and essential environment variables across workflows.

---

## Step 2: Workflow Files and Deployment Configuration

### 1. Automatic Deployment Workflow (01-deploy-to-production.yml)

Triggered when code is merged into the **main** branch, after CI passes. This workflow includes concurrency checks to prevent conflicting deployments.

```yaml
name: 01. Deploy to Production

permissions:
  id-token: write
  contents: read
  packages: write

on:
  push:
    branches:
      - main
  workflow_run:
    workflows: ["CI"]
    types:
      - completed

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    concurrency:
      group: production_environment
      cancel-in-progress: true
    steps:
      - uses: actions/checkout@v4

      - name: Setup Environment
        uses: ./.github/workflows/setup/action.yml
        with:
          ssh-private-key: ${{ secrets.DROPLET_SSH_PRIVATE_KEY }}

      - name: Deploy with Kamal
        uses: ./.github/workflows/kamal-deploy/action.yml
        with:
          environment: production
          kamal-host: ${{ secrets.KAMAL_HOST }}
          # ... (other secrets)
```

### 2. Manual Deployment Workflow (02-deploy-manually.yml)

Manually triggered for deploying specific environments, like staging or testing.

```yaml
name: 02. Deploy Manually

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Deployment Environment"
        required: true
        type: choice
        options:
          - production
          - staging

jobs:
  deploy-manual:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Environment
        uses: ./.github/workflows/setup/action.yml
        with:
          ssh-private-key: ${{ secrets.DROPLET_SSH_PRIVATE_KEY }}

      - name: Kamal Deploy
        uses: ./.github/workflows/kamal-deploy/action.yml
        with:
          environment: ${{ github.event.inputs.environment }}
          kamal-host: ${{ secrets.KAMAL_HOST }}
          # ... (other secrets)
```

### 3. Kamal Command Runner Workflow (03-kamal-run-command.yml)

Use this workflow to run commands like **proxy reboot** or **upgrade** for production management.

```yaml
name: 03. Kamal Run Command

on:
  workflow_dispatch:
    inputs:
      command:
        description: "Command to Run"
        required: true
        type: choice
        options:
          - proxy reboot --rolling -y
          - upgrade --rolling -y

jobs:
  kamal_run_command:
    steps:
      - uses: actions/checkout@v4

      - name: Run Kamal Command
        env:
          KAMAL_HOST: ${{ secrets.KAMAL_HOST }}
        run: ./bin/kamal ${{ github.event.inputs.command }} --destination=production
```

---

## Step 3: Defining Reusable Actions

### A. Setup Action (setup/action.yml)

This composite action prepares the environment by configuring **Ruby**, **Docker**, and **SSH**.

```yaml
name: Setup Environment

inputs:
  ssh-private-key:
    required: true

runs:
  using: composite
  steps:
    - uses: ruby/setup-ruby@v1
    - uses: docker/setup-buildx-action@v3
    - uses: webfactory/ssh-agent@v0.9.0
      with:
        ssh-private-key: ${{ inputs.ssh-private-key }}
```

### B. Kamal Deploy Action (kamal-deploy/action.yml)

Handles the deployment process, setting all required environment variables.

```yaml
name: Kamal Deploy

inputs:
  environment:
    description: "Deployment Environment"
    required: true

runs:
  using: composite
  steps:
    - name: Deploy with Kamal
      run: ./bin/kamal deploy --destination=${{ inputs.environment }}
```

---

## Example Branch Workflow

1. **Feature Development**: Push changes to a feature branch.
2. **CI Testing**: Run tests and checks on the feature branch.
3. **Merge to Main**: Upon successful tests, merge to **main**.
4. **Deployment**: The main branch triggers the automatic deployment to production.

This flow ensures only fully tested code is deployed.

---

## Concurrency and Safety Checks

To avoid deployment conflicts, each job includes a **concurrency** setting. This setup prevents multiple deployments from running simultaneously, ensuring only one deployment per environment at a time:

```yaml
concurrency:
  group: production_environment
  cancel-in-progress: true
```

By cancelling in-progress jobs, this setting prevents overlapping or redundant deployments, preserving system stability.

---

## Testing Your Workflows

Since GitHub Actions cannot be fully tested locally, use branches to verify workflow configurations. Test with **manual triggers** when necessary and monitor the **Actions** tab for any issues.

---

## Security and Best Practices

- **Secret Management**: Store sensitive data in **GitHub Secrets**.
- **SSH Handling**: Use **ssh-agent** for secure key management.
- **Concurrency Controls**: Prevent conflicting deployments with concurrency settings.
- **Explicit Permissions**: Only enable necessary permissions for each workflow.

---

## Acknowledgments

Thanks to [Igor Alexandrov](https://github.com/igor-alexandrov) for developing Kamal GitHub Actions, simplifying the automation of Linkarooie’s deployment.

This guide aligns with your working setup, ensuring a consistent and streamlined deployment process using Kamal and GitHub Actions. With this setup, you can focus on development, knowing that your code is deployed reliably and securely.

---
