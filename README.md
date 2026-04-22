# Hivon Blogs – AI Powered Blogging Platform

## 🚀 Overview

This project is a full-stack blogging platform built using Next.js and Supabase. It supports role-based access and integrates Google Gemini AI to generate summaries for blog posts automatically.

---

## 🛠 Tech Stack

* Frontend & Backend: Next.js (App Router)
* Database: Supabase
* Authentication: Supabase Auth
* AI Integration: Google Gemini API
* Styling: Tailwind CSS
* Deployment: Vercel

---

## 👥 User Roles

* Viewer: Can read posts and add comments
* Author: Can create and edit their own posts
* Admin: Can edit all posts and monitor comments

---

## ✨ Features

* User authentication (login/signup)
* Role-based access control
* Create blog posts with AI-generated summaries
* Search functionality
* Pagination
* Comment system
* Responsive UI

---

## 🤖 AI Integration

* When a post is created, content is sent to Gemini API
* A ~200-word summary is generated
* Summary is stored in the database
* Displayed on the homepage

---

## 💰 Cost Optimization

* Summary is generated only once during post creation
* Stored in database to avoid repeated API calls
* Reduces token usage and cost

---

## ⚙️ Setup Instructions

### 1. Clone repo

git clone <your-repo-link>

### 2. Install dependencies

npm install

### 3. Add environment variables

Create `.env.local`:

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
GOOGLE_API_KEY=your_google_key

### 4. Run project

npm run dev

---

## 🌐 Deployment

Deployed using Vercel with environment variables configured.

---

## 🧠 Learnings

* Handling Supabase authentication and roles
* Secure API integration using server-side routes
* Managing environment variables safely
* Implementing full-stack features with clean architecture

---
