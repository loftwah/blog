---
title: "Mastering UV with Python and Docker: A Comprehensive Guide to Modern Python Development"
description: "Unlock the full potential of Python development with UV and Docker. This guide delves into two primary approaches—using official UV Docker images and custom UV integration—to optimize your development and production environments. Learn best practices, advanced techniques, and how to build efficient, multi-architecture applications."
difficulty: "intermediate"
category: "DevOps"
order: 21
heroImage: "/images/python-docker-uv.png"
prerequisites:
  - "Intermediate understanding of Python development (Python 3.13 recommended)"
  - "Basic familiarity with Docker concepts"
  - "Docker and Docker BuildX installed (Docker version 20.10+)"
  - "Minimum 4GB RAM and 10GB disk space"
---

## Introduction

UV is a blazing-fast Python package manager written in Rust that's revolutionizing Python application development. By integrating UV with Docker, you can create efficient, reproducible Python environments that are portable and optimized for both development and production.

In this guide, we'll explore two primary approaches:

- **Using official UV Docker images**
- **Custom UV integration in your Docker builds**

We'll discuss the pros and cons of each method, best practices, and when to use them. Whether you're building a simple application or deploying a complex, multi-architecture system, this guide has you covered.

## What We're Building

We'll create:

- **Development and production Docker setups using UV**
- **Multi-architecture builds** that work on any machine
- **Efficient caching systems** for faster builds
- **Secure, production-ready configurations**
- **CI/CD pipelines** with testing and deployment strategies

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Two Approaches to Using UV in Docker](#two-approaches-to-using-uv-in-docker)
   - [Approach 1: Using Official UV Docker Images](#approach-1-using-official-uv-docker-images)
   - [Approach 2: Custom UV Integration](#approach-2-custom-uv-integration)
3. [When to Use Each Approach](#when-to-use-each-approach)
4. [Getting Started: Basic UV Setup](#getting-started-basic-uv-setup)
   - [Using Official UV Docker Images](#using-official-uv-docker-images)
   - [Custom UV Integration](#custom-uv-integration)
5. [Development Environment Setup](#development-environment-setup)
6. [Production Environment Setup](#production-environment-setup)
7. [Best Practices](#best-practices)
   - [Security](#security)
   - [Caching](#caching)
   - [Multi-Architecture Support](#multi-architecture-support)
8. [Advanced Topics](#advanced-topics)
   - [Testing Framework Integration](#testing-framework-integration)
   - [Monitoring and Logging](#monitoring-and-logging)
   - [Handling Edge Cases](#handling-edge-cases)
9. [Performance Comparison](#performance-comparison)
10. [Real-World Example: FastAPI Application](#real-world-example-fastapi-application)
11. [Setting Up Multi-Architecture Builds](#setting-up-multi-architecture-builds)
12. [Managing Dependencies](#managing-dependencies)
13. [Working with Private Packages](#working-with-private-packages)
14. [Troubleshooting Guide](#troubleshooting-guide)
15. [Example Repository: `uv-docker-starter`](#example-repository-uv-docker-starter)
16. [Conclusion](#conclusion)

---

## Prerequisites

Before diving in, make sure you have the following:

- **Python 3.13** installed locally.
- **Docker** (version 20.10 or higher) installed. [Installation Guide](https://docs.docker.com/get-docker/)
- **Docker BuildX** installed and enabled. [BuildX Installation Guide](https://docs.docker.com/buildx/working-with-buildx/)
- **Minimum System Requirements**: 4GB RAM, 10GB free disk space.
- Familiarity with command-line operations.

Check your versions:

```bash
docker --version       # Should be 20.10 or higher
docker buildx version  # Should show BuildX version
python --version       # Should be Python 3.13.x
```

---

## Two Approaches to Using UV in Docker

### Approach 1: Using Official UV Docker Images

The simplest way to get started with UV in Docker is by using the official UV Docker images.

**Dockerfile Example:**

```dockerfile
FROM ghcr.io/astral-sh/uv:python3.13-bookworm
COPY . .
RUN uv pip install -r requirements.txt
```

#### Pros:

- **Minimal setup required**
- **Officially maintained images with regular security updates**
- **Guaranteed UV compatibility**
- **Best for simple applications, learning, and prototypes**

#### Cons:

- **Limited optimization options**
- **Larger image sizes**
- **Less control over the Python environment**
- **May include unnecessary dependencies**
- **No multi-stage build benefits**

### Approach 2: Custom UV Integration

For more control and optimization, you can integrate UV into your own Docker images.

**Dockerfile Example:**

```dockerfile
# syntax=docker/dockerfile:1.4

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

# Run as non-root user
RUN useradd -m -s /bin/bash appuser
USER appuser
```

#### Pros:

- **Smaller final image size**
- **Better build caching**
- **Fine-grained control over dependencies**
- **Multi-stage build optimization**
- **Production-ready configuration**
- **Support for complex applications**
- **Better security practices**

#### Cons:

- **More complex setup**
- **Requires Docker expertise**
- **More maintenance responsibility**
- **Longer initial setup time**

---

## When to Use Each Approach

### Use Official UV Docker Images When:

1. **Building simple applications**
2. **Creating proof-of-concept projects**
3. **Learning UV and Docker**
4. **Quick prototyping**
5. **CI/CD testing environments**

### Use Custom UV Integration When:

1. **Building production applications**
2. **Optimizing for size and performance**
3. **Implementing complex deployment strategies**
4. **Requiring multi-architecture support**
5. **Managing multiple environments (development/production)**

---

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

---

## Development Environment Setup

### Official Image Approach

**docker-compose.yml:**

```yaml
services:
  app:
    image: ghcr.io/astral-sh/uv:python3.13-bookworm
    volumes:
      - .:/app
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ports:
      - "8000:8000"
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
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ports:
      - "8000:8000"

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

#### Hot Reloading and Debugging

To enable hot reloading and debugging, consider integrating tools like `watchdog` or `debugpy`.

**Dockerfile.dev (Additions):**

```dockerfile
RUN uv pip install --system watchdog debugpy
```

**docker-compose.yml (Additions):**

```yaml
environment:
  - DEBUG=True
```

---

## Production Environment Setup

### Official Image Approach

**Dockerfile:**

```dockerfile
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

WORKDIR /app
COPY . .
RUN uv pip install --system -r requirements.txt

# Run as non-root user
RUN useradd -m -s /bin/bash appuser
USER appuser

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

# Expose port and set entrypoint
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

---

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

- **Use Minimal Base Images**

  Opt for `slim` or `alpine` images to reduce the attack surface.

  ```dockerfile
  FROM python:3.13-alpine
  ```

### Caching

Use Docker BuildKit cache mounts to speed up dependency installation.

```dockerfile
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install [...]
```

### Multi-Architecture Support

Leverage Docker BuildX for building images that support multiple architectures.

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t myapp:latest \
  --push .
```

### Optimization Techniques

- **Combine RUN Commands**

  Reduce the number of layers in your image.

  ```dockerfile
  RUN apt-get update && apt-get install -y package \
      && rm -rf /var/lib/apt/lists/*
  ```

- **Leverage UV's Parallel Installation**

  UV can install packages in parallel, speeding up the build process.

---

## Advanced Topics

### Testing Framework Integration

Integrate testing tools like Pytest into your CI/CD pipeline to ensure code quality.

**Dockerfile.test:**

```dockerfile
FROM python:3.13-slim-bookworm

# Install test dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/
ENV UV_SYSTEM_PYTHON=1

WORKDIR /app
COPY . .

RUN uv pip install --system -r requirements.txt
RUN uv pip install --system pytest

CMD ["pytest"]
```

**GitHub Actions Workflow Snippet:**

```yaml
- name: Run Tests
  run: docker build -f Dockerfile.test -t myapp-test . && docker run myapp-test
```

### Monitoring and Logging

Set up performance monitoring and centralized logging.

**Docker Compose Configuration:**

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
```

### Handling Edge Cases

#### Air-Gapped Environments

Set up a local Docker registry to mirror images and dependencies.

```bash
docker run -d -p 5000:5000 --restart=always --name registry registry:2
```

Update Docker daemon to use the local registry.

#### System Dependencies

Handle shared libraries and system packages.

```dockerfile
RUN apt-get update && apt-get install -y libpq-dev
```

---

## Performance Comparison

### Build Time (Example Project)

| Approach           | First Build Time | Subsequent Builds (with Cache) |
| ------------------ | ---------------- | ------------------------------ |
| Official Image     | ~2 minutes       | ~2 minutes                     |
| Custom Integration | ~3 minutes       | ~30 seconds                    |

### Image Size (Example Project)

| Approach           | Image Size |
| ------------------ | ---------- |
| Official Image     | ~1.2GB     |
| Custom Integration | ~400MB     |

### Memory Usage at Runtime (Example Project)

| Approach           | Memory Usage |
| ------------------ | ------------ |
| Official Image     | ~500MB       |
| Custom Integration | ~300MB       |

---

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

# Expose port and set entrypoint
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

---

## Setting Up Multi-Architecture Builds

First, create and bootstrap a new BuildX builder.

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

---

## Managing Dependencies

### Using `requirements.txt`

```dockerfile
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system -r requirements.txt
```

### Using `pyproject.toml`

```dockerfile
COPY pyproject.toml uv.lock ./
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

---

## Working with Private Packages

### Using SSH Keys

**Dockerfile:**

```dockerfile
# Assuming you have SSH keys set up
RUN --mount=type=ssh \
    uv pip install --system \
    git+ssh://git@github.com/org/repo.git
```

**Building the Image:**

Run the following command to build the image using the SSH key:

```bash
docker buildx build --ssh default -t myimage .
```

---

### Using Access Tokens

When working with private repositories that require an access token, use Docker secrets to securely pass the token during the build process.

**Dockerfile:**

```dockerfile
RUN --mount=type=secret,id=github_token \
    GITHUB_TOKEN=$(cat /run/secrets/github_token) && \
    uv pip install --system \
    git+https://${GITHUB_TOKEN}@github.com/org/repo.git
```

**Explanation:**

- The `--mount=type=secret,id=github_token` option mounts the secret file at `/run/secrets/github_token`.
- Inside the `RUN` command, the token is read using `cat /run/secrets/github_token` and stored in the `GITHUB_TOKEN` environment variable.
- The `GITHUB_TOKEN` is then used in the `pip install` command to authenticate with GitHub.

**Building the Image:**

```bash
docker buildx build --secret id=github_token,src=path_to_your_github_token_file -t myimage .
```

---

### Alternative Approach Using `requirements.txt`

If you have multiple private packages, you can use a placeholder for the token in your `requirements.txt` file.

**requirements.txt:**

```
git+https://${GITHUB_TOKEN}@github.com/org/private-repo.git
```

**Dockerfile:**

```dockerfile
COPY requirements.txt .
RUN --mount=type=secret,id=github_token \
    GITHUB_TOKEN=$(cat /run/secrets/github_token) && \
    sed "s/\${GITHUB_TOKEN}/${GITHUB_TOKEN}/g" requirements.txt > requirements_resolved.txt && \
    uv pip install --system -r requirements_resolved.txt && \
    rm requirements_resolved.txt
```

**Building the Image:**

```bash
docker buildx build --secret id=github_token,src=path_to_your_github_token_file -t myimage .
```

---

### Key Notes:

1. Replace `path_to_your_github_token_file` with the path to your token file.
2. Ensure `docker buildx` is installed and enabled. If not, follow [Docker Build Documentation](https://docs.docker.com/build/) for setup instructions.
3. If BuildKit is not enabled by default, set `DOCKER_BUILDKIT=1` as an environment variable.

---

This approach ensures secure and efficient builds leveraging BuildKit's features.

## Troubleshooting Guide

### Common Issues

1. **UV Cache Permission Issues**

   **Error Message:**

   ```plaintext
   PermissionError: [Errno 13] Permission denied: '/root/.cache/uv'
   ```

   **Solution:**

   Ensure the cache directory has the correct permissions.

   ```dockerfile
   RUN mkdir -p /root/.cache/uv && chmod 777 /root/.cache/uv
   ```

2. **Platform-Specific Problems**

   **Issue:**

   Missing platform-specific dependencies.

   **Solution:**

   Handle platform-specific dependencies using conditional statements.

   ```dockerfile
   RUN apt-get update && \
       if [ "$(uname -m)" = "x86_64" ]; then \
           apt-get install -y package-amd64; \
       elif [ "$(uname -m)" = "aarch64" ]; then \
           apt-get install -y package-arm64; \
       fi
   ```

3. **Memory Issues**

   **Issue:**

   Builds failing due to insufficient memory.

   **Solution:**

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

### Additional Debugging Tips

- **Enable Verbose Logging**

  Set environment variables to increase logging verbosity.

  ```dockerfile
  ENV UV_LOG_LEVEL=debug
  ```

- **Use Docker Logs**

  ```bash
  docker logs <container_id>
  ```

---

## Example Repository: `uv-docker-starter`

To get hands-on experience with UV and Docker, the [uv-docker-starter repository](https://github.com/loftwah/uv-docker-starter) provides a complete setup, including:

- Pre-configured examples for both **official UV images** and **custom UV integration**.
- A ready-to-use **GitHub Actions workflow** for CI/CD automation.
- Multi-platform build support (`linux/amd64`, `linux/arm64`).
- Integration with testing frameworks and logging tools.

### Clone the Repository

```bash
git clone https://github.com/loftwah/uv-docker-starter.git
cd uv-docker-starter
```

### Repository Structure

```plaintext
uv-docker-starter/
├── README.md               # Guide and setup instructions
├── docker-compose.yml      # Compose configurations for both examples
├── examples/
│   ├── official/           # Example using official UV Docker image
│   │   ├── Dockerfile
│   │   ├── app/
│   │   │   └── main.py
│   │   └── requirements.txt
│   ├── custom/             # Example with custom UV integration
│   │   ├── Dockerfile
│   │   ├── pyproject.toml
│   │   ├── uv.lock
│   │   └── app/
│   │       └── main.py
├── .github/
│   ├── workflows/
│   │   └── build-and-push.yml # CI/CD pipeline for GitHub Actions
```

### Key Components

#### 1. **Official UV Example**

Navigate to the `examples/official` directory for a quick-start example using the official UV Docker image.

**Features**:

- Minimal setup using `ghcr.io/astral-sh/uv`.
- Ideal for learning or quick prototyping.

**How to Run**:

```bash
# Build and run locally
docker build -t uv-official ./examples/official
docker run -p 8000:8000 uv-official
```

#### 2. **Custom UV Example**

For production-ready builds, use the `examples/custom` directory.

**Features**:

- Multi-stage Dockerfile for optimized image size.
- Fine-grained control over Python dependencies.
- Integration with testing and logging.

**How to Run**:

```bash
# Build and run locally
docker build -t uv-custom ./examples/custom
docker run -p 8001:8000 uv-custom
```

### CI/CD Workflow with GitHub Actions

The repository includes a pre-configured **GitHub Actions workflow** located at `.github/workflows/build-and-push.yml`. This automates:

1. **Building multi-platform images** using **Docker BuildX**.
2. **Running tests** to ensure code quality.
3. **Pushing images** to **GitHub Container Registry (GHCR)**.

**Workflow Highlights**:

- Builds and pushes both **official** and **custom** examples.
- Automatically labels container images with metadata for better traceability.
- Integrates testing steps using Pytest.

**Trigger**: The workflow runs on every push to the `main` branch.

**View Workflow**: [build-and-push.yml](https://github.com/loftwah/uv-docker-starter/blob/main/.github/workflows/build-and-push.yml)

### Using the Repository for Your Projects

1. **Clone or Fork** the repository to customize it for your project.
2. **Replace the Example Application Code** in `examples/official/app/` or `examples/custom/app/`.
3. **Modify `requirements.txt` or `pyproject.toml`** as needed.
4. **Update the CI/CD Workflow** to match your repository and image tags.
5. **Integrate Additional Tools** like monitoring, logging, and testing frameworks as per your requirements.

---

## Conclusion

Choosing between the official UV Docker images and custom UV integration depends on your specific needs:

- **Official UV Images**: Ideal for learning, development, and simple applications where ease of setup is a priority.
- **Custom UV Integration**: Suited for production environments, optimization, and complex deployment strategies requiring finer control over the build process.

Start with the official images to get up and running quickly, and consider transitioning to custom integration as your project grows in complexity and demands higher performance and security.

You now have a comprehensive toolkit for building Python applications with UV and Docker. This setup provides:

- **Fast dependency installation**
- **Reproducible builds**
- **Multi-architecture support**
- **Development and production configurations**
- **Best practices for security and efficiency**

Remember to regularly update UV and your dependencies to get the latest improvements and security fixes.

---

## Additional Resources

- **UV Documentation**: [UV Official Docs](https://docs.astral.sh/uv/)
- **Docker Documentation**: [Docker Official Docs](https://docs.docker.com/)
- **Docker BuildX**: [BuildX Documentation](https://docs.docker.com/buildx/working-with-buildx/)
- **Python Best Practices**: [Python Packaging Guide](https://packaging.python.org/en/latest/)

## Acknowledgements

Special thanks to the open-source community for continuously improving tools like UV and Docker, making modern Python development efficient and enjoyable.

---
