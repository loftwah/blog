---
title: "UV with Python and Docker: A Comprehensive Guide to Modern Python Development"
description: "Learn how to use the UV package manager with Python and Docker. This guide covers two main approaches, best practices, and how to optimize your development and production environments."
difficulty: "Intermediate"
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

We'll cover two main approaches:

- Using official UV Docker images
- Custom UV integration in your Docker builds

We'll discuss the pros and cons of each approach, best practices, and when to use each method.

## What We're Building

We'll create:

- Development and production Docker setups using UV
- Multi-architecture builds that work on any computer
- Efficient caching systems for faster builds
- Secure, production-ready configurations

## Two Approaches to Using UV in Docker

### Approach 1: Using Official UV Docker Images

The simplest way to get started with UV in Docker is by using the official UV Docker images.

**Dockerfile Example:**

```dockerfile
FROM ghcr.io/astral-sh/uv:python3.13-bookworm
COPY . .
RUN uv pip install -r requirements.txt
```

**Pros:**

- Minimal setup required
- Officially maintained images with regular security updates
- Guaranteed UV compatibility
- Best for simple applications, learning, and prototypes

**Cons:**

- Limited optimization options
- Larger image sizes
- Less control over the Python environment
- May include unnecessary dependencies
- No multi-stage build benefits

### Approach 2: Custom UV Integration

For more control and optimization, you can integrate UV into your own Docker images.

**Dockerfile Example:**

```dockerfile
# Build stage
FROM python:3.13-slim-bookworm AS builder

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
FROM python:3.13-slim-bookworm

WORKDIR /app
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY . .
```

**Pros:**

- Smaller final image size
- Better build caching
- Fine-grained control over dependencies
- Multi-stage build optimization
- Production-ready configuration
- Support for complex applications
- Better security practices

**Cons:**

- More complex setup
- Requires Docker expertise
- More maintenance responsibility
- Longer initial setup time

## When to Use Each Approach

### Use Official UV Docker Images When:

1. Building simple applications
2. Creating proof-of-concept projects
3. Learning UV and Docker
4. Quick prototyping
5. CI/CD testing environments

### Use Custom UV Integration When:

1. Building production applications
2. Optimizing for size and performance
3. Implementing complex deployment strategies
4. Requiring multi-architecture support
5. Managing multiple environments (development/production)

## Getting Started: Basic UV Setup

### Using Official UV Docker Images

This is the simplest setup using the official UV image.

**Dockerfile:**

```dockerfile
FROM ghcr.io/astral-sh/uv:python3.13-bookworm
COPY . .
RUN uv pip install -r requirements.txt

CMD ["python", "-m", "your_application"]
```

### Custom UV Integration

For more control and optimization, start with a base Python image and integrate UV.

**Dockerfile:**

```dockerfile
# syntax=docker/dockerfile:1.4

FROM python:3.13-slim-bookworm AS base

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/
ENV UV_SYSTEM_PYTHON=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
```

## Development Environment Setup

### Official Image Approach

**docker-compose.yml:**

```yaml
services:
  app:
    image: ghcr.io/astral-sh/uv:python3.13-bookworm
    volumes:
      - .:/app
    command: uvicorn app.main:app --reload --host 0.0.0.0
```

### Custom Integration Approach

**docker-compose.yml:**

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
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

**Dockerfile.dev:**

```dockerfile
# syntax=docker/dockerfile:1.4

FROM python:3.13-slim-bookworm

# Install development dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/
ENV UV_SYSTEM_PYTHON=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1

WORKDIR /app
```

## Production Environment Setup

### Official Image Approach

**Dockerfile:**

```dockerfile
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

WORKDIR /app
COPY . .
RUN uv pip install --system -r requirements.txt

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

### Custom Integration Approach

**Dockerfile:**

```dockerfile
# syntax=docker/dockerfile:1.4

# Build stage
FROM python:3.13-slim-bookworm AS builder

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/
ENV UV_SYSTEM_PYTHON=1

WORKDIR /build
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system --compile-bytecode \
    --no-editable --only-binary :all: \
    -r pyproject.toml

# Final stage
FROM python:3.13-slim-bookworm

WORKDIR /app

# Copy installed packages
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages

# Copy application code
COPY . .

# Create a non-root user and switch to it
RUN useradd -m -s /bin/bash appuser
USER appuser

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

## Best Practices

### Security

- **Run as a non-root user**

  ```dockerfile
  RUN useradd -m -s /bin/bash appuser
  USER appuser
  ```

- **Keep your images up to date**

  Always use specific versions and update regularly to include security patches.

  ```dockerfile
  FROM ghcr.io/astral-sh/uv:0.5.4-python3.13-bookworm
  ```

### Caching

Use Docker BuildKit cache mounts to speed up dependency installation.

```dockerfile
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install [...]
```

### Multi-Architecture Support

Leverage Docker Buildx for building images that support multiple architectures.

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t myapp:latest \
  --push .
```

## Migration Path

Start with the official UV images for simplicity. As your application grows, consider migrating to a custom integration to optimize for production.

1. Begin with official UV images.
2. Introduce multi-stage builds.
3. Implement caching strategies.
4. Add security hardening.
5. Optimize for production deployment.

## Performance Comparison

### Build Time (Example Project)

- **Official Image:** ~2 minutes
- **Custom Integration:** ~3 minutes on the first build, ~30 seconds on subsequent builds due to caching

### Image Size (Example Project)

- **Official Image:** ~1.2GB
- **Custom Integration:** ~400MB

### Memory Usage (Example Project)

- **Official Image:** ~500MB
- **Custom Integration:** ~300MB

## Real-World Example: FastAPI Application

Here's a complete example using FastAPI with custom UV integration.

**Dockerfile:**

```dockerfile
# syntax=docker/dockerfile:1.4

# Build stage
FROM python:3.13-slim-bookworm AS builder

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/
ENV UV_SYSTEM_PYTHON=1

WORKDIR /build

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies with caching
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system --compile-bytecode \
    --no-editable --only-binary :all: \
    -r pyproject.toml

# Final stage
FROM python:3.13-slim-bookworm

WORKDIR /app

# Copy installed packages
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages

# Copy application code
COPY . .

# Run as non-root user
RUN useradd -m -s /bin/bash appuser
USER appuser

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

## Setting Up Multi-Architecture Builds

First, create and bootstrap a new Buildx builder.

```bash
# Create new builder instance
docker buildx create --name mybuilder --driver docker-container --bootstrap

# Use the new builder
docker buildx use mybuilder
```

Build your image for multiple architectures and push to a registry.

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/username/myapp:latest \
  --push .
```

## Managing Dependencies

### Using `requirements.txt`

```dockerfile
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system -r requirements.txt
```

### Using `pyproject.toml`

```dockerfile
COPY pyproject.toml .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system -r pyproject.toml
```

### Installing Specific Packages

```dockerfile
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system \
    fastapi~=0.109.0 \
    uvicorn~=0.27.0
```

## Working with Private Packages

### Using SSH Keys

```dockerfile
RUN --mount=type=ssh \
    uv pip install --system \
    git+ssh://git@github.com/org/repo.git
```

### Using Access Tokens

```dockerfile
ARG GITHUB_TOKEN
RUN --mount=type=secret,id=github_token \
    uv pip install --system \
    git+https://${GITHUB_TOKEN}@github.com/org/repo.git
```

## Troubleshooting Guide

### Common Issues

1. **UV Cache Permission Issues**

   Ensure the cache directory has the correct permissions.

   ```dockerfile
   RUN mkdir -p /root/.cache/uv && chmod 777 /root/.cache/uv
   ```

2. **Platform-Specific Problems**

   Handle platform-specific dependencies.

   ```dockerfile
   RUN case "$(uname -m)" in \
           aarch64) ARCH='arm64' ;; \
           x86_64) ARCH='amd64' ;; \
       esac && \
       apt-get update && apt-get install -y package-name:${ARCH}
   ```

3. **Memory Issues**

   Set resource limits in your Docker Compose file.

   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             memory: 2G
   ```

### Debugging Commands

- **Check UV version**

  ```bash
  docker run --rm myimage uv --version
  ```

- **List installed packages**

  ```bash
  docker run --rm myimage uv pip list
  ```

- **Inspect Python paths**

  ```bash
  docker run --rm myimage python -c "import sys; print(sys.path)"
  ```

## Next Steps

1. Implement CI/CD pipelines using UV and Docker.
2. Set up automated dependency updates with Dependabot or similar tools.
3. Establish development team guidelines for Docker and UV usage.
4. Explore further build optimizations.

## Conclusion

Choosing between the official UV Docker images and custom UV integration depends on your specific needs:

- **Official UV Images**: Ideal for learning, development, and simple applications where ease of setup is a priority.
- **Custom UV Integration**: Suited for production environments, optimization, and complex deployment strategies requiring finer control over the build process.

Start with the official images to get up and running quickly, and consider transitioning to custom integration as your project grows in complexity and demands higher performance and security.

You now have a complete toolkit for building Python applications with UV and Docker. This setup provides:

- Fast dependency installation
- Reproducible builds
- Multi-architecture support
- Development and production configurations
- Best practices for security and efficiency

Remember to regularly update UV and your dependencies to get the latest improvements and security fixes.
