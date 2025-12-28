# 🌍 RescueLink – Disaster Help Coordination Platform

RescueLink is a real-time full-stack web application designed to connect disaster victims, volunteers, and NGOs. It prioritizes urgent requests using AI-driven classification and facilitates rapid response.

## 🚀 Features

- **Role-Based Access**: Specialized dashboards for Victims, Volunteers, and NGOs.
- **Real-Time Mapping**: Live Mapbox visualization of request locations (Red involved critical, Orange high, etc.).
- **AI Urgency Classification**: NLP analysis of request descriptions to auto-prioritize critical emergencies.
- **Live Updates**: Socket.IO integration for instant alerts without page refreshes.
- **Offline-First Design**: Responsive UI ready for mobile use in low-bandwidth areas (PWA ready).

## 🛠 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Mapbox GL JS
- **Backend**: Node.js, Express, MongoDB, Socket.IO
- **AI**: Natural NLP library for keyword-based classification

## 🏃‍♂️ How to Run

### Prerequisites
- Node.js installed
- MongoDB running locally or a valid connection URI

### 1. Setup Backend
```bash
cd server
npm install
npm run seed  # (Optional) Populates DB with demo data
npm start
```
Server runs on `http://localhost:5000`

### 2. Setup Frontend
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`

## 🧪 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Victim** | `victim@test.com` | `password` |
| **Volunteer** | `volunteer@test.com` | `password` |
| **NGO** | `ngo@test.com` | `password` |

## 🏗 Architecture

[Client (React)] <--> [API / Socket.IO] <--> [Node.js Server] <--> [MongoDB]
                                                   |
                                            [AI Classifier]

## 📸 Screenshots

*(Add screenshots here after running)*
