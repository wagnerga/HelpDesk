# HelpDesk 🧑‍💻

This document outlines the prerequisites and installation steps required to set up and run the HelpDesk application on a Windows environment.

---

## Table of Contents

- [Prerequisites](#prerequisites)
  - [Install .NET 9 SDK](#1-install-net-9-sdk)
  - [Install Node.js (LTS Version)](#2-install-nodejs-lts-version)
  - [Add OpenSSL to System PATH](#3-add-openssl-to-system-path)
  - [Install PostgreSQL](#4-install-postgresql)
  - [Set the PGPASSWORD Environment Variable](#5-set-the-pgpassword-environment-variable)
- [Installation](#installation)
  - [Run install.bat in Command Prompt](#6-run-installbat-in-command-prompt)
- [Summary](#summary)
- [Technical Design Overview](#technical-design-overview)
  - [Architecture Summary](#architecture-summary)
  - [Design Decisions](#design-decisions)
  - [Security and Scalability](#security-and-scalability)

---

## Prerequisites

### 1. Install .NET 9 SDK

1. Visit the [.NET 9.0 download page](https://dotnet.microsoft.com/en-us/download/dotnet/9.0).
2. Under the **SDK** section, download the installer for the `x64` version.
3. Run the installer and follow the on-screen instructions. Default settings are recommended.

---

### 2. Install Node.js (LTS Version)

Node.js is required to run the background service and manage dependencies.

1. Go to the [Node.js website](https://nodejs.org/).
2. Download the version labeled **LTS**.
3. Run the installer and accept the default settings. This will install both Node.js and **npm**.

**Verify installation:**

```bash
node -v
npm -v
```

---

### 3. Add OpenSSL to System PATH

OpenSSL is required for generating security keys and certificates.

Run the following command in Command Prompt or PowerShell:

```bash
setx PATH "%PATH%;C:\Program Files\Git\usr\bin" /m
```

---

### 4. Install PostgreSQL

PostgreSQL is the database used by HelpDesk.

1. Visit the [PostgreSQL download page](https://www.postgresql.org/download/windows/).
2. Click **Download the installer** and choose the latest version.
3. Run the installer and:
   - Set a strong password for the `postgres` superuser.
   - Accept default components (server, pgAdmin 4, command-line tools).
   - Leave the default port as **5432**.

After installation, verify using **pgAdmin 4**.

---

### 5. Set the `PGPASSWORD` Environment Variable

```bash
setx PGPASSWORD "[YOUR_POSTGRES_PASSWORD]" /m
```

> Note: This change won't affect the current terminal session. Restart your terminal or Visual Studio to apply it.

---

## Installation

### 6. Run `install.bat` in Command Prompt

This script performs the full installation process:

- Publishes binaries to `C:\build\windows\HelpDesk`
- Moves the build to `C:\HelpDesk`
- Installs IIS
- Imports the localhost certificate
- Creates the `HelpDeskUI` site
- Sets up HTTPS bindings

```bash
cd path\to\your\cloned\repository\HelpDesk\HelpDeskInstall
install.bat win-x64 Debug Development
```

> Note: `install.bat` internally calls `setup.ps1` to complete IIS configuration and certificate binding.

---

## Summary

Once all steps are complete, your HelpDesk application will be installed and running locally on Windows.

- Access the frontend: `https://localhost:7000`

---

## Technical Design Overview

### Architecture Summary

HelpDesk consists of five core components:

- **Frontend**: Built with [Next.js](https://nextjs.org/)
- **Backend API**: Developed in [.NET Core](https://dotnet.microsoft.com/)
- **Background Service**: Powered by [Node.js](https://nodejs.org/)
- **Background Worker**: Developed in [.NET Core](https://dotnet.microsoft.com/)
- **Database**: Hosted on [PostgreSQL](https://www.postgresql.org/)

Each component is independently deployable and optimized for Windows-based infrastructure.

---

### Design Decisions

#### Windows-Based Hosting
- Ensures compatibility with enterprise tooling and .NET Core
- Simplifies deployment of mixed tech stacks (.NET + Node.js)

#### Next.js Frontend
- Supports static and server-side rendering
- Delivers fast, SEO-friendly pages
- Integrates with backend APIs and WebSocket services

#### .NET Core API
- Provides secure, scalable REST endpoints
- Separates business logic from presentation and real-time layers

#### Node.js Background Service
- Listens for PostgreSQL `LISTEN/NOTIFY` triggers
- Emits real-time messages via WebSocket (Socket.IO)
- Improves scalability by decoupling real-time logic

#### .NET Core Worker
- Ensures Node.JS Background Service is running

#### PostgreSQL Database
- Reliable, ACID-compliant, and feature-rich
- Supports asynchronous notifications
- Secured with role-based access and encryption

---

### Security and Scalability

- HTTPS enforced across all services
- Secrets and environment variables stored securely
- Database access restricted to trusted services
- Architecture supports horizontal scaling and service isolation