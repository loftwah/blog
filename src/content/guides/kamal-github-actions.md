---
title: "Automating Linkarooie Deployment with Kamal and GitHub Actions"
description: "A complete guide to automating the deployment of the Linkarooie application using Kamal and GitHub Actions, covering secrets, Redis, Sidekiq, and SSL configuration."
difficulty: "intermediate"
category: "Deployment Automation"
order: 1
heroImage: "/images/guide-linkarooie-deployment.jpg"
prerequisites:
  [
    "Existing Kamal setup",
    "Basic GitHub Actions knowledge",
    "Familiarity with Docker and Redis",
  ]
---

# Automating Linkarooie Deployment with Kamal and GitHub Actions

This guide will walk you through automating the deployment of your **Linkarooie** application using **Kamal** and **GitHub Actions**. We will focus on using **composite actions** for setup, deploying both web and Sidekiq services, handling **Redis**, **SSL via Let's Encrypt**, and rolling deploys. Importantly, we will also show how to securely manage all the **secrets** and environment variables from your **`deploy.yml`**.

---

## Step 1: Understanding the `deploy.yml`

Here’s a breakdown of your **Linkarooie** `deploy.yml` configuration:

```yaml
service: linkarooie
image: loftwah/linkarooie

# Servers for deployment
servers:
  web:
    - <%= ENV['KAMAL_HOST'] %> # Set the KAMAL_HOST as an environment variable

  # Sidekiq server for background jobs
  job:
    hosts:
      - <%= ENV['KAMAL_HOST'] %>
    cmd: bundle exec sidekiq # Command to start Sidekiq

# SSL and proxy configuration
proxy:
  ssl: true # Enable SSL via Let's Encrypt
  host: linkarooie.com # Domain for the app
  app_port: 3000 # The port your app listens to inside the container

# Docker registry credentials
registry:
  server: ghcr.io
  username: loftwah
  password:
    - KAMAL_REGISTRY_PASSWORD

# Specify the builder architecture
builder:
  arch: amd64

# Environment variables
env:
  clear:
    KAMAL_HOST: <%= ENV['KAMAL_HOST'] %> # Host for the deployment
    REDIS_URL: redis://redis-linkarooie:6379/0 # URL for Redis
  secret:
    - KAMAL_REGISTRY_USERNAME
    - KAMAL_REGISTRY_PASSWORD
    - SECRET_KEY_BASE
    - AXIOM_API_KEY
    - DO_TOKEN
    - SPACES_REGION
    - SPACES_BUCKET_NAME
    - SPACES_BUCKET_CONTENT
    - SPACES_ACCESS_KEY_ID
    - SPACES_SECRET_ACCESS_KEY
    - RAILS_MASTER_KEY

# Volumes for persistent storage
volumes:
  - data_storage:/rails/storage

# Accessories for additional services
accessories:
  redis:
    service: linkarooie
    image: redis:6-alpine
    host: <%= ENV['KAMAL_HOST'] %>
    volumes:
      - redis_data:/data
    options:
      name: redis-linkarooie

# Rolling deploys
boot:
  limit: 10 # Number of servers to restart at once
  wait: 2 # Seconds to wait between restarts

# Aliases for common commands
aliases:
  shell: app exec --interactive --reuse "bash"
```

### Key Points to Note:

- **Services**: You are deploying both a **web service** and a **Sidekiq service** for background jobs.
- **Proxy and SSL**: This setup includes SSL through **Let's Encrypt** for the domain `linkarooie.com`.
- **Docker Registry**: Images are pulled from GitHub's **Container Registry (ghcr.io)**.
- **Redis**: Configured as an accessory service with a **persistent data volume**.
- **Secrets and Environment Variables**: Key secrets like `KAMAL_REGISTRY_PASSWORD`, `SECRET_KEY_BASE`, and others are managed securely.

Now, let’s move on to **GitHub Actions** to automate the deployment.

---

## Step 2: Setting Up GitHub Actions for Deployment

### A. Composite Action for Setup

We begin by setting up **Ruby**, **Docker**, and **SSH**. This composite action ensures that you don't repeat these steps across different workflows.

Create a file at `.github/workflows/setup/action.yml`:

```yaml
name: Setup Environment

inputs:
  ssh-private-key:
    description: SSH Private Key
    required: true

runs:
  using: "composite"
  steps:
    - name: Set up Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version-file: .ruby-version

    - name: Set up Docker
      uses: docker/setup-buildx-action@v3

    - name: Set up SSH agent
      uses: webfactory/ssh-agent@v0.9.0
      with:
        ssh-private-key: ${{ inputs.ssh-private-key }}
```

This reusable **composite action** will be called by both the automatic and manual deployment workflows.

---

### B. Composite Action for Kamal Deploy

This composite action handles the actual deployment using **Kamal**. It will be used to deploy both the **web service** and the **Sidekiq service**.

Create the file `.github/workflows/kamal-deploy/action.yaml`:

```yaml
name: Kamal Deploy

inputs:
  environment:
    description: Deployment environment (e.g., production, staging)
    required: true
  kamal-registry-password:
    description: Kamal Docker Registry Password
    required: true
  database-url:
    description: Database URL
    required: true
  redis-url:
    description: Redis URL
    required: true
  rails-master-key:
    description: Rails Master Key
    required: true
  secret-key-base:
    description: Rails Secret Key Base
    required: true
  axiom-api-key:
    description: Axiom API Key
    required: false
  do-token:
    description: DigitalOcean Token
    required: false
  spaces-region:
    description: Spaces Region
    required: false
  spaces-bucket-name:
    description: Spaces Bucket Name
    required: false
  spaces-access-key-id:
    description: Spaces Access Key ID
    required: false
  spaces-secret-access-key:
    description: Spaces Secret Access Key
    required: false

runs:
  using: "composite"
  steps:
    - name: Deploy with Kamal
      shell: bash
      run: |
        ./bin/kamal deploy --destination=${{ inputs.environment }}
      env:
        KAMAL_REGISTRY_PASSWORD: ${{ inputs.kamal-registry-password }}
        DATABASE_URL: ${{ inputs.database-url }}
        REDIS_URL: ${{ inputs.redis-url }}
        RAILS_MASTER_KEY: ${{ inputs.rails-master-key }}
        SECRET_KEY_BASE: ${{ inputs.secret-key-base }}
        AXIOM_API_KEY: ${{ inputs.axiom-api-key }}
        DO_TOKEN: ${{ inputs.do-token }}
        SPACES_REGION: ${{ inputs.spaces-region }}
        SPACES_BUCKET_NAME: ${{ inputs.spaces-bucket-name }}
        SPACES_ACCESS_KEY_ID: ${{ inputs.spaces-access-key-id }}
        SPACES_SECRET_ACCESS_KEY: ${{ inputs.spaces-secret-access-key }}
```

This action will **deploy the web and Sidekiq services** and configure **Redis** as defined in your `deploy.yml`.

---

### C. Automatic Deployment Workflow

Now, let's set up a workflow that triggers **automatic deployment** whenever you push to the `main` branch.

Create the file `.github/workflows/01.deploy_production.yaml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Environment
        uses: ./.github/workflows/setup/action.yml
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Deploy with Kamal
        uses: ./.github/workflows/kamal-deploy/action.yaml
        with:
          environment: production
          kamal-registry-password: ${{ secrets.KAMAL_REGISTRY_PASSWORD }}
          database-url: ${{ secrets.DATABASE_URL }}
          redis-url: ${{ secrets.REDIS_URL }}
          rails-master-key: ${{ secrets.RAILS_MASTER_KEY }}
          secret-key-base: ${{ secrets.SECRET_KEY_BASE }}
          axiom-api-key: ${{ secrets.AXIOM_API_KEY }}
          do-token: ${{ secrets.DO_TOKEN }}
          spaces-region: ${{ secrets.SPACES_REGION }}
          spaces-bucket-name: ${{ secrets.SPACES_BUCKET_NAME }}
          spaces-access-key-id: ${{ secrets.SPACES_ACCESS_KEY_ID }}
          spaces-secret-access-key: ${{ secrets.SPACES_SECRET_ACCESS_KEY }}
```

### D. Manual Deployment Workflow

For manual deployments, you can trigger them directly from GitHub’s interface.

Create the file `.github/workflows/02.deploy_manually.yaml`:

```yaml
name: Deploy Manually

on:
  workflow_dispatch:
    inputs:
      environment:
        description: Deployment Environment
        required: true
        default: "production"
        type: choice
        options:
          - production
          - staging

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4



 - name: Setup Environment
        uses: ./.github/workflows/setup/action.yml
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Deploy with Kamal
        uses: ./.github/workflows/kamal-deploy/action.yaml
        with:
          environment: ${{ github.event.inputs.environment }}
          kamal-registry-password: ${{ secrets.KAMAL_REGISTRY_PASSWORD }}
          database-url: ${{ secrets.DATABASE_URL }}
          redis-url: ${{ secrets.REDIS_URL }}
          rails-master-key: ${{ secrets.RAILS_MASTER_KEY }}
          secret-key-base: ${{ secrets.SECRET_KEY_BASE }}
          axiom-api-key: ${{ secrets.AXIOM_API_KEY }}
          do-token: ${{ secrets.DO_TOKEN }}
          spaces-region: ${{ secrets.SPACES_REGION }}
          spaces-bucket-name: ${{ secrets.SPACES_BUCKET_NAME }}
          spaces-access-key-id: ${{ secrets.SPACES_ACCESS_KEY_ID }}
          spaces-secret-access-key: ${{ secrets.SPACES_SECRET_ACCESS_KEY }}
```

---

### Step 3: Managing Secrets and Environment Variables

As per your `deploy.yml`, the following secrets and environment variables need to be securely managed:

#### Secrets to Add in GitHub

- `KAMAL_REGISTRY_PASSWORD`
- `DATABASE_URL`
- `REDIS_URL`
- `SECRET_KEY_BASE`
- `AXIOM_API_KEY`
- `DO_TOKEN`
- `SPACES_REGION`
- `SPACES_BUCKET_NAME`
- `SPACES_ACCESS_KEY_ID`
- `SPACES_SECRET_ACCESS_KEY`
- `RAILS_MASTER_KEY`
- `SSH_PRIVATE_KEY`

You can add these secrets in **GitHub** by going to **Settings → Secrets → Actions**.

---

## Conclusion

This complete guide ties your **Linkarooie `deploy.yml`** directly into the **GitHub Actions** workflows, including:

- **Automatic and manual deployments**.
- Handling of **Redis**, **Sidekiq**, and **SSL**.
- Securely managing all the **secrets** and **environment variables** from the `deploy.yml`.

Now your deployments are fully automated and aligned with the configuration you’ve set up in **Kamal**.

---

## Acknowledgments

A special thank you to [Igor Alexandrov](https://github.com/igor-alexandrov) for creating and maintaining [Kamal GitHub Actions](https://github.com/igor-alexandrov/kamal-github-actions), which made automating the deployment of Linkarooie much easier.

---
