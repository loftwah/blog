---
title: "From Frustration to Mastery: Migrating Linkarooie to Kamal 2"
description: "A comprehensive account of overcoming deployment chaos, Cloudflare hurdles, and Redis misconfigurations to streamline Linkarooie's production with Kamal 2."
pubDate: "Oct 25, 2024"
heroImage: "/images/linkarooie-kamal-deployment.jpg"
author: "Dean Lofts (Loftwah)"
---

I've always been someone who enjoys diving into new technologies, but migrating **Linkarooie** to **Kamal 2** for deployment tested me in ways I didn't anticipate. What I thought would be a straightforward upgrade turned into a series of challenges that had me questioning my choices. In this post, I want to share my personal journey—no filters—of how I navigated through environment variable confusion, Cloudflare SSL issues, Redis misconfigurations, and database restoration challenges to finally get Linkarooie running smoothly with Kamal 2.

## The Decision to Switch

For a while, Linkarooie was running on an older deployment method that required a lot of manual work: SSH'ing into servers, handling Docker containers individually, and wrestling with SSL configurations on Cloudflare. It was time-consuming and error-prone. I wanted a more modern, automated solution that could scale as the project grew.

That's when I decided to switch to **Kamal 2**. Its promise of automated Docker deployments, integration with GitHub Actions, and streamlined management of services like Redis and Sidekiq made it an attractive choice. I was excited about the move, anticipating a smoother deployment process and better scalability.

However, the journey was anything but smooth.

## Initial Roadblocks: Environment Variables and Secrets

As soon as I started the migration, I hit my first roadblock. I struggled to figure out how to use environment variables for the host configuration instead of hardcoding them in the `deploy.yml` file. I was also confused about the proper use of secrets versus environment variables in Kamal.

I wanted to replace hardcoded values with dynamic ones like `<%= ENV['KAMAL_HOST'] %>`, but Kamal didn't seem to interpret it as I expected. I wasn't sure where to define these environment variables—should they be in the Kamal configuration, the GitHub Actions workflow, or somewhere else?

I tried various configurations, but nothing seemed to work. Frustration was mounting, and I realized I needed help.

## Reaching Out to Igor: The Game Changer

I decided to reach out to the Kamal community for assistance. That's when **Igor Alexandrov**, one of the developers involved with Kamal, stepped in to help. Igor was incredibly patient and helpful, guiding me through the proper setup.

He shared an example repository and deployment workflows that clarified many of my misunderstandings. He pointed me to his example repository and explained how he managed environment variables and secrets.

Here's how I adjusted my `deploy.yml` based on his advice:

```yaml
# deploy.yml
service: linkarooie
image: ghcr.io/loftwah/linkarooie

servers:
  web:
    - <%= ENV['KAMAL_HOST'] %>

env:
  clear:
    RAILS_LOG_TO_STDOUT: "enabled"
  secret:
    - SECRET_KEY_BASE
    - RAILS_MASTER_KEY
    - OTHER_SECRETS
```

Igor explained that using `<%= ENV['KAMAL_HOST'] %>` allows me to inject environment variables into the configuration, which can be set in the GitHub Actions workflow or my local environment.

He also helped me understand the difference between environment variables and secrets:

- **Environment Variables**: Non-sensitive data that can be exposed in logs or error messages.
- **Secrets**: Sensitive information like API keys, passwords, and tokens that should be kept confidential.

This clarification was crucial because I had been mixing up where to use secrets and environment variables, causing issues in my configuration.

## Leveraging ChatGPT and Claude

With Igor's guidance, I was making progress, but I still faced challenges adapting his examples to my specific setup. This is where **ChatGPT** and **Claude** came into play. I used them extensively to help me understand error messages, configure GitHub Actions, and resolve issues unique to my project.

For instance, I wasn't sure how to set up the GitHub Actions workflow to deploy with Kamal without exposing my SSH keys. ChatGPT provided a template that I adapted:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.3.0

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Expose GitHub Runtime for cache
        uses: crazy-max/ghaction-github-runtime@v3

      - name: Set up SSH connection
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.PRODUCTION_SSH_PRIVATE_KEY }}

      - name: Deploy with Kamal
        run: bin/kamal deploy -f kamal-production.yml
        env:
          KAMAL_HOST: ${{ secrets.PRODUCTION_KAMAL_HOST }}
          KAMAL_REGISTRY_PASSWORD: ${{ secrets.PRODUCTION_KAMAL_REGISTRY_PASSWORD }}
          RAILS_MASTER_KEY: ${{ secrets.PRODUCTION_RAILS_MASTER_KEY }}
```

This workflow allowed me to automate deployments whenever I pushed to the `main` branch without exposing sensitive information.

## The Cloudflare SSL Puzzle

Next up was the issue with **Cloudflare SSL configurations**. Kamal's proxy expects a fully encrypted HTTPS connection, but I was using Cloudflare's **Flexible SSL**, which only encrypts traffic between the user and Cloudflare—not between Cloudflare and my server.

This mismatch caused the deployment to fail. When the Cloudflare proxy was enabled, nothing worked. When I disabled it, everything was fine. After hours of debugging and with advice from Igor, I realized I needed to switch to **Full (Strict) SSL** in Cloudflare.

However, changing this setting broke my existing production system, which relied on Flexible SSL. I had to make a tough decision. To proceed with the migration, I needed to:

1. **Disable the Cloudflare proxy temporarily** by clicking the orange cloud icon, turning it gray.
2. **Switch SSL/TLS mode to Full (Strict)** in Cloudflare.
3. **Adjust Kamal's configuration** to handle SSL certificates via Let's Encrypt.
4. **Test the setup extensively** before re-enabling the Cloudflare proxy.

Here's the relevant part of my Kamal configuration:

```yaml
proxy:
  ssl: true
  host: linkarooie.com
  app_port: 3000
```

During this process, the existing production system experienced downtime because it was configured to work with Flexible SSL. This was unavoidable but necessary to ensure Kamal's proxy could handle SSL correctly.

Once I completed these steps and confirmed everything was working, I re-enabled the Cloudflare proxy. The site was now running securely with Full (Strict) SSL, and Kamal managed the SSL certificates automatically.

## Redis Misconfigurations and DigitalOcean Warnings

While setting up Redis as an accessory in Kamal, I made a critical mistake: I exposed it publicly by specifying a port in my configuration. This led to an abuse notice from **DigitalOcean** because exposing Redis publicly is a significant security risk.

Igor pointed out that accessories like Redis should not expose ports since they communicate over an internal Docker network. Here's how I updated my `deploy.yml`:

```yaml
accessories:
  redis:
    image: redis:6-alpine
    host: <%= ENV['KAMAL_HOST'] %>
    volumes:
      - redis_data:/data
    options:
      name: redis-linkarooie
```

By removing the `ports` section, Redis was no longer accessible publicly, and the issue was resolved. This incident taught me the importance of understanding Docker networking and securing services properly.

## The Sidekiq Situation

I initially configured **Sidekiq** as an accessory, but it wasn't working correctly. Sidekiq should be deployed as part of the app because it relies on the application's codebase and needs to restart with each deployment.

After discussing this with Igor and doing some research, I updated the configuration:

```yaml
servers:
  web:
    - <%= ENV['KAMAL_HOST'] %>
  job:
    hosts:
      - <%= ENV['KAMAL_HOST'] %>
    cmd: bundle exec sidekiq
```

This change ensured that Sidekiq would run as a separate process on the server but still be part of the main application deployment. It now restarts with each deployment and stays in sync with the latest code.

## The Database Restoration Challenge

One of the most unexpected challenges was restoring the **SQLite** database. I had backups stored in **DigitalOcean Spaces**, but the restoration process didn't work smoothly within the Docker container. I needed to get the backup file into the container and restore it properly.

After several unsuccessful attempts, I found a workaround using **ppng.io** to transfer the backup file into the container:

1. **Uploaded the backup to ppng.io** using `curl`:

   ```bash
   curl -T production_backup.tar.gz https://ppng.io/your-upload-url
   ```

2. **SSH'ed into the Docker container**:

   ```bash
   docker exec -it linkarooie-web bash
   ```

3. **Navigated to the storage directory**:

   ```bash
   cd /rails/storage
   ```

4. **Downloaded the backup inside the container**:

   ```bash
   curl -O https://ppng.io/your-upload-url
   ```

5. **Restored the database using a Rake task**:

   ```bash
   bundle exec rake db:restore BACKUP_FILE=/rails/storage/production_backup.tar.gz
   ```

This workaround allowed me to restore the database. It wasn't the most elegant solution, but it worked.

### Improving the Backup Process

Realizing the need for a better backup management system, I decided to enhance the `BackupDatabaseJob` to include automatic cleanup of old backups. Over time, the backup directory could become bloated if old backups aren't removed.

I created a feature request in the project's GitHub repository:

#### Feature Request: Automatic Cleanup of Old Backups

**Issue #224**

Currently, the `BackupDatabaseJob` successfully creates and uploads backups of the database but does not automatically delete old backups. Over time, this could lead to storage accumulation, especially if backups are retained indefinitely.

**Proposed Solution**

Add a method within `BackupDatabaseJob` to delete backups older than a configurable number of days (e.g., 7 days).

The method should:

- Identify and delete `.tar.gz` files in the `db/backups` directory.
- Calculate the file age using the file's modification time.
- Delete the file if it's older than the configured maximum age.

**Example Logic:**

```ruby
def cleanup_old_backups
  backup_directory = "db/backups"
  max_age_days = 7  # Number of days to keep backups

  Dir.glob("#{backup_directory}/*.tar.gz").each do |file|
    file_age_in_days = (Time.now - File.mtime(file)) / (60 * 60 * 24)
    if file_age_in_days > max_age_days
      File.delete(file)
      Rails.logger.info "Deleted old backup file: #{file}"
    end
  end
end
```

**Additional Considerations**

- Add configuration options to adjust the backup retention policy.
- Ensure proper logging of cleanup actions.
- Optional: Provide an option to retain only the latest N backups.

By implementing this feature, I ensured that the backup process is not only functional but also sustainable over the long term.

## Final Thoughts and Lessons Learned

Migrating Linkarooie to Kamal 2 was far from easy, but it was a worthwhile endeavor. Here's what I took away from the experience:

- **Don't hesitate to seek help**: Igor's assistance was invaluable, and reaching out saved me a lot of time.
- **Understand the tools you're using**: Misconfigurations can lead to security vulnerabilities and deployment failures.
- **Leverage AI assistants**: ChatGPT and Claude were instrumental in helping me resolve complex issues.
- **Be cautious with configuration changes**: Especially when dealing with SSL settings and Docker networking.
- **Test thoroughly before going live**: Small oversights can cause significant issues, so extensive testing is crucial.
- **Plan for downtime when necessary**: Switching SSL configurations affected my production system, and planning for this helped mitigate risks.
- **Maintain your server environment**: Regularly clean up unused Docker containers and images to keep the environment healthy.
- **Enhance and document processes**: Improving the backup process and documenting it ensures long-term sustainability.

Despite the hurdles, I now have a more streamlined and automated deployment process. Kamal 2, combined with GitHub Actions, has made deployments less stressful and more reliable.

### What's Next for Linkarooie?

Moving forward, I plan to:

- **Fully document the backup and restoration process** to make it easier for future maintenance.
- **Implement the automatic cleanup of old backups** as outlined in the feature request.
- **Explore Kamal hooks** to automate additional deployment tasks.
- **Monitor the system closely** to catch any issues early.
- **Share my experience** to help others avoid the pitfalls I encountered.

If you're considering migrating to Kamal 2, I hope my experiences can help you navigate the challenges and make the process smoother. Remember, it's okay to ask for help, and sometimes the community and AI tools can provide the support you need to succeed.

---
