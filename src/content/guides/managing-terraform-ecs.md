---
title: "Loftwah's Guide to Managing Terraform for AWS ECS Fargate Deployments"
description: "A detailed approach to setting up and managing Terraform configurations for deploying Docker images on AWS ECS with Fargate. This guide emphasises clarity, maintainability, and project-specific customisation for effective infrastructure management."
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

# Loftwah's Guide to Managing Terraform for AWS ECS Fargate Deployments

This guide provides a detailed approach to setting up and managing Terraform configurations within repositories for deploying Docker images on AWS ECS with Fargate. It emphasizes clarity, maintainability, and project-specific customization, ensuring that team members can understand and work with the infrastructure code effectively.

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
   - [Step 4: ECS Service Deployment](#step-4-ecs-service-deployment)
6. [Using Terraform Variables and tfvars Files](#using-terraform-variables-and-tfvars-files)
7. [State Management with Remote Backends](#state-management-with-remote-backends)
8. [Best Practices](#best-practices)
9. [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)
10. [Conclusion](#conclusion)

---

## Introduction

Deploying containerized applications on AWS ECS with Fargate requires careful orchestration of various AWS services. Managing this infrastructure as code using Terraform streamlines the deployment process, promotes consistency, and facilitates collaboration.

This guide presents a practical approach that:

- **Reflects Natural Workflows**: Organizes code to mirror the deployment sequence.
- **Enhances Clarity**: Avoids unnecessary abstraction for better understanding.
- **Promotes Maintainability**: Ensures code is easy to update and manage over time.

---

## Prerequisites

Before proceeding, ensure you have the following:

- **AWS Account**: With permissions to manage ECR, VPC, ECS, IAM, and other related services.
- **AWS CLI**: Installed and configured with appropriate credentials.
- **Docker**: Installed and configured to build and push images.
- **Terraform**: Installed (version 0.13 or later is recommended).
- **Docker Buildx**: Enabled for multi-architecture builds (comes with Docker Desktop).

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
│   └── deploy.sh
├── docker/
│   └── Dockerfile
├── .gitignore
└── README.md
```

- **infrastructure/**: Contains all Terraform configurations, separated by component.
- **scripts/**: Deployment scripts to automate the workflow.
- **docker/**: Dockerfile and related files for building the Docker image.
- **backend.tf**: Configures remote state management.
- **terraform.tfvars**: Variable definitions for Terraform (specific to each environment).
- **README.md**: Documentation and usage instructions.

---

## Workflow Overview

The deployment consists of the following steps:

1. **ECR Repository Creation**: Set up an ECR repository to store Docker images.
2. **Docker Image Build and Push**: Build the Docker image using `docker buildx` for multi-architecture support and push it to ECR.
3. **Network Infrastructure Setup**: Configure VPC, subnets, NAT gateway, and security groups.
4. **ECS Service Deployment**: Deploy the ECS cluster, services, tasks, and load balancer.

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

---

### Step 2: Build and Push Docker Image

#### Purpose

Build a Docker image compatible with both ARM and x86 architectures using `docker buildx`, and push it to the ECR repository.

#### Docker Configuration

**Dockerfile**

```dockerfile
# Use multi-architecture base image
FROM --platform=$BUILDPLATFORM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

CMD ["python", "app.py"]
```

#### Build and Push Commands

```bash
# Navigate to the project root
cd project-root

# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com

# Buildx setup (if not already configured)
docker buildx create --use --name multiarch_builder

# Build and push multi-architecture image
docker buildx build --platform linux/amd64,linux/arm64 \
  -t <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/your-app-name:latest \
  -f docker/Dockerfile \
  --push .
```

**Explanation**:

- **docker buildx**: Enables building images for multiple architectures.
- **--platform**: Specifies the target architectures (x86_64 and ARM64).
- **--push**: Builds and pushes the image to the specified registry.

---

### Step 3: Network Infrastructure Setup

**Directory**: `infrastructure/2-network/`

#### Purpose

Set up the VPC, subnets, route tables, NAT gateway, and security groups necessary for the ECS tasks and load balancer.

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
  vpc = true
  tags = var.tags
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  tags          = var.tags
}

# Route Tables and Associations
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

#### State Management

To enable remote state sharing between steps, configure a remote backend in `backend.tf` at the root of the `infrastructure/` directory.

**backend.tf**

```hcl
terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}
```

**Explanation**:

- Using a remote backend (e.g., S3) allows multiple team members to share and lock state files, preventing conflicts.
- Adjust the `bucket`, `key`, and `region` to match your AWS environment.

#### Deployment Commands

```bash
cd infrastructure/2-network
terraform init
terraform apply
```

---

### Step 4: ECS Service Deployment

**Directory**: `infrastructure/3-ecs/`

#### Purpose

Deploy the ECS cluster, task definitions, services, and Application Load Balancer.

#### Terraform Configuration

**main.tf**

```hcl
provider "aws" {
  region = var.aws_region
}

# Data Sources for Remote State
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "your-terraform-state-bucket"
    key    = "infrastructure/2-network/terraform.tfstate"
    region = var.aws_region
  }
}

data "terraform_remote_state" "ecr" {
  backend = "s3"
  config = {
    bucket = "your-terraform-state-bucket"
    key    = "infrastructure/1-ecr/terraform.tfstate"
    region = var.aws_region
  }
}

# Security Groups
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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_security_group" "ecs_tasks" {
  name        = "${var.app_name}-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = data.terraform_remote_state.network.outputs.vpc_id

  ingress {
    from_port       = var.container_port
    to_port         = var.container_port
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

# Load Balancer
resource "aws_lb" "alb" {
  name               = "${var.app_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.terraform_remote_state.network.outputs.public_subnet_ids
  tags               = var.tags
}

resource "aws_lb_target_group" "tg" {
  name        = "${var.app_name}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = data.terraform_remote_state.network.outputs.vpc_id
  target_type = "ip"

  health_check {
    path                = var.health_check_path
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 5
    matcher             = "200-399"
  }

  tags = var.tags
}

resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}

# IAM Roles
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.app_name}-execution-role"

  assume_role_policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Effect": "Allow",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster"
  tags = var.tags
}

# Log Group
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.app_name}"
  retention_in_days = 7
  tags              = var.tags
}

# Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = "${var.app_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = templatefile("task-definition.json.tpl", {
    app_name        = var.app_name
    image           = "${data.terraform_remote_state.ecr.outputs.repository_url}:latest"
    container_port  = var.container_port
    log_group_name  = aws_cloudwatch_log_group.app.name
    aws_region      = var.aws_region
  })

  tags = var.tags
}

# ECS Service
resource "aws_ecs_service" "app" {
  name            = "${var.app_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = data.terraform_remote_state.network.outputs.private_subnet_ids
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.tg.arn
    container_name   = var.app_name
    container_port   = var.container_port
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  depends_on = [aws_lb_listener.listener]

  tags = var.tags
}
```

**variables.tf**

```hcl
variable "app_name" {
  description = "The name of the application"
  type        = string
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
}

variable "cpu" {
  description = "CPU units for the task (256, 512, 1024, etc.)"
  type        = string
}

variable "memory" {
  description = "Memory (in MiB) for the task (512, 1024, 2048, etc.)"
  type        = string
}

variable "desired_count" {
  description = "Desired number of tasks"
  type        = number
}

variable "health_check_path" {
  description = "Path for the ALB health check"
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

**terraform.tfvars**

```hcl
app_name          = "your-app-name"
container_port    = 8080
cpu               = "256"
memory            = "512"
desired_count     = 1
health_check_path = "/health"
aws_region        = "us-east-1"
tags = {
  Environment = "dev"
  Project     = "YourProject"
}
```

**task-definition.json.tpl**

```json
[
  {
    "name": "${app_name}",
    "image": "${image}",
    "cpu": ${cpu},
    "memory": ${memory},
    "essential": true,
    "portMappings": [
      {
        "containerPort": ${container_port},
        "protocol": "tcp"
      }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${log_group_name}",
        "awslogs-region": "${aws_region}",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }
]
```

#### Deployment Commands

```bash
cd infrastructure/3-ecs
terraform init
terraform apply
```

**Explanation**: Terraform uses the variables defined in `terraform.tfvars`. The use of remote state data sources ensures that the ECS configuration correctly references outputs from the ECR and network configurations.

---

## Using Terraform Variables and tfvars Files

- **Variables**: Defined in `variables.tf`, they allow parameterization of the Terraform code.
- **tfvars Files**: `terraform.tfvars` files provide values for variables, promoting consistency across environments.
- **Best Practice**: Avoid passing variables via the command line to prevent potential security issues and ensure repeatable deployments.

---

## State Management with Remote Backends

- **Purpose**: Remote backends (like S3) allow sharing of Terraform state files among team members, with state locking to prevent concurrent modifications.
- **Configuration**: Defined in `backend.tf` files. Ensure the backend configuration is consistent across all components.
- **Security**: Use encryption and appropriate IAM policies to secure state files.

---

## Best Practices

1. **Clarity Over Abstraction**: Organize Terraform code to reflect the deployment workflow, avoiding unnecessary modules.
2. **Use `docker buildx` for Multi-Architecture Support**: Accommodates developers on different platforms (ARM Macs, Windows PCs).
3. **Consistent Variable Management**: Use `terraform.tfvars` files for variable values, ensuring consistency and reducing errors.
4. **Remote State Management**: Use remote backends for state files to enable collaboration and maintain state consistency.
5. **Security Best Practices**:
   - Restrict security group ingress and egress rules.
   - Use IAM roles with least privilege.
   - Secure remote state files.
6. **Automation**: Use scripts to orchestrate the deployment process, ensuring steps are executed in the correct order.
7. **Documentation**: Maintain comprehensive documentation and comments within the code for clarity.

---

## Common Issues and Troubleshooting

1. **Docker Image Not Found**:

   - Ensure the image is correctly tagged and pushed to ECR.
   - Verify the image URI used in the task definition matches the ECR repository URI.

2. **NAT Gateway Issues**:

   - Fargate tasks in private subnets require a NAT Gateway to access the internet for pulling images.
   - Verify that the NAT Gateway is properly configured and associated with the correct route tables.

3. **Security Group Misconfigurations**:

   - Check that security groups allow necessary traffic between the ALB and ECS tasks.
   - Ensure that the ALB security group allows inbound traffic on port 80 (or 443 for HTTPS).

4. **IAM Permissions**:

   - The ECS task execution role must have permissions to access ECR and CloudWatch Logs.
   - Ensure the `AmazonECSTaskExecutionRolePolicy` is attached to the execution role.

5. **Subnet Configuration**:

   - Confirm that the correct subnet IDs are used in the ECS service network configuration.
   - Private subnets should be used for ECS tasks, and public subnets for the ALB.

6. **Remote State Access Issues**:
   - Verify that Terraform has access to the remote backend (check IAM permissions).
   - Ensure the state file paths and bucket names are correct in the `backend` configuration.

---

## Conclusion

This guide provides a comprehensive approach to managing Terraform configurations for deploying Docker images on AWS ECS with Fargate. By organizing code to mirror the deployment process and using tools like `docker buildx` and remote state backends, teams can achieve:

- **Maintainability**: Code that's easy to understand and update.
- **Flexibility**: Accommodating different development environments and architectures.
- **Collaboration**: Shared state management and consistent variable usage.

**Remember**: The key is to balance clarity with efficiency, tailoring the approach to your organization's specific needs and workflows.

---
