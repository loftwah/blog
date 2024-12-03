---
title: "Loftwah's Guide to Managing Terraform for AWS ECS Fargate Deployments with HTTPS"
description: "An in-depth guide to setting up and managing Terraform configurations for deploying Docker images on AWS ECS with Fargate, including HTTPS termination at the load balancer for enhanced security and compliance. This guide emphasizes clarity, maintainability, and project-specific customization for effective infrastructure management."
difficulty: "intermediate"
category: "DevOps"
order: 23
heroImage: "/images/quiz/terraform2.png"
prerequisites:
  - "Intermediate understanding of Terraform and AWS services"
  - "Basic familiarity with Docker"
  - "AWS CLI installed and configured"
  - "Terraform installed (version 0.13 or later recommended)"
  - "Docker installed (Docker version 20.10+)"
  - "Minimum 4GB RAM and 10GB disk space"
---

# Loftwah's Guide to Managing Terraform for AWS ECS Fargate Deployments with HTTPS

This comprehensive guide provides a detailed approach to setting up and managing Terraform configurations within repositories for deploying Docker images on AWS ECS with Fargate. It includes HTTPS termination at the Application Load Balancer (ALB), crucial for security compliance standards like SOC 2. The guide emphasizes clarity, maintainability, and project-specific customization, ensuring that team members can understand and work with the infrastructure code effectively.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Workflow Overview](#workflow-overview)
5. [Detailed Steps](#detailed-steps)
   - [Step 1: ECR Repository Setup](#step-1-ecr-repository-setup)
   - [Step 2: Build and Push Docker Image](#step-2-build-and-push-docker-image)
   - [Step 3: Network Infrastructure Setup](#step-3-network-infrastructure-setup)
   - [Step 4: ECS Service Deployment with HTTPS](#step-4-ecs-service-deployment-with-https)
6. [Automation and Monitoring Scripts](#automation-and-monitoring-scripts)
   - [Deployment Scripts](#deployment-scripts)
   - [Monitoring Scripts](#monitoring-scripts)
   - [Connecting to ECS Tasks](#connecting-to-ecs-tasks)
7. [Using Terraform Variables and tfvars Files](#using-terraform-variables-and-tfvars-files)
8. [State Management with Remote Backends](#state-management-with-remote-backends)
9. [Best Practices](#best-practices)
10. [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)
11. [Conclusion](#conclusion)

---

## Introduction

Deploying containerized applications on AWS ECS with Fargate requires careful orchestration of various AWS services. Managing this infrastructure as code using Terraform streamlines the deployment process, promotes consistency, and facilitates collaboration among team members.

This guide presents a practical approach that:

- **Reflects Natural Workflows**: Organizes code to mirror the deployment sequence for better understanding.
- **Enhances Clarity**: Avoids unnecessary abstraction to make the infrastructure code straightforward.
- **Promotes Maintainability**: Ensures the codebase is easy to update, extend, and manage over time.
- **Ensures Security Compliance**: Incorporates HTTPS termination at the load balancer to meet security standards like SOC 2.

By following this guide, you will be able to set up a robust infrastructure for deploying Docker images on AWS ECS with Fargate, using Terraform as the infrastructure-as-code tool, and configure HTTPS for secure communication.

---

## Prerequisites

Before proceeding, ensure you have the following:

- **AWS Account**: With permissions to manage ECR, VPC, ECS, IAM, ACM (AWS Certificate Manager), and other related services.
- **AWS CLI**: Installed and configured with appropriate credentials.
- **Docker**: Installed and configured to build and push images.
- **Terraform**: Installed (version 0.13 or later is recommended).
- **Docker Buildx**: Enabled for multi-architecture builds (comes with Docker Desktop).
- **jq**: Command-line JSON processor (required for some scripts).
- **curl**: For downloading files in the Dockerfile.
- **A Registered Domain**: Recommended for obtaining SSL/TLS certificates. You can use AWS Route 53 or Cloudflare to manage domains.

---

## Project Structure

Organize your repository to reflect the logical steps in the deployment process:

```
project-root/
├── infrastructure/
│   ├── 1-ecr/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terraform.tfvars
│   ├── 2-network/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terraform.tfvars
│   ├── 3-ecs/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars
│   │   └── task-definition.json.tpl
│   └── backend.tf
├── scripts/
│   ├── deploy.sh
│   ├── force-deploy.sh
│   ├── build_and_push.sh
│   ├── monitor.sh
│   ├── monitor-health.sh
│   ├── connect.sh
│   └── README.md
├── docker/
│   └── Dockerfile
├── .gitignore
└── README.md
```

- **infrastructure/**: Contains all Terraform configurations, separated by component.
- **scripts/**: Deployment and monitoring scripts to automate the workflow.
- **docker/**: Dockerfile and related files for building the Docker image.
- **backend.tf**: Configures remote state management.
- **terraform.tfvars**: Variable definitions for Terraform (specific to each environment).
- **task-definition.json.tpl**: Template file for the ECS task definition.
- **README.md**: Documentation and usage instructions.

---

## Workflow Overview

The deployment consists of the following steps:

1. **ECR Repository Creation**: Set up an ECR repository to store Docker images.
2. **Docker Image Build and Push**: Build the Docker image using `docker buildx` for multi-architecture support and push it to ECR.
3. **Network Infrastructure Setup**: Configure VPC, subnets, NAT gateway, and security groups.
4. **ECS Service Deployment with HTTPS**: Deploy the ECS cluster, services, tasks, and Application Load Balancer with HTTPS termination.

Each step is dependent on the previous, ensuring a structured and logical deployment process.

---

## Detailed Steps

### Step 1: ECR Repository Setup

**Directory**: `infrastructure/1-ecr/`

#### Purpose

Set up an Amazon ECR repository to host your Docker images. This repository will be used to store images compatible with multiple architectures (ARM and x86), accommodating developers on different platforms.

#### Terraform Configuration

**main.tf**

```hcl
provider "aws" {
  region = var.aws_region
}

resource "aws_ecr_repository" "app" {
  name                 = var.app_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = var.tags
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = <<EOF
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOF
}
```

**variables.tf**

```hcl
variable "app_name" {
  description = "The name of the application"
  type        = string
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}
```

**outputs.tf**

```hcl
output "repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "registry_id" {
  value = aws_ecr_repository.app.registry_id
}
```

**terraform.tfvars**

```hcl
app_name   = "your-app-name"
aws_region = "us-east-1"
tags = {
  Environment = "dev"
  Project     = "YourProject"
}
```

#### Deployment Commands

```bash
cd infrastructure/1-ecr
terraform init
terraform apply
```

**Explanation**: Running `terraform apply` without specifying variables on the command line uses values from `terraform.tfvars`, promoting consistency and reducing errors.

#### Verifying the ECR Repository

After successful deployment, you can verify the ECR repository creation via the AWS Management Console or AWS CLI:

```bash
aws ecr describe-repositories --repository-names your-app-name --region us-east-1
```

---

### Step 2: Build and Push Docker Image

#### Purpose

Build a Docker image compatible with both ARM and x86 architectures using `docker buildx`, and push it to the ECR repository.

#### Docker Configuration

**Dockerfile**

```dockerfile
# syntax=docker/dockerfile:1.4
FROM python:3.12-slim-bookworm AS base

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    ffmpeg && \
    rm -rf /var/lib/apt/lists/* && \
    curl -sSL https://astral.sh/uv/install.sh | sh

# Add UV to PATH
ENV PATH="/root/.local/bin:$PATH"
ENV UV_SYSTEM_PYTHON=1

# Set working directory
WORKDIR /app

# Copy project files for dependency installation
COPY pyproject.toml .

# Install all dependencies using UV
RUN uv pip install --system -r pyproject.toml

# Copy application files into the container
COPY . .

# Create volume for music storage
VOLUME /loftwahs-jams

# Default command (will be overridden in compose)
CMD ["python", "-m", "bandaid.sync"]
```

**Explanation**:

- **Multi-Architecture Support**: The Dockerfile is optimized for multi-architecture builds using the `syntax=docker/dockerfile:1.4` directive.
- **Use of `uv`**: Utilizes `uv` (a tool for Python project management) for efficient dependency management.
- **Slim Base Image**: Uses `python:3.12-slim-bookworm` for a lightweight image.
- **System Dependencies**: Installs necessary system packages like `curl` and `ffmpeg`.
- **Environment Variables**: Sets up the environment for `uv` and Python.
- **Work Directory**: Sets `/app` as the working directory.
- **Volume**: Creates a volume at `/loftwahs-jams` for persistent storage.

#### Build and Push Commands

```bash
# Navigate to the project root
cd project-root

# Retrieve repository information from Terraform outputs
REPO_URL=$(cd infrastructure/1-ecr && terraform output -raw repository_url)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"

# Authenticate Docker to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Buildx setup (if not already configured)
docker buildx create --use --name multiarch_builder || docker buildx use multiarch_builder

# Build and push multi-architecture image
docker buildx build --platform linux/amd64,linux/arm64 \
  -t $REPO_URL:latest \
  -f docker/Dockerfile \
  --push .
```

**Explanation**:

- **Authentication**: Uses AWS CLI to authenticate Docker to ECR.
- **docker buildx**: Enables building images for multiple architectures.
- **--platform**: Specifies the target architectures (x86_64 and ARM64).
- **--push**: Builds and pushes the image to the specified registry.
- **REPO_URL**: Dynamically retrieved from Terraform outputs to ensure consistency.

---

### Step 3: Network Infrastructure Setup

**Directory**: `infrastructure/2-network/`

#### Purpose

Set up the Virtual Private Cloud (VPC), subnets, route tables, NAT gateway, and security groups necessary for the ECS tasks and load balancer.

#### Terraform Configuration

**main.tf**

```hcl
provider "aws" {
  region = var.aws_region
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = var.tags
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  tags                    = var.tags
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 100)
  availability_zone = var.availability_zones[count.index]
  tags              = var.tags
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = var.tags
}

# NAT Gateway
resource "aws_eip" "nat" {
  vpc  = true
  tags = var.tags
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  tags          = var.tags
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = var.tags
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }
  tags = var.tags
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}
```

**variables.tf**

```hcl
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}
```

**terraform.tfvars**

```hcl
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]
aws_region         = "us-east-1"
tags = {
  Environment = "dev"
  Project     = "YourProject"
}
```

**outputs.tf**

```hcl
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}
```

#### Deployment Commands

```bash
cd infrastructure/2-network
terraform init
terraform apply
```

**Explanation**:

- **Terraform Remote State**: Configure remote state backends in `backend.tf` to enable sharing outputs between different Terraform configurations.
- **Subnets**: Creates both public and private subnets across specified availability zones.
- **Route Tables**: Configures route tables for internet access via the Internet Gateway and NAT Gateway.
- **NAT Gateway**: Essential for Fargate tasks in private subnets to access the internet (e.g., to pull Docker images).

---

### Step 4: ECS Service Deployment with HTTPS

**Directory**: `infrastructure/3-ecs/`

#### Purpose

Deploy the ECS cluster, task definitions, services, and configure the Application Load Balancer (ALB) to terminate HTTPS connections using SSL/TLS certificates. This enhances security by encrypting traffic between clients and the load balancer, meeting compliance requirements like SOC 2.

#### Understanding `task-definition.json.tpl`

The `task-definition.json.tpl` file is a template for the ECS task definition in JSON format. Terraform uses this template to create the actual task definition by replacing variables with their corresponding values. This approach allows for greater flexibility and easier management of task definitions, especially when dealing with complex configurations.

**Example of `task-definition.json.tpl`**:

```json
{
  "family": "${app_name}-task",
  "networkMode": "awsvpc",
  "executionRoleArn": "${ecs_exec_role_arn}",
  "taskRoleArn": "${ecs_task_role_arn}",
  "containerDefinitions": [
    {
      "name": "${app_name}-container",
      "image": "${image_url}",
      "cpu": 256,
      "memory": 512,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/${app_name}",
          "awslogs-region": "${aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512"
}
```

**Explanation**:

- **Variables**: Placeholders like `${app_name}` are replaced with actual values when Terraform processes the template.
- **Container Definitions**: Defines the container settings, including image, CPU, memory, port mappings, and logging configuration.
- **Roles**: Specifies IAM roles for task execution and task role.
- **Network Mode**: Set to `awsvpc` for Fargate tasks.
- **Compatibility**: Specifies that the task requires Fargate compatibility.

#### Terraform Configuration

In `main.tf`, reference the `task-definition.json.tpl` using the `templatefile` function:

**main.tf**

```hcl
provider "aws" {
  region = var.aws_region
}

# Load outputs from previous steps
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "your-terraform-state-bucket"
    key    = "infrastructure/2-network/terraform.tfstate"
    region = var.aws_region
  }
}

# IAM Roles
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.app_name}-ecs-exec-role"

  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role.json

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  ]

  tags = var.tags
}

data "aws_iam_policy_document" "ecs_task_execution_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_role" {
  name               = "${var.app_name}-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_role.json
  tags               = var.tags
}

data "aws_iam_policy_document" "ecs_task_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# Load task definition template
locals {
  task_definition = templatefile("${path.module}/task-definition.json.tpl", {
    app_name          = var.app_name
    image_url         = var.image_url
    aws_region        = var.aws_region
    ecs_task_role_arn = aws_iam_role.ecs_task_role.arn
    ecs_exec_role_arn = aws_iam_role.ecs_task_execution_role.arn
  })
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster"
  tags = var.tags
}

# ECS Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = "${var.app_name}-task"
  container_definitions    = local.task_definition
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
}

# ECS Service
resource "aws_ecs_service" "app" {
  name            = "${var.app_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets         = data.terraform_remote_state.network.outputs.private_subnet_ids
    security_groups = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "${var.app_name}-container"
    container_port   = 80
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  lifecycle {
    ignore_changes = [task_definition]
  }

  tags = var.tags
}

# Security Groups
resource "aws_security_group" "ecs" {
  name        = "${var.app_name}-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = data.terraform_remote_state.network.outputs.vpc_id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_security_group" "alb" {
  name        = "${var.app_name}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = data.terraform_remote_state.network.outputs.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

# Application Load Balancer
resource "aws_lb" "alb" {
  name            = "${var.app_name}-alb"
  load_balancer_type = "application"
  subnets         = data.terraform_remote_state.network.outputs.public_subnet_ids
  security_groups = [aws_security_group.alb.id]
  tags            = var.tags
}

# Target Group
resource "aws_lb_target_group" "app" {
  name        = "${var.app_name}-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = data.terraform_remote_state.network.outputs.vpc_id
  target_type = "ip"
  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
  tags = var.tags
}

# Listener for HTTPS
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificates      = [{
    certificate_arn = aws_acm_certificate.cert.arn
  }]

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# Listener for HTTP (Redirect to HTTPS)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      protocol   = "HTTPS"
      port       = "443"
      status_code = "HTTP_301"
    }
  }
}

# ACM Certificate
resource "aws_acm_certificate" "cert" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = var.tags
}

# Route 53 Zone (If using Route 53)
data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

# DNS Validation Record (If using Route 53)
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 300
}

# Certificate Validation
resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# Outputs
output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.app.name
}

output "aws_region" {
  value = var.aws_region
}
```

**variables.tf**

```hcl
variable "app_name" {
  description = "The name of the application"
  type        = string
}

variable "image_url" {
  description = "The Docker image URL in ECR"
  type        = string
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
}

variable "domain_name" {
  description = "The domain name for SSL certificate"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}
```

**terraform.tfvars**

```hcl
app_name   = "your-app-name"
image_url  = "your-account-id.dkr.ecr.us-east-1.amazonaws.com/your-app-name:latest"
aws_region = "us-east-1"
domain_name = "yourdomain.com"
tags = {
  Environment = "dev"
  Project     = "YourProject"
}
```

**Explanation**:

- **Template Variables**: Variables used in the template are passed to `templatefile` for rendering.
- **Container Definitions**: The rendered JSON from the template is used in the ECS task definition resource.
- **IAM Roles**: Defined for ECS task execution and task role with necessary permissions.
- **ALB and HTTPS Configuration**: Sets up the ALB listeners for HTTPS and redirects HTTP to HTTPS.
- **ACM Certificate**: Requests a certificate and automates DNS validation using Route 53.

#### Obtaining SSL/TLS Certificates with AWS Certificate Manager (ACM)

To enable HTTPS on the ALB, you need an SSL/TLS certificate. AWS Certificate Manager (ACM) allows you to provision certificates for free. There are two types:

- **Public Certificates**: For use with public domains you own.
- **Private Certificates**: For internal applications within a VPC (requires AWS Private CA).

**Note**: You must own or control the domain to validate and issue a public SSL/TLS certificate.

##### Steps to Request a Certificate in ACM

1. **Navigate to ACM in the AWS Console**.
2. **Request a Public Certificate**.
3. **Enter Your Domain Name(s)**:
   - For example, `yourdomain.com` and `www.yourdomain.com`.
4. **Select Validation Method**:
   - **DNS Validation** (recommended): You need to add a CNAME record to your domain's DNS.
5. **Add Tags** (optional).
6. **Review and Request**.
7. **Validate the Domain**:
   - **If Using DNS Validation**:
     - **For AWS Route 53 Users**: ACM can add the DNS record automatically.
     - **For Cloudflare or Other DNS Providers**: You need to manually add the provided CNAME record to your DNS configuration or automate it using Terraform.

Once validated, the certificate status will change to "Issued".

#### Terraform Configuration

You can automate the certificate request and DNS validation using Terraform. The configuration differs slightly depending on whether you use AWS Route 53 or Cloudflare to manage your DNS records.

**Choose the appropriate configuration based on your DNS provider.**

---

#### Terraform Configuration for AWS Route 53 Users

[The configuration provided in the previous section applies here.]

---

#### Terraform Configuration for Cloudflare Users

[If using Cloudflare, replace the DNS validation part with the Cloudflare configuration as shown in previous sections.]

---

#### Deployment Commands

```bash
cd infrastructure/3-ecs
terraform init
terraform apply
```

**Important**: The ACM certificate may take several minutes to be issued after DNS validation records are in place. You may need to run `terraform apply` again once the certificate is validated.

#### Verifying HTTPS Setup

- **Access the Application via HTTPS**: Navigate to `https://yourdomain.com` in your browser.
- **Check the SSL Certificate**: Ensure the certificate is valid and issued by Amazon.
- **Test HTTP to HTTPS Redirection**: Access `http://yourdomain.com` and verify it redirects to HTTPS.

---

## Automation and Monitoring Scripts

To enhance deployment efficiency and monitor your ECS services effectively, utilize the following scripts located in the `scripts/` directory.

### Deployment Scripts

#### deploy.sh

**Purpose**: Orchestrates the entire deployment process by executing Terraform commands in the correct order.

**Script Content**:

```bash
#!/bin/bash
# deploy.sh - Orchestrate the Terraform deployment steps

set -e

echo "Starting deployment..."

# Step 1: ECR
echo "Deploying ECR..."
cd ../infrastructure/1-ecr
terraform init -input=false
terraform apply -auto-approve

# Step 2: Build and Push Docker Image
echo "Building and pushing Docker image..."
cd ../../scripts
chmod +x build_and_push.sh
./build_and_push.sh

# Step 3: Network Infrastructure
echo "Deploying Network Infrastructure..."
cd ../infrastructure/2-network
terraform init -input=false
terraform apply -auto-approve

# Step 4: ECS Service
echo "Deploying ECS Service..."
cd ../3-ecs
terraform init -input=false
terraform apply -auto-approve

echo "Deployment completed successfully."
```

**Usage**:

```bash
cd scripts
chmod +x deploy.sh
./deploy.sh
```

#### build_and_push.sh

**Purpose**: Automates the build and push process of the Docker image to ECR.

**Script Content**:

```bash
#!/bin/bash
# build_and_push.sh - Build and push Docker image to ECR

set -e

# Retrieve repository information from Terraform outputs
REPO_URL=$(cd ../infrastructure/1-ecr && terraform output -raw repository_url)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"

# Authenticate Docker to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Buildx setup (if not already configured)
docker buildx create --use --name multiarch_builder || docker buildx use multiarch_builder

# Build and push multi-architecture image
docker buildx build --platform linux/amd64,linux/arm64 \
  -t $REPO_URL:latest \
  -f docker/Dockerfile \
  --push .
```

**Usage**:

```bash
cd scripts
chmod +x build_and_push.sh
./build_and_push.sh
```

### Monitoring Scripts

#### monitor.sh

**Purpose**: Monitors ECS task health and streams logs in real-time. This script helps in observing the task's behavior and health status during deployment and operation.

**Script Content**:

```bash
#!/bin/bash
# monitor.sh - Monitor ECS task health and logs in real-time

# Get variables from Terraform outputs
CLUSTER_NAME=$(terraform -chdir=../infrastructure/3-ecs output -raw ecs_cluster_name)
SERVICE_NAME=$(terraform -chdir=../infrastructure/3-ecs output -raw ecs_service_name)
REGION=$(terraform -chdir=../infrastructure/3-ecs output -raw aws_region 2>/dev/null || echo "us-east-1")

# Get the task ID
TASK_ID=$(aws ecs list-tasks \
  --cluster "$CLUSTER_NAME" \
  --service-name "$SERVICE_NAME" \
  --region "$REGION" \
  --output text \
  --query 'taskArns[0]' | cut -d'/' -f3)

if [ -z "$TASK_ID" ]; then
  echo "No running tasks found!"
  exit 1
fi

echo "Monitoring ECS task and logs:"
echo "Region:  $REGION"
echo "Cluster: $CLUSTER_NAME"
echo "Service: $SERVICE_NAME"
echo "Task:    $TASK_ID"
echo "Press Ctrl+C to stop monitoring."
echo ""

# Timestamp function
timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}

# Monitor task health and stream logs
{
  # Background process: stream logs
  aws logs tail "/ecs/$SERVICE_NAME" --region "$REGION" --follow --format short &
  LOG_PID=$!

  # Main loop: monitor task health
  while true; do
    STATUS=$(aws ecs describe-tasks \
      --cluster "$CLUSTER_NAME" \
      --tasks "$TASK_ID" \
      --region "$REGION" \
      --query 'tasks[0].containers[0].{health:healthStatus,status:lastStatus}' \
      --output json)

    HEALTH=$(echo "$STATUS" | jq -r '.health')
    CONTAINER_STATUS=$(echo "$STATUS" | jq -r '.status')

    echo "[$(timestamp)] Health: $HEALTH, Container Status: $CONTAINER_STATUS"

    sleep 5
  done
} || {
  # Kill log tail process if the script exits
  kill $LOG_PID
}
```

**Usage**:

```bash
cd scripts
chmod +x monitor.sh
./monitor.sh
```

#### monitor-health.sh

**Purpose**: Specifically monitors the health status of the ECS task without streaming logs. Useful for a quick health check.

**Script Content**:

```bash
#!/bin/bash
# monitor-health.sh - Monitor ECS task health

CLUSTER_NAME=$(terraform -chdir=../infrastructure/3-ecs output -raw ecs_cluster_name)
SERVICE_NAME=$(terraform -chdir=../infrastructure/3-ecs output -raw ecs_service_name)
REGION=$(terraform -chdir=../infrastructure/3-ecs output -raw aws_region 2>/dev/null || echo "us-east-1")

# Get the task ID
TASK_ID=$(aws ecs list-tasks \
  --cluster "$CLUSTER_NAME" \
  --service-name "$SERVICE_NAME" \
  --region "$REGION" \
  --output text \
  --query 'taskArns[0]' | cut -d'/' -f3)

if [ -z "$TASK_ID" ]; then
  echo "No running tasks found!"
  exit 1
fi

echo "Monitoring health check status for:"
echo "Region:  $REGION"
echo "Cluster: $CLUSTER_NAME"
echo "Task:    $TASK_ID"
echo "Press Ctrl+C to stop monitoring"
echo ""

timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}

while true; do
  STATUS=$(aws ecs describe-tasks \
    --cluster "$CLUSTER_NAME" \
    --tasks "$TASK_ID" \
    --region "$REGION" \
    --query 'tasks[0].containers[0].{health:healthStatus,status:lastStatus}' \
    --output json)

  HEALTH=$(echo "$STATUS" | jq -r '.health')
  CONTAINER_STATUS=$(echo "$STATUS" | jq -r '.status')

  echo "[$(timestamp)] Health: $HEALTH, Container Status: $CONTAINER_STATUS"

  sleep 5
done
```

**Usage**:

```bash
cd scripts
chmod +x monitor-health.sh
./monitor-health.sh
```

### Connecting to ECS Tasks

#### connect.sh

**Purpose**: Allows you to connect to a running ECS task using AWS ECS Execute Command. This is helpful for debugging or inspecting the container environment.

**Prerequisites**:

- The ECS task definition must have `enable_execute_command` set to `true`.
- The IAM user or role must have the necessary permissions.

**Script Content**:

```bash
#!/bin/bash
# connect.sh - Connect to ECS task

CLUSTER_NAME=$(terraform -chdir=../infrastructure/3-ecs output -raw ecs_cluster_name)
SERVICE_NAME=$(terraform -chdir=../infrastructure/3-ecs output -raw ecs_service_name)
REGION=$(terraform -chdir=../infrastructure/3-ecs output -raw aws_region 2>/dev/null || echo "us-east-1")

TASK_ID=$(aws ecs list-tasks \
  --cluster "$CLUSTER_NAME" \
  --service-name "$SERVICE_NAME" \
  --region "$REGION" \
  --output text \
  --query 'taskArns[0]' | cut -d'/' -f3)

if [ -z "$TASK_ID" ]; then
  echo "No running tasks found!"
  exit 1
fi

echo "Region: $REGION"
echo "Cluster: $CLUSTER_NAME"
echo "Service: $SERVICE_NAME"
echo "Connecting to task: $TASK_ID"
echo "Use 'exit' to disconnect"
echo ""

aws ecs execute-command \
  --cluster "$CLUSTER_NAME" \
  --task "$TASK_ID" \
  --container "${app_name}-container" \
  --command "/bin/bash" \
  --region "$REGION" \
  --interactive
```

**Note**: Replace `"${app_name}-container"` with the actual name of your container defined in the task definition.

**Usage**:

```bash
cd scripts
chmod +x connect.sh
./connect.sh
```

---

## Using Terraform Variables and tfvars Files

- **Variables**: Defined in `variables.tf`, they allow parameterization of the Terraform code, making it reusable and configurable.
- **tfvars Files**: `terraform.tfvars` files provide values for variables, promoting consistency across environments (e.g., dev, staging, prod).
- **Best Practice**: Avoid passing variables via the command line to prevent potential security issues and ensure repeatable deployments.

**Example**:

```hcl
variable "app_name" {
  description = "The name of the application"
  type        = string
}

# In terraform.tfvars
app_name = "my-app"
```

---

## State Management with Remote Backends

- **Purpose**: Remote backends (like S3) allow sharing of Terraform state files among team members, with state locking to prevent concurrent modifications.
- **Configuration**: Defined in `backend.tf` files. Ensure the backend configuration is consistent across all components.

**backend.tf**:

```hcl
terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket"
    key            = "infrastructure/3-ecs/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "your-lock-table"
    encrypt        = true
  }
}
```

- **Security**: Use encryption and appropriate IAM policies to secure state files.
- **State Locking**: Use DynamoDB table for state locking to prevent concurrent state modifications.

---

## Best Practices

1. **Clarity Over Abstraction**: Organize Terraform code to reflect the deployment workflow, avoiding unnecessary modules that may obscure understanding.
2. **Use `docker buildx` for Multi-Architecture Support**: Accommodates developers on different platforms (ARM Macs, Windows PCs).
3. **Consistent Variable Management**: Use `terraform.tfvars` files for variable values, ensuring consistency and reducing errors.
4. **Remote State Management**: Use remote backends for state files to enable collaboration and maintain state consistency.
5. **Security Best Practices**:
   - **Encrypt Traffic**: Terminate HTTPS at the load balancer to encrypt data in transit.
   - **Restrict Security Group Rules**: Allow only necessary traffic.
   - **Use IAM Roles with Least Privilege**: Grant minimal permissions required.
   - **Secure Remote State Files**: Encrypt and restrict access.
6. **Automation**: Use scripts to orchestrate the deployment process, ensuring steps are executed in the correct order.
7. **Monitoring and Logging**: Implement monitoring scripts to track the health and performance of ECS tasks.
8. **Documentation**: Maintain comprehensive documentation and comments within the code for clarity.
9. **Version Control**: Keep all infrastructure code and scripts under version control (e.g., Git) for change tracking and collaboration.
10. **Environment Separation**: Use separate Terraform workspaces or state files for different environments (dev, staging, prod).

---

## Common Issues and Troubleshooting

1. **Docker Image Not Found**:

   - **Cause**: The ECS task cannot find the Docker image in ECR.
   - **Solution**:
     - Ensure the image is correctly tagged and pushed to ECR.
     - Verify the image URI used in the task definition matches the ECR repository URI.
     - Check AWS permissions for ECR access.

2. **NAT Gateway Issues**:

   - **Cause**: Fargate tasks cannot access the internet to pull images or send outbound traffic.
   - **Solution**:
     - Ensure that the NAT Gateway is properly configured and associated with the correct route tables.
     - Verify that the private subnets have routes to the NAT Gateway.

3. **Security Group Misconfigurations**:

   - **Cause**: Network traffic is being blocked due to restrictive security group rules.
   - **Solution**:
     - Check that security groups allow necessary traffic between the ALB and ECS tasks.
     - Ensure that the ALB security group allows inbound traffic on port 443 (and port 80 if redirecting HTTP to HTTPS).

4. **IAM Permissions**:

   - **Cause**: ECS tasks lack permissions to access required AWS services.
   - **Solution**:
     - Ensure the `AmazonECSTaskExecutionRolePolicy` is attached to the execution role.
     - Verify IAM policies and roles are correctly configured.

5. **Subnet Configuration**:

   - **Cause**: ECS tasks or ALB are in the wrong subnets.
   - **Solution**:
     - Confirm that the correct subnet IDs are used in the ECS service network configuration.
     - Private subnets should be used for ECS tasks, and public subnets for the ALB.

6. **Remote State Access Issues**:

   - **Cause**: Terraform cannot access the remote state files.
   - **Solution**:
     - Verify that Terraform has access to the remote backend (check IAM permissions).
     - Ensure the state file paths and bucket names are correct in the `backend` configuration.

7. **ECS Task Health Issues**:

   - **Cause**: ECS tasks are unhealthy or not running.
   - **Solution**:
     - Use `monitor.sh` or `monitor-health.sh` scripts to check the health status of ECS tasks.
     - Check the container logs for errors using the monitoring scripts.

8. **Connectivity Problems**:

   - **Cause**: Unable to connect to ECS tasks for debugging.
   - **Solution**:
     - Use the `connect.sh` script to execute commands inside the running container.
     - Ensure that the ECS Exec feature is enabled and IAM permissions are correctly set.

9. **Terraform State Locking Issues**:

   - **Cause**: State file is locked by another process.
   - **Solution**:
     - Wait for the other process to complete.
     - If the lock is stale, manually remove it from the DynamoDB lock table.

10. **Certificate Validation Issues**:

    - **Cause**: ACM certificate not issued due to failed domain validation.
    - **Solution**:
      - Verify DNS validation records are correctly created and propagated.
      - Ensure the domain name in ACM matches your actual domain.
      - Check for typos in the domain name.
      - Use DNS tools to verify that the CNAME records exist.

11. **HTTPS Not Working**:

    - **Cause**: HTTPS listener misconfiguration or certificate issues.
    - **Solution**:
      - Confirm that the ALB has a listener on port 443 with the correct SSL certificate.
      - Ensure the security group allows inbound traffic on port 443.
      - Check that the SSL certificate is valid and not expired.
      - Verify that the target group health checks are passing.

12. **HTTP to HTTPS Redirection Fails**:

    - **Cause**: Incorrect redirection configuration.
    - **Solution**:
      - Ensure the ALB listener on port 80 is configured to redirect to HTTPS.
      - Verify that the listener rules are correctly set.

---

## Conclusion

This comprehensive guide provides a detailed approach to managing Terraform configurations for deploying Docker images on AWS ECS with Fargate, including configuring HTTPS termination at the load balancer. By incorporating HTTPS, you enhance the security of your application, meet compliance requirements like SOC 2, and protect data in transit.

By organizing code to mirror the deployment process, utilizing advanced Docker build techniques, and incorporating automation and monitoring scripts, teams can achieve:

- **Maintainability**: Code that's easy to understand and update.
- **Flexibility**: Accommodating different development environments and architectures.
- **Security Compliance**: Ensuring data is encrypted in transit with HTTPS.
- **Collaboration**: Shared state management and consistent variable usage.
- **Operational Excellence**: Efficient deployment, monitoring, and troubleshooting capabilities.

**Remember**: The key is to balance clarity with efficiency, tailoring the approach to your organization's specific needs and workflows. Utilize the provided scripts to automate and streamline your deployment and monitoring processes, ensuring a robust, secure, and reliable infrastructure.

---

By including HTTPS termination at the load balancer, this guide now addresses the requirement for SOC 2 compliance by ensuring all client-server communications are encrypted. Whether you manage your DNS records with AWS Route 53 or Cloudflare, this guide provides the necessary Terraform configurations to automate SSL/TLS certificate provisioning and domain validation.

If you do not own a domain, consider acquiring one to enable HTTPS with a valid SSL/TLS certificate from ACM. While it's technically possible to use self-signed certificates or the default certificate provided by AWS, these approaches are not suitable for production environments due to security warnings and compliance issues.

If owning a domain is not feasible, for internal applications, you could use AWS Private Certificate Authority (Private CA) to issue certificates within your organization, but this requires additional AWS services and may have associated costs.

---
