# SlackCloneProject

A real-time Slack Clone built using the MERN Stack with authentication, channels, messaging, and Socket.IO integration.

---

# 🚀 Complete Project Setup Guide

## 📌 Step 1: Clone the Repository

Open terminal in VS Code and run:

```bash
git clone https://github.com/skmdsadiq1607/SlackCloneProject.git
```

---

## 📌 Step 2: Open Project Folder

```bash
cd SlackCloneProject
```

---

# 🌿 Branch Workflow

Each teammate must work only on their assigned branch.

## Available Branches

- `main`
- `jashvitha`
- `sashreek`
- `lokesh`
- `tejas`

---

## 📌 Step 3: Switch to Your Branch

### Example for Lokesh

```bash
git checkout lokesh
```

### Example for Tejas

```bash
git checkout tejas
```

### Example for Jashvitha

```bash
git checkout jashvitha
```

### Example for Sashreek

```bash
git checkout sashreek
```

---

# 📦 Install Dependencies

## 📌 Step 4: Install Frontend Packages

```bash
cd client
npm install
```

---

## 📌 Step 5: Install Backend Packages

Open another terminal:

```bash
cd server
npm install
```

---

# 🔐 Environment Variables Setup

## 📌 Step 6: Create `.env` File

Inside the `server` folder create a file named:

```text
.env
```

Add the following:

```env
PORT=5000
MONGO_URI=your_mongodb_url
SECRET_KEY=your_secret_key
CLIENT_URL=http://localhost:3000
```

---

# ▶️ Run the Project

## 📌 Step 7: Start Backend Server

```bash
cd server
npm run dev
```

---

## 📌 Step 8: Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

---

# 🔄 Daily Workflow

## 📌 Step 9: Pull Latest Changes Before Starting Work

```bash
git pull origin main
```

---

## 📌 Step 10: Check Current Branch

```bash
git branch
```

---

## 📌 Step 11: Add Changes

```bash
git add .
```

---

## 📌 Step 12: Commit Changes

```bash
git commit -m "Added new feature"
```

---

## 📌 Step 13: Push Changes

```bash
git push
```

---

# 🛠 Tech Stack

- MongoDB
- Express.js
- React.js
- Node.js
- Socket.IO
- JWT Authentication

---

# ⚠️ Important Rules

- Do NOT push directly to `main`
- Always work on your assigned branch
- Pull latest changes before starting work
- Never upload `.env` file
- Avoid modifying teammate files unnecessarily

---

# 👨‍💻 Contributors

- Jashvitha
- Sashreek
- Lokesh
- Tejas
- Sadiq

---

# 📌 Repository Link

```text
https://github.com/skmdsadiq1607/SlackCloneProject.git
```
