# FlowerShop - Hybrid Cloud E-Commerce Platform

![Vue.js](https://img.shields.io/badge/Vue.js_3-Composition_API-4FC08D?style=for-the-badge&logo=vuedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-Enterprise_Core-6DB33F?style=for-the-badge&logo=springboot)
![AWS Hybrid](https://img.shields.io/badge/AWS-Hybrid_Architecture-232F3E?style=for-the-badge&logo=amazon-aws)

> **A full-stack e-commerce solution demonstrating Enterprise Hybrid Cloud Architecture.**
> Integrating a Spring Boot Monolith (EC2) for core transactional logic with AWS Serverless (Lambda) for edge computing and identity management.

## 🔗 Live Demo
* **Frontend:** [https://your-vercel-link.app](https://your-vercel-link.app)
* **Backend:** Hosted on AWS (Hybrid EC2 + Lambda)

---

## 🏗️ Architecture Design

### 1. Hybrid Cloud Strategy
This project implements a hybrid approach to balance **transactional stability** and **operational efficiency**.

| Component | Technology | Hosting | Rationale |
| :--- | :--- | :--- | :--- |
| **Core Business** | Java Spring Boot | **AWS EC2** | Handling complex transactions (Orders, Inventory) requiring strong ACID compliance and persistent connections. |
| **Identity & Auth** | AWS Cognito | **Managed** | Secure implementation of SRP protocol; offloading credential storage risks. |
| **Ops Triggers** | Node.js | **AWS Lambda** | Event-driven tasks (e.g., Auto-assigning 'Customer' role upon email verification) to reduce idle compute costs. |
| **Frontend** | Vue 3 + TS | **Vercel** | Static asset distribution via Global CDN. |

### 2. Codebase Structure (Clean Architecture)

Both Frontend and Backend adhere to **Clean Architecture** principles to ensure separation of concerns, testability, and maintainability.

#### 🟢 Frontend Architecture (Vue 3 + TypeScript)
Strict separation between UI components and business logic.

```text
src/
├── 🔵 domain/            # Pure Business Logic (Framework Independent)
│   ├── interfaces/       # Type definitions & Ports
│   ├── models/           # Data entities
│   └── use-cases/        # Application-specific business rules
│
├── 🟠 infrastructure/    # External Implementations
│   ├── api/              # Axios configuration & Endpoints
│   └── repositories/     # Concrete implementations of data fetching
│
└── 🟢 presentation/      # UI Layer (Vue.js)
    ├── components/       # Reusable UI atoms/molecules
    ├── views/            # Page layouts
    ├── hooks/            # Composable logic
    ├── router/           # Navigation configuration
    └── store/            # State Management (Pinia)

```

#### 🔵 Backend Architecture (Spring Boot)

Organized by layers to decouple the domain from the web and persistence frameworks.

```text
src/main/java/com/backend/flowershop/
├── 🟤 application/       # Orchestration Layer
│   ├── dto/              # Data Transfer Objects (Request/Response)
│   ├── port/             # Input/Output Ports (Interfaces)
│   └── service/          # Service implementations
│
├── 🔵 domain/            # Core Business Layer
│   ├── enums/            # Business constants
│   ├── model/            # JPA Entities / Domain Objects
│   └── repository/       # Repository Interfaces
│
└── 🟠 infrastructure/    # Adapters Layer
    ├── external/aws/     # AWS SDK Integrations (S3, Cognito)
    ├── persistence/      # Spring Data JPA Repositories
    ├── security/         # Spring Security Configuration
    └── web/              # REST Controllers

```

---

## 🚀 Key Features

### User & Identity Management

* **Event-Driven Registration:** Custom "Star-Bond" flow using AWS Cognito triggers.
* **RBAC (Role-Based Access Control):**
* `CUSTOMER`: Browse, Add to Cart, Checkout.
* `SELLER`: Manage Inventory, View Dashboard.
* `ADMIN`: System oversight.


* **Security:** JWT-based authentication validated via Spring Security.

### B2B2C Business Logic

* **Merchant Lifecycle:** Users can apply to become sellers (KYC flow); Admins approve/reject applications.
* **Product Management:** Sellers can upload products with images stored in **AWS S3**.
* **Order Processing:** Full checkout lifecycle including inventory deduction and order status updates.

---

## 📸 Project Showcase

### Registration Flow (Event-Driven)

User verification triggers an AWS Lambda function to automatically assign permissions.
| Signal Sent (OTP) | Bond Established | Lambda Logic |
| :---: | :---: | :---: |
| <img src="./assets/image_9064d5.jpg" width="250" /> | <img src="./assets/image_906418.png" width="250" /> | <img src="./assets/image_904e6d.png" width="350" /> |

### Merchant Dashboard

Dedicated interface for sellers to manage business operations.

### Product Catalog

Dynamic filtering and categorization backed by MySQL and S3.

---

## 🛠️ Tech Stack

* **Frontend:** Vue 3 (Script Setup), TypeScript, Tailwind CSS, Pinia.
* **Backend:** Java 21, Spring Boot 3, Maven.
* **Database:** MySQL 8.0 (AWS RDS).
* **Cloud Services:**
* **Compute:** AWS EC2 (Core App), AWS Lambda (Triggers).
* **Storage:** AWS S3 (Assets).
* **Identity:** AWS Cognito.
* **Networking:** AWS API Gateway.



---

## 🔧 Installation & Setup

### Prerequisites

* Java JDK 21
* Node.js v18+
* MySQL Server

### 1. Frontend Setup

```bash
cd flower-shop-frontend
npm install
# Configure .env with your backend URL
npm run dev

```

### 2. Backend Setup

1. Configure `application.properties` with your MySQL and AWS Credentials.
2. Build and Run:

```bash
mvn clean install
java -jar target/flower-shop.jar

```

---

## 👨‍💻 Author

**Lu Yee Chen**

* **Role:** Full Stack Cloud Developer
* **GitHub:** [@LuYeeChen1](https://www.google.com/search?q=https://github.com/LuYeeChen1)
* **Email:** luyeechen03@gmail.com
