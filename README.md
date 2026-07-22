# 🌿 Seasonal Hobby Hub

> A distraction-free, high-performance web application designed to help multi-passionate users manage, rotate through diverse hobbies, and overcome decision paralysis.
> 
> 

---

## 🌟 Overview

**Seasonal Hobby Hub** helps you organize your hobbies into manageable seasonal rotations, log your activity, and overcome decision paralysis with the assistance of an embedded AI advisor named **Stella**. Built with Next.js, Supabase, and OpenRouter, the application provides cloud persistence, secure authentication, and AI-driven planning.

---

## ✨ Features

* **Distraction-Free Dashboard:** Clean interface designed for simple rotation tracking and hobby management.


* **AI Advisor (Stella):** Powered by OpenRouter (`poolside/laguna-xs-2.1`) to deliver personalized hobby planning and decision support.


* **Activity & Rotation Tracking:** Record activity logs and manage active versus paused hobbies.


* **Backend Security:** PostgreSQL backend with custom enums, performance indices, and Row Level Security (RLS) policies.



---
-

## 🛠️ Tech Stack

* **Frontend:** Next.js


* **Database & Authentication:** Supabase (PostgreSQL with RLS)


* **AI Model Gateway:** OpenRouter using `poolside/laguna-xs-2.1`


---

## 🗄️ Database Schema

The database utilizes PostgreSQL tables equipped with enums and performance indices:

* `hobbies`: Manages user hobby profiles, statuses, and rotation details.


* `activity_logs`: Tracks user sessions, time spent, and activity logs.



---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have Node.js (v18+) and npm/pnpm installed on your machine.

### 2. Installation

Clone the repository and install the project dependencies:

```bash
git clone https://github.com/your-username/seasonal-hobby-hub.git
cd seasonal-hobby-hub
npm install

```

### 3. Environment Variables

Create a `.env` (or `.env.local`) file in the root directory and configure your environment variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenRouter AI Credentials
OPENROUTER_API_KEY=your_openrouter_api_key

```

> ⚠️ **Note:** Keep your `.env` file listed in `.gitignore` to avoid exposing private credentials.

### 4. Running Locally

Start the development server:

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---
