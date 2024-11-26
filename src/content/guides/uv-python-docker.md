---
title: "UV with Python and Docker: The Ultimate Guide to Modern Python Development"
description: "A comprehensive guide to using UV package manager with Python and Docker. Learn how to build efficient, multi-architecture Python applications with best practices for both development and production."
difficulty: "intermediate"
category: "DevOps"
order: 21
heroImage: "/images/python-docker-uv.png"
prerequisites:
  - "Basic understanding of Python development"
  - "Familiarity with Docker concepts"
  - "Docker and Docker BuildX installed"
---

## Introduction

UV is a blazing-fast Python package manager written in Rust that's changing how we build Python applications. In this guide, we'll explore using UV with Docker to create efficient, reproducible Python environments that work everywhere.

## What We're Building

We'll create:

- Development and production Docker setups using UV
- Multi-architecture builds that work on any computer
- Efficient caching systems for faster builds
- Secure, production-ready configurations

## Getting Started: Basic UV Setup

Let's start with the simplest possible UV setup in Docker. This is our foundation:

```dockerfile
# syntax=docker/dockerfile:1.4

FROM --platform=$TARGETPLATFORM python:3.13-slim-bookworm AS base

# Install UV
ADD --chmod=755 https://astral.sh/uv/install.sh /uv-installer.sh
RUN /uv-installer.sh && rm /uv-installer.sh

# Configure UV
ENV PATH="/root/.local/bin:$PATH" \
    UV_SYSTEM_PYTHON=1 \
    UV_CACHE_DIR=/root/.cache/uv \
    PYTHONUNBUFFERED=1

WORKDIR /app
```

This base setup:

- Uses the latest Python 3.13
- Installs UV using the official installer
- Configures UV for system-wide use
- Sets up proper caching

## Development Environment

For development, we need additional tools. Here's a more complete setup:

```dockerfile
# syntax=docker/dockerfile:1.4

FROM --platform=$TARGETPLATFORM python:3.13-slim-bookworm AS dev-base

# Install UV and development dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install UV
ADD --chmod=755 https://astral.sh/uv/install.sh /uv-installer.sh
RUN /uv-installer.sh && rm /uv-installer.sh

# Configure UV for development
ENV PATH="/root/.local/bin:$PATH" \
    UV_SYSTEM_PYTHON=1 \
    UV_CACHE_DIR=/root/.cache/uv \
    PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy

WORKDIR /app
```

Key differences for development:

- Additional build tools installed
- Git for version control
- `UV_LINK_MODE=copy` for better compatibility

## Production Environment

Production needs a leaner, more secure setup:

```dockerfile
# syntax=docker/dockerfile:1.4

FROM --platform=$TARGETPLATFORM python:3.13-slim-bookworm AS prod-base

# Install minimal dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/
ENV UV_SYSTEM_PYTHON=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
```

Notice how we:

- Minimize installed packages
- Use the official UV container image
- Keep only essential environment variables

## Real-World Example: FastAPI Application

Here's a complete example using FastAPI that demonstrates all best practices:

```dockerfile
# syntax=docker/dockerfile:1.4

# Build stage
FROM --platform=$TARGETPLATFORM python:3.13-slim-bookworm AS builder

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/
ENV UV_SYSTEM_PYTHON=1

WORKDIR /build

# Install dependencies
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system --compile-bytecode \
    --no-editable --only-binary :all: \
    -r pyproject.toml

# Final stage
FROM --platform=$TARGETPLATFORM python:3.13-slim-bookworm

WORKDIR /app

# Copy Python packages and bytecode
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/lib/python3.13/__pycache__ /usr/local/lib/python3.13/__pycache__

# Copy application code
COPY . .

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Setting Up Multi-Architecture Builds

First, create your BuildX builder:

```bash
# Create new builder instance
docker buildx create --name mybuilder --driver docker-container --bootstrap

# Use the new builder
docker buildx use mybuilder

# Verify available platforms
docker buildx inspect --bootstrap
```

Then build for multiple architectures:

```bash
# Build and push
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --cache-from type=registry,ref=ghcr.io/username/myapp:cache \
  --cache-to type=registry,ref=ghcr.io/username/myapp:cache,mode=max \
  -t ghcr.io/username/myapp:latest \
  --push .
```

## Managing Dependencies

UV provides multiple ways to install dependencies. Here are the most common patterns:

### From requirements.txt

```dockerfile
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system -r requirements.txt
```

### From pyproject.toml

```dockerfile
COPY pyproject.toml .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system -r pyproject.toml
```

### Specific Packages

```dockerfile
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system \
    fastapi~=0.109.0 \
    uvicorn~=0.27.0
```

## Development vs Production Setup

### Development Compose File

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
      target: dev
    volumes:
      - .:/app
      - uv-cache:/root/.cache/uv
    environment:
      - UV_SYSTEM_PYTHON=1
      - PYTHONUNBUFFERED=1
    command: uvicorn app.main:app --reload --host 0.0.0.0

volumes:
  uv-cache:
```

### Production Compose File

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      platforms:
        - linux/amd64
        - linux/arm64
    environment:
      - UV_SYSTEM_PYTHON=1
      - PYTHONUNBUFFERED=1
    deploy:
      resources:
        limits:
          memory: 512M
```

## Best Practices

### 1. Efficient Caching

Always use BuildX cache mounts:

```dockerfile
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system package-name
```

### 2. Security

Run as non-root user:

```dockerfile
RUN useradd -m -s /bin/bash appuser
USER appuser
```

### 3. Image Size

Keep images small:

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    package-name \
    && rm -rf /var/lib/apt/lists/*
```

## Working with Private Packages

### Using SSH

```dockerfile
RUN --mount=type=ssh \
    uv pip install --system \
    git+ssh://git@github.com/org/repo.git
```

### Using Token

```dockerfile
ARG GITHUB_TOKEN
RUN --mount=type=secret,id=github_token \
    uv pip install --system \
    git+https://${GITHUB_TOKEN}@github.com/org/repo.git
```

## Troubleshooting Guide

### Common Issues

1. **UV Cache Permission Issues**

```dockerfile
RUN mkdir -p /root/.cache/uv && chmod 777 /root/.cache/uv
```

2. **Platform-Specific Problems**

```dockerfile
RUN case "$(uname -m)" in \
        aarch64) ARCH='arm64' ;; \
        x86_64) ARCH='amd64' ;; \
    esac && \
    apt-get update && apt-get install -y package-name:${ARCH}
```

3. **Memory Issues**

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Debug Commands

Check your setup:

```bash
# View UV cache directory
docker run --rm myimage uv cache dir

# Check UV version
docker run --rm myimage uv --version

# List installed packages
docker run --rm myimage uv pip list

# Verify Python paths
docker run --rm myimage python -c "import sys; print(sys.path)"
```

## Next Steps

1. Implement CI/CD pipelines with UV
2. Set up automated dependency updates
3. Create development team guidelines
4. Optimize build times further

## Conclusion

You now have a complete toolkit for building Python applications with UV and Docker. This setup provides:

- Fast dependency installation
- Reproducible builds
- Multi-architecture support
- Development and production configurations
- Best practices for security and efficiency

Remember to regularly update UV and your dependencies to get the latest improvements and security fixes.
