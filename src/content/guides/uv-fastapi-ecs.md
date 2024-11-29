---
title: "Deploying FastAPI with UV, Nginx, and AWS ECS: A Step-by-Step Guide"
description: "Learn how to deploy a FastAPI application using UV, Nginx, and AWS ECS. This guide walks you through a complete infrastructure setup with Docker, Terraform, and ECS for a scalable and production-ready deployment."
difficulty: "intermediate"
category: "DevOps"
order: 22
heroImage: "/images/fastapi.jpg"
prerequisites:
  - "Intermediate understanding of Python development (Python 3.13 recommended)"
  - "Basic familiarity with Docker and AWS ECS"
  - "Docker installed (Docker version 20.10+)"
  - "Terraform installed (Terraform version 1.0+)"
  - "AWS CLI installed and configured"
  - "Minimum 4GB RAM and 10GB disk space"
---

## Introduction

FastAPI has become a popular choice for building fast, modern APIs with Python. This guide takes you through deploying a FastAPI application using the UV package manager, Nginx, and AWS ECS for a production-ready environment. With Docker and Terraform, you'll create a scalable architecture that's both robust and efficient.

We'll use the [uv-fastapi-ecs](https://github.com/loftwah/uv-fastapi-ecs) repository as a template. This repository demonstrates:

- How to build and deploy a FastAPI application with UV.
- Setting up Nginx as a reverse proxy.
- Using Terraform to provision AWS infrastructure.
- Managing container images with AWS ECR.
- Deploying and running containers on ECS.

---

## Repository Overview

The `uv-fastapi-ecs` repository provides a well-structured starting point for deploying FastAPI applications. Here's a breakdown of what it offers:

### Key Features

- **FastAPI Application**:

  - Includes health check endpoints for monitoring.
  - Simple architecture that can be extended to meet business requirements.

- **Nginx Reverse Proxy**:

  - Acts as a gateway, forwarding requests to FastAPI and managing SSL termination.

- **UV Package Manager**:

  - Ensures fast and reliable dependency installation, leveraging modern Python development practices.

- **Containerisation with Docker**:

  - FastAPI and Nginx are packaged into separate containers for modularity and scalability.

- **Infrastructure as Code with Terraform**:

  - Modular Terraform files for provisioning AWS resources like ECS, VPC, and ECR.

- **AWS Native Integration**:
  - Fully integrated with AWS services for container registry, networking, and orchestration.

### Repository Structure

```plaintext
.
├── app/
│   └── main.py                # FastAPI application
├── nginx/
│   ├── nginx.conf.ecs         # Nginx config for ECS
│   └── nginx.conf.local       # Nginx config for local development
├── Dockerfile                 # FastAPI Dockerfile
├── Dockerfile.local           # Nginx Dockerfile for local dev
├── Dockerfile.nginx           # Nginx Dockerfile for ECS
├── docker-compose.yml         # Local development setup
├── terraform/                 # Infrastructure as code for AWS ECS
│   ├── 1-ecr/                 # ECR repositories
│   ├── 2-network/             # VPC and networking
│   ├── 3-ecs/                 # ECS cluster and services
└── README.md                  # Repository documentation
```

Each component is designed to work independently, making it easy to extend or modify.

---

## Local Development

### Setting Up

1. Clone the repository:

   ```bash
   git clone https://github.com/loftwah/uv-fastapi-ecs.git
   cd uv-fastapi-ecs
   ```

2. Build and start the services:

   ```bash
   docker compose up --build
   ```

3. Access the services:
   - FastAPI: [http://localhost/](http://localhost/)
   - Health Check: [http://localhost/health](http://localhost/health)

### Key Benefits of Local Development Setup

- **Hot Reloading**: Automatically reloads the FastAPI application when code changes.
- **Volume Mounting**: Updates are reflected in real-time during development.
- **Separate Containers**: Isolates concerns by running FastAPI and Nginx in dedicated containers.

---

## Deploying to AWS ECS

### Terraform Modules

The infrastructure is divided into three Terraform modules:

1. **ECR (Elastic Container Registry)**:

   - Creates repositories for FastAPI and Nginx images.
   - Lifecycle policies ensure only the latest images are retained.

2. **Networking**:

   - Creates a VPC with public and private subnets.
   - Configures Internet and NAT Gateways for outbound traffic.
   - Provides secure networking for ECS tasks.

3. **ECS (Elastic Container Service)**:
   - Deploys FastAPI and Nginx containers on Fargate.
   - Configures an Application Load Balancer (ALB) to route traffic.
   - Enables monitoring and logging with CloudWatch.

### Step-by-Step Deployment

1. Navigate to the Terraform directory:

   ```bash
   cd terraform
   ```

2. Deploy the ECR module:

   ```bash
   cd 1-ecr
   terraform init
   terraform apply
   ```

3. Build and push the Docker images:

   ```bash
   ./build-and-push.sh
   ```

4. Deploy the networking module:

   ```bash
   cd ../2-network
   terraform init
   terraform apply
   ```

5. Deploy the ECS module:

   ```bash
   cd ../3-ecs
   terraform init
   terraform apply
   ```

6. Retrieve the ALB DNS name:

   ```bash
   terraform output alb_dns_name
   ```

7. Access the application at the ALB DNS name.

---

## Monitoring and Scaling

### CloudWatch Integration

- Logs for FastAPI and Nginx are automatically streamed to CloudWatch.
- Metrics like CPU and memory usage are available via ECS Container Insights.

### Scaling

- Adjust the `desired_count` variable in the ECS Terraform module to scale the number of running tasks.
- Use the ALB target group to distribute traffic evenly across tasks.

---

## Advanced Topics

### Security Best Practices

- **IAM Roles**:
  - ECS tasks use IAM roles for restricted access to AWS services.
- **SSL Termination**:
  - Nginx handles SSL certificates, ensuring secure communication.
- **Private Networking**:
  - Tasks run in private subnets, with NAT Gateways for internet access.

### Blue/Green Deployments

- Modify the ECS Terraform module to enable blue/green deployments.
- Leverage CodeDeploy for seamless updates with minimal downtime.

### CI/CD Pipeline

- Use AWS CodePipeline to automate builds, tests, and deployments.
- Integrate with CodeBuild for running tests before deploying new images.

---

## Conclusion

The `uv-fastapi-ecs` repository provides everything you need to deploy a scalable, production-ready FastAPI application on AWS. By combining the power of Docker, Terraform, and ECS, this setup ensures a robust architecture for modern Python development.

Try this out, and feel free to extend it further to suit your needs. If you have questions or want to share your experience, join the discussion in the repository!

---
