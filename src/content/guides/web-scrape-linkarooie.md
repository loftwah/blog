---
title: "Ultimate Guide to Scraping Linkarooie with Ruby"
description: "Fetch, parse, and report on your Linkarooie profile using HTTParty and Nokogiri. Convert Markdown to HTML with Redcarpet, automate with Cron or GitHub Actions, and adopt best practices like rate limiting, testing, data validation, and configuration management. Includes Docker and Docker Compose instructions with the latest versions."
difficulty: "advanced"
category: "Web Development & Automation"
order: 24
heroImage: "/images/matrix-linkarooie.jpg"
prerequisites:
  [
    "Basic Ruby knowledge",
    "Familiarity with HTML/CSS selectors",
    "A Ruby environment with Bundler installed",
    "Desire to output dynamic data in Markdown or HTML format",
  ]
---

## Introduction

[Linkarooie](https://linkarooie.com/) lets you create shareable link profiles, achievements, and more. In this comprehensive guide, you’ll learn how to:

1. **Fetch** Linkarooie pages via [HTTParty](https://rubygems.org/gems/httparty).
2. **Parse** HTML content with [Nokogiri](https://rubygems.org/gems/nokogiri).
3. **Output** data as Markdown or HTML (using [Redcarpet](https://rubygems.org/gems/redcarpet)).
4. **Automate** with Cron or GitHub Actions.
5. **Enhance** reliability via rate limiting, testing (RSpec + VCR), data validation, and config files.
6. **Containerise** everything using Docker and Docker Compose.

---

## 1. Project Setup

### 1.1. Directory and Files

Follow these steps to create the initial structure:

```bash
# 1. Create a directory for your project
mkdir linkarooie-scraper
cd linkarooie-scraper

# 2. Create a Gemfile for your Ruby dependencies
touch Gemfile

# 3. Create your scraper script
touch linkarooie_scraper.rb

# 4. (Optional) Create a Dockerfile and docker-compose.yml for containerisation
touch Dockerfile
touch docker-compose.yml
```

Your folder now contains:

- `Gemfile`
- `linkarooie_scraper.rb`
- `Dockerfile`
- `docker-compose.yml` (optional)

### 1.2. Define Gems in Your `Gemfile`

```ruby
source "https://rubygems.org"

gem "httparty"
gem "nokogiri"
gem "redcarpet" # Only if you want HTML conversion from Markdown

# For testing (optional best practice improvements):
# gem "rspec"
# gem "vcr"
# gem "webmock"
```

Then install:

```bash
bundle install
```

---

## 2. Docker & Docker Compose Setup

Below are **example** files for a basic Docker workflow, using **Ruby 3.3** and the **new Docker Compose**. Feel free to customise.

### 2.1. Dockerfile

```dockerfile
# Dockerfile

# Start with the official Ruby 3.3 image
FROM ruby:3.3

# Create a directory for our app
ENV APP_HOME /usr/src/app
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME

# Copy Gemfile and Gemfile.lock first for efficient caching
COPY Gemfile Gemfile.lock ./

# Install dependencies
RUN bundle install

# Copy the rest of our code
COPY . .

# Set default command
CMD [ "ruby", "linkarooie_scraper.rb" ]
```

> **Note:** You may not have a `Gemfile.lock` yet. It’s good practice to generate one locally by running `bundle install` on your host, then copy it in.

### 2.2. Docker Compose

```yaml
# docker-compose.yml
services:
  linkarooie:
    build: .
    volumes:
      - .:/usr/src/app
    command: bundle exec ruby linkarooie_scraper.rb
```

> **Important:** Docker Compose (the command `docker-compose`) is now officially replaced by **Docker Compose V2**, invoked as `docker compose`. The syntax above uses the newer file format.

#### Running with Docker

```bash
# 1. Build the Docker image
docker compose build

# 2. Run the container
docker compose up
```

Once it’s finished, you should see logs indicating the scraper ran. Reports (Markdown/HTML) will appear in your local `reports/daily` directory if configured correctly.

---

## 3. Fetching Your Linkarooie Profile with HTTParty

Inside `linkarooie_scraper.rb`, add the following code for the HTTP request:

```ruby
require "httparty"

url = "https://linkarooie.com/loftwah"
response = HTTParty.get(url, headers: { "User-Agent" => "Mozilla/5.0" })

if response.code == 200
  puts "Page fetched successfully!"
  html_content = response.body
else
  puts "Failed to fetch page. Status code: #{response.code}"
  exit
end
```

> **Tip:** Including a custom **User-Agent** header can help avoid being blocked by websites that disallow default HTTP libraries.

---

## 4. Parsing the HTML with Nokogiri

Continuing in `linkarooie_scraper.rb`:

```ruby
require "nokogiri"

doc = Nokogiri::HTML(html_content)

# Extract the main heading (profile title)
profile_title = doc.at_css("h1.text-2xl.font-bold")&.text
puts "Profile Title: #{profile_title}"

# Extract link items in the “Links” section
link_elements = doc.css(".links-section ul li")
links_data = link_elements.map do |li|
  link_title = li.at_css("h2 a")&.text&.strip
  link_url   = li.at_css("h2 a")&.[]("href")
  link_desc  = li.at_css("p")&.text&.strip
  { title: link_title, url: link_url, description: link_desc }
end

puts "Found #{links_data.size} link items!"

# Extract images (like banners, avatars, etc.)
images = doc.css("img").map { |img| img["src"] }.compact
puts "Found #{images.size} images!"
```

---

## 5. Output as Markdown

Markdown is excellent for quick reporting. Still within `linkarooie_scraper.rb`:

```ruby
require "fileutils"

# Create a directory for reports if it doesn’t exist
FileUtils.mkdir_p("reports/daily")

report_date = Time.now.strftime("%Y-%m-%d")
markdown_path = "reports/daily/#{report_date}.md"

markdown_content = <<~MD
  # Linkarooie Profile Report
  **Date:** #{report_date}

  ## Profile Title
  #{profile_title}

  ## Links
MD

links_data.each do |link|
  markdown_content << "- **#{link[:title]}**\n"
  markdown_content << "  - URL: [#{link[:url]}](#{link[:url]})\n"
  markdown_content << "  - Description: #{link[:description]}\n\n"
end

markdown_content << "## Images\n"
images.each do |img|
  markdown_content << "![Image](#{img})\n"
end

File.write(markdown_path, markdown_content)
puts "Markdown report saved to #{markdown_path}"
```

---

## 6. Converting Markdown to HTML with Redcarpet (Optional)

Add the following snippet if you want HTML output (still in `linkarooie_scraper.rb`):

```ruby
require "redcarpet"

markdown_renderer = Redcarpet::Markdown.new(Redcarpet::Render::HTML)
html_report = markdown_renderer.render(markdown_content)

html_path = "reports/daily/#{report_date}.html"
File.write(html_path, html_report)
puts "HTML report saved to #{html_path}"
```

This gives you two output formats:

- **Markdown**: Shareable as is or convertible to PDF.
- **HTML**: Perfect for browser-based viewing.

---

## 7. Rate Limiting (Best Practice)

If you need to scrape multiple pages, add a short delay or backoff:

```ruby
URLS_TO_SCRAPE = [
  "https://linkarooie.com/profile1",
  "https://linkarooie.com/profile2"
]

URLS_TO_SCRAPE.each_with_index do |url, index|
  response = HTTParty.get(url, headers: { "User-Agent" => "Mozilla/5.0" })

  if response.code == 200
    doc = Nokogiri::HTML(response.body)
    # Parse data...
  else
    warn "Failed to fetch #{url}. Status: #{response.code}"
  end

  # Sleep 2 seconds between requests (avoid hammering the server)
  sleep(2) unless index == URLS_TO_SCRAPE.size - 1
end
```

---

## 8. Testing and Validation (Recommended)

### 8.1. Testing with RSpec

1. Create a `spec` folder and add `spec_helper.rb`.
2. Write tests to confirm your selectors still work:

```ruby
# spec/scraper_spec.rb
require "spec_helper"
require_relative "../linkarooie_scraper"

RSpec.describe "LinkarooieScraper" do
  it "scrapes the loftwah profile correctly" do
    data = scrape_linkarooie("https://linkarooie.com/loftwah")
    expect(data[:profile_title]).to include("Dean Lofts")
    expect(data[:links]).not_to be_empty
  end
end
```

### 8.2. VCR for Stable Tests

Add `gem "vcr"` and `gem "webmock"`. Configure them, then wrap your tests:

```ruby
# spec/scraper_spec.rb
VCR.use_cassette("loftwah_profile") do
  data = scrape_linkarooie("https://linkarooie.com/loftwah")
  # ...
end
```

This ensures consistent test results without relying on live site availability.

### 8.3. Data Validation

Validate data before adding it to your reports:

```ruby
def sanitize_text(text)
  text_string = text.to_s.strip
  text_string.empty? ? "Untitled" : text_string
end

links_data = link_elements.map do |li|
  {
    title: sanitize_text(li.at_css("h2 a")&.text),
    url: validate_url(li.at_css("h2 a")&.[]("href")),
    description: sanitize_text(li.at_css("p")&.text)
  }
end

def validate_url(url)
  uri = URI.parse(url)
  (uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)) ? url : "Invalid URL"
rescue URI::InvalidURIError
  "Invalid URL"
end
```

---

## 9. Configuration in YAML (Optional)

To avoid hardcoded values, store them in `config/scraper.yml`:

```yaml
scraper:
  base_url: "https://linkarooie.com"
  profile_path: "/loftwah"
  selectors:
    profile_title: "h1.text-2xl.font-bold"
    link_items: ".links-section ul li"
    link_title: "h2 a"
    link_url: "h2 a"
    link_desc: "p"
  output:
    directory: "reports/daily"
    date_format: "%Y-%m-%d"
  rate_limit_seconds: 2
```

Then load it:

```ruby
require "yaml"

config = YAML.load_file("config/scraper.yml")
base_url = config.dig("scraper", "base_url")
profile_path = config.dig("scraper", "profile_path")
selectors = config.dig("scraper", "selectors")
rate_limit = config.dig("scraper", "rate_limit_seconds")

full_url = "#{base_url}#{profile_path}"
response = HTTParty.get(full_url)
# ...
sleep(rate_limit)
```

---

## 10. Automating with Cron or GitHub Actions

### 10.1. Cron (Linux/macOS)

Run daily at 9 AM:

```bash
crontab -e
# Add:
0 9 * * * /usr/bin/env ruby /path/to/linkarooie_scraper.rb
```

### 10.2. GitHub Actions

Create a `.github/workflows/scraper.yml` file and use **checkout@v4** with **Ruby 3.3**:

```yaml
name: "Daily Linkarooie Scrape"
on:
  schedule:
    - cron: "0 9 * * *"

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.3

      - name: Install Dependencies
        run: bundle install

      - name: Run Scraper
        run: bundle exec ruby linkarooie_scraper.rb
```

> **Note:** If you prefer to run this inside Docker during GitHub Actions, you can build and run the container instead of installing Ruby. However, the above example demonstrates using Ruby directly on the GitHub Actions runner.

---

## 11. Final `linkarooie_scraper.rb` Example

Here’s a condensed version of the scraper script that you can **copy and paste**:

```ruby
#!/usr/bin/env ruby

require "httparty"
require "nokogiri"
require "redcarpet"
require "fileutils"
require "uri"

URL = "https://linkarooie.com/loftwah"
RATE_LIMIT_SECONDS = 2

def scrape_linkarooie(url)
  response = HTTParty.get(url, headers: { "User-Agent" => "Mozilla/5.0" })
  raise "Failed to fetch (Status #{response.code})" unless response.code == 200

  doc = Nokogiri::HTML(response.body)

  profile_title = doc.at_css("h1.text-2xl.font-bold")&.text
  link_els = doc.css(".links-section ul li")
  links_data = link_els.map do |li|
    link_title = li.at_css("h2 a")&.text&.strip
    link_url   = li.at_css("h2 a")&.[]("href")
    link_desc  = li.at_css("p")&.text&.strip
    { title: link_title, url: link_url, description: link_desc }
  end
  images = doc.css("img").map { |img| img["src"] }.compact

  { profile_title: profile_title, links: links_data, images: images }
end

sleep(RATE_LIMIT_SECONDS) # Rate limit if scraping multiple pages

data = scrape_linkarooie(URL)

FileUtils.mkdir_p("reports/daily")
report_date = Time.now.strftime("%Y-%m-%d")

markdown_file = "reports/daily/#{report_date}.md"
markdown_content = <<~MD
  # Linkarooie Profile Report
  **Date:** #{report_date}

  ## Profile Title
  #{data[:profile_title]}

  ## Links
MD

data[:links].each do |l|
  markdown_content << "- **#{l[:title]}**\n"
  markdown_content << "  - URL: [#{l[:url]}](#{l[:url]})\n"
  markdown_content << "  - Description: #{l[:description]}\n\n"
end

markdown_content << "## Images\n"
data[:images].each do |img|
  markdown_content << "![Image](#{img})\n"
end

File.write(markdown_file, markdown_content)
puts "Markdown report saved to #{markdown_file}"

# Convert to HTML
html_file = "reports/daily/#{report_date}.html"
renderer = Redcarpet::Markdown.new(Redcarpet::Render::HTML)
html_report = renderer.render(markdown_content)
File.write(html_file, html_report)
puts "HTML report saved to #{html_file}"
```

---

## Conclusion

By following this guide, you’ll have a robust, production-ready process for scraping Linkarooie profiles. You’ve learned to:

- **Build** and **run** your Ruby scraper in Docker with Docker Compose (using Ruby 3.3).
- **Fetch** HTML with HTTParty and **parse** with Nokogiri.
- **Convert** data into Markdown or HTML with Redcarpet.
- **Automate** via Cron or GitHub Actions—now with **checkout@v4** and **Ruby 3.3**.
- **Extend** your reliability with rate limiting, testing, validation, and YAML-based configuration.
