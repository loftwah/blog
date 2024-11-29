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

FastAPI has become a popular choice for building fast, modern APIs with Python. This enhanced guide takes you through deploying a FastAPI application using the UV package manager, Nginx, and AWS ECS for a production-ready environment. With Docker and Terraform, you'll create a scalable architecture that's robust, efficient, and includes comprehensive monitoring and logging.

We'll use the [uv-fastapi-ecs](https://github.com/loftwah/uv-fastapi-ecs) repository as a template. This repository demonstrates:

- How to build and deploy a FastAPI application with UV.
- Setting up Nginx as a reverse proxy.
- Using Terraform to provision AWS infrastructure.
- Managing container images with AWS ECR.
- Deploying and running containers on ECS.
- Implementing monitoring and logging with CloudWatch.

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

- **Containerization with Docker**:
  - FastAPI and Nginx are packaged into separate containers for modularity and scalability.

- **Infrastructure as Code with Terraform**:
  - Modular Terraform files for provisioning AWS resources like ECS, VPC, and ECR.

- **AWS Native Integration**:
  - Fully integrated with AWS services for container registry, networking, and orchestration.

- **Monitoring and Logging**:
  - CloudWatch dashboards and alarms for comprehensive monitoring.
  - Centralized logging for both FastAPI and Nginx services.

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
│   ├── 4-monitoring/          # Monitoring and logging setup
└── README.md                  # Repository documentation
```

Each component is designed to work independently, making it easy to extend or modify.

---

## Local Development

### Setting Up

1. **Clone the repository**:

   ```bash
   git clone https://github.com/loftwah/uv-fastapi-ecs.git
   cd uv-fastapi-ecs
   ```

2. **Build and start the services**:

   ```bash
   docker compose up --build
   ```

3. **Access the services**:
   - FastAPI: [http://localhost/](http://localhost/)
   - Health Check: [http://localhost/health](http://localhost/health)

### Key Benefits of Local Development Setup

- **Hot Reloading**: Automatically reloads the FastAPI application when code changes.
- **Volume Mounting**: Updates are reflected in real-time during development.
- **Separate Containers**: Isolates concerns by running FastAPI and Nginx in dedicated containers.

---

## Deploying to AWS ECS

### Terraform Modules

The infrastructure is divided into four Terraform modules:

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

4. **Monitoring**:
   - Sets up CloudWatch dashboards and alarms.
   - Configures SNS topics for alert notifications.
   - Centralizes logging for FastAPI and Nginx services.

### Prerequisites

Before you begin, ensure you have:

- AWS CLI installed and configured with appropriate credentials.
- Terraform installed (version 1.0+).
- Docker installed and running.
- An AWS account with permissions to create the required resources.

### Step-by-Step Deployment

#### 1. Deploy the ECR Module

**Navigate to the ECR module directory**:

```bash
cd terraform/1-ecr
```

**Copy and edit the variables file**:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` to match your environment.

**Initialize and apply the Terraform configuration**:

```bash
terraform init
terraform apply
```

#### 2. Build and Push Docker Images

**Return to the project root**:

```bash
cd ../../
```

**Run the build and push script**:

```bash
./build-and-push.sh
```

This script will build the Docker images and push them to the ECR repositories created in the previous step.

#### 3. Deploy the Networking Module

**Navigate to the networking module directory**:

```bash
cd terraform/2-network
```

**Copy and edit the variables file**:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` to match your environment.

**Initialize and apply the Terraform configuration**:

```bash
terraform init
terraform apply
```

#### 4. Deploy the ECS Module

**Navigate to the ECS module directory**:

```bash
cd ../3-ecs
```

**Copy and edit the variables file**:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`, ensuring you provide:

- The VPC ID and subnet IDs from the networking module outputs.
- An SSL certificate ARN for your domain (required for HTTPS).

**Initialize and apply the Terraform configuration**:

```bash
terraform init
terraform apply
```

**Note**: The ECS module depends on outputs from the networking module.

#### 5. Deploy the Monitoring Module

**Navigate to the monitoring module directory**:

```bash
cd ../4-monitoring
```

**Copy and edit the variables file**:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`, ensuring you provide:

- The ECS cluster name and service name from the ECS module outputs.
- An email address for receiving alerts.

**Initialize and apply the Terraform configuration**:

```bash
terraform init
terraform apply
```

#### 6. Retrieve the Application Load Balancer DNS Name

**Navigate back to the ECS module directory**:

```bash
cd ../3-ecs
```

**Retrieve the ALB DNS name**:

```bash
terraform output alb_dns_name
```

**Access the application at the ALB DNS name**.

---

## Monitoring and Logging

### CloudWatch Integration

- **Logs**: FastAPI and Nginx logs are automatically streamed to CloudWatch Logs, allowing centralized access and analysis.
- **Metrics**: ECS metrics like CPU and memory usage are available via CloudWatch and ECS Container Insights.

### CloudWatch Dashboards

A CloudWatch dashboard is set up to visualize key metrics:

- **ECS Cluster Metrics**: CPU and memory utilization of the ECS cluster and service.
- **Application Logs**: Visualize incoming log events for FastAPI and Nginx.

**Accessing the Dashboard**:

- After deploying the monitoring module, retrieve the dashboard URL:

  ```bash
  terraform output dashboard_url
  ```

- Open the URL in your browser to view the dashboard.

### CloudWatch Alarms

- **High CPU Usage Alarm**:
  - An alarm is configured to trigger when CPU utilization exceeds 80%.
  - When triggered, an email notification is sent to the specified email address.

### Setting Up Alerts

- **SNS Topic**:
  - An SNS topic is created to handle alert notifications.
- **Email Subscription**:
  - The email address specified in the `alert_email` variable is subscribed to the SNS topic.
- **Confirm Subscription**:
  - After applying the Terraform configuration, check your email for a subscription confirmation message from AWS SNS.
  - Confirm the subscription to start receiving alerts.

---

## Scaling and Management

### Scaling

- **Adjust Desired Count**:
  - Modify the `service_desired_count` variable in the ECS Terraform module to scale the number of running tasks.
- **Load Balancing**:
  - The Application Load Balancer distributes traffic evenly across tasks.

### Managing ECS Services

- **Force New Deployment**:
  - Use the `force_deploy.sh` script in the ECS module to force a new deployment.

    ```bash
    ./force_deploy.sh
    ```

- **Monitoring Deployment**:
  - Use the `monitor.sh` script to monitor the deployment progress and service health.

    ```bash
    ./monitor.sh
    ```

- **Connecting to Running Tasks**:
  - Use the `connect.sh` script to connect to a running container in your ECS task for debugging purposes.

    ```bash
    ./connect.sh
    ```

---

## Advanced Topics

### Security Best Practices

- **IAM Roles**:
  - ECS tasks use IAM roles with the least privilege necessary to access AWS services.
- **SSL Termination**:
  - Nginx handles SSL certificates, ensuring secure communication.
- **Private Networking**:
  - Tasks run in private subnets, with NAT Gateways for internet access.
- **VPC Endpoints**:
  - Configured for services like ECR, S3, and CloudWatch Logs to ensure secure and efficient communication.

### Blue/Green Deployments

- **ECS Deployment Strategies**:
  - Modify the ECS Terraform module to enable blue/green deployments.
  - Leverage AWS CodeDeploy for seamless updates with minimal downtime.

### CI/CD Pipeline

- **Automate Builds and Deployments**:
  - Use AWS CodePipeline to automate the build, test, and deployment process.
- **Integration with CodeBuild**:
  - Integrate with CodeBuild to run tests and build Docker images before deploying new versions.

---

## Conclusion

The `uv-fastapi-ecs` repository provides everything you need to deploy a scalable, production-ready FastAPI application on AWS. By combining the power of Docker, Terraform, and ECS, and integrating monitoring and logging with CloudWatch, this setup ensures a robust architecture for modern Python development.

Try this out, and feel free to extend it further to suit your needs. If you have questions or want to share your experience, join the discussion in the repository!

---
