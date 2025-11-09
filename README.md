# Music Streaming Platform - Cloud-Native and Fully Distributed Architecture **Full-Stack + Cloud/DevOps Project**

A production-grade, secure, and fault-tolerant music streaming platform engineered for massive scale. Built with **Node.js**, **React**, **AWS**, **PostgreSQL**, **MongoDB**, **Redis**, and **Kubernetes**, it demonstrates cloud-native microservices, stateless authentication with automatic refresh tokens, and a fully event-driven Pub/Sub architecture.
## Overview

A fully cloud-native, production-grade music streaming platform delivering secure, high-performance, hotlink-proof music streaming at global scale. 
It leverages stateless microservices, **asymmetric authentication** with automatic token refresh, and real-time **Pub/Sub messaging** to ensure seamless responsiveness and reliability. Every service is containerized, independently deployable, and orchestrated via **Kubernetes** with secure **CI/CD pipelines**, providing zero-downtime deployments, fault-tolerance, and enterprise-level resilience.

## Architecture

<img width="1083" height="767" alt="Spotify-architecture" src="https://github.com/user-attachments/assets/90b93305-a4c9-4034-8c4d-490e206999c0" />



| Service | Stack | Function |
|----------|--------|-----------|
| **User Service** | Express + MongoDB + JWT (With refresh token functionality) | Authentication, user profiles, token management |
| **Admin Service** | Express + PostgreSQL | Album/song CRUD, S3 presigned uploads |
| **Song Service** | Fastify + PostgreSQL | Streaming via CloudFront signed URLs |
| **Frontend** | React + Zustand + Tailwind | User interface and media playback |

Additional components: **Redis (Pub/Sub)**, **SQS + Lambda + SES**, **S3 + CloudFront**, and **Kubernetes**.

---

##  Major Design Decisions


### 1. Asymmetric JWT Authentication for Secure Distributed Systems
- Tokens are signed with a private key and verified with a public key, removing the need to share secrets across services.
- Each microservice can independently validate user tokens without depending on a central auth server. Ideal for distributed architectures.
- This makes the system highly scalable, Independent and integration of more microservices becomes seamless.

### 2. AWS SQS + Lambda + SES for Asynchronous Email Processing
- Password reset, verification, and notification emails use a **serverless event-driven pipeline**.  
- **SQS** decouples email handling from API requests, keeping the backend responsive.  
- **Lambda** processes messages on demand and triggers **SES** to send emails.  
- Entire flow is **pay-per-use**, requiring no dedicated mail server and scaling automatically.

### 3. MongoDB for User Service (vs PostgreSQL)
- User data is unstructured and read-heavy (profiles, sessions, tokens).  
- Minimal need for **joins**, which MongoDB avoids efficiently.  

### 4. PostgreSQL for Songs and Albums
- Song and album data require **relationships, constraints, and queries** (joins, sorting, analytics).  
- PostgreSQL ensures strong data integrity and indexing support for relational lookups.


### 5. CloudFront Signed URLs for Secure and Cost-Effective Media Delivery
- Prevents **hotlinking** (unauthorized external playback).  
- Uses **time-limited signed URLs**, ensuring only authenticated requests can stream files.  
- CloudFront caches files globally also CloudFront is cheaper for high-volume media delivery compared to serving directly from S3. 


### 6. CloudFront + S3 for Frontend Hosting
- React app stored in S3 and served through CloudFront.  
- Combines **global caching + TLS** delivery for minimal latency and maximum uptime.  
- Significantly cheaper than running a frontend server — pay only for data transfer.

---

## ☁️ DevOps & Infrastructure

### Kubernetes (EKS/GKE)
- Each service deployed as a **separate Deployment** and **Service**.  
- **Nginx Ingress** handles routing and global TLS termination.  
- **Sealed Secrets** manage sensitive environment variables safely under GitOps.
- Full **HTTPS/TLS** coverage for backend APIs.

### Scaling
- **Horizontal Pod Autoscaler (HPA)** dynamically adjusts replicas based on CPU/memory usage.
- Ensures cost efficiency during low load and elasticity during traffic spikes.

### Helm
- Each service packaged as a **Helm chart** for modular and parameterized deployments.
- Versioned Helm releases simplify rollbacks and CI/CD automation.

---

## CI/CD & GitOps Pipeline

### Flow
1. **GitHub → GitLab Trigger:**  
   Commits pushed to GitHub automatically trigger a GitLab pipeline via webhook.

2. **GitLab Pipeline Steps:**
   - Build and tag Docker images → push to **Dockerhub**.  
   - Run **Trivy** to scan for container vulnerabilities.  
   - Update Helm `values.yaml` with new image tag.  
   - **ArgoCD** detects Helm change and auto-deploys to Kubernetes.

### Tools
- **GitHub Actions:** source trigger.  
- **GitLab CI:** build, test, security scan, deploy.  
- **Trivy:** container security scanner.  
- **Helm:** Kubernetes package management.  
- **ArgoCD:** GitOps delivery and deployment sync.  
- **Dockerhub:** secure container image registry.

### Result
- Full **GitOps-based deployment** with zero-downtime rolling updates.  
- Security built into every stage through vulnerability scanning and version-controlled secrets.

---

## Key Takeaways
- Hotlink-proof, cached, and cost-optimized content delivery using CloudFront signed URLs.  
- Asynchronous, serverless email system built entirely on AWS managed services.  
- End-to-end Kubernetes setup using HPA, Sealed Secrets, Helm, TLS, and ArgoCD for real GitOps automation.

---

## Tech Stack Summary

| Layer | Tools |
|-------|-------|
| **Frontend** | React, Tailwind, Zustand |
| **Backend** | Node.js (Express/Fastify), Prisma |
| **Databases** | PostgreSQL, MongoDB |
| **Cache & Pub/Sub** | Redis |
| **Storage & CDN** | AWS S3 + CloudFront (Signed URLs) |
| **Email & Queues** | AWS SQS, Lambda, SES |
| **Orchestration** | Kubernetes, Helm, HPA, Ingress |
| **Security** | Asymmetric JWT, Sealed Secrets, HTTPS TLS |
| **CI/CD & GitOps** | GitHub Actions, GitLab CI, ArgoCD, Trivy, Dockerhub |

