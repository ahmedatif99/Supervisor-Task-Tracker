# 📊 Supervisor Task & Performance Tracking System

A centralized platform built with **React** and **Appwrite** designed for supervisors to log hourly activities and for administrators to monitor productivity through real-time analytics.

---

## 🚀 Project Overview
The goal of this project is to bridge the gap between daily operations and performance evaluations. Supervisors use a mobile-responsive interface to log tasks, while Admins access a data-driven dashboard to rank performance and export reports.

## 🛠 Tech Stack
* **Frontend:** React.js (Vite)
* **Backend:** Appwrite (Authentication, Databases, and User Prefs)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React

---

## 👥 User Roles & Access

| Role           | Permissions                                                           |
| :------------- | :-------------------------------------------------------------------- |
| **Supervisor** | Log hourly tasks, view personal task history, and manage profile.     |
| **Admin**      | Access Performance Dashboard, view/filter all data, and manage users. |

---

## 📋 Functional Requirements

### 1. Supervisor Module (Data Entry)
* **Hourly Task Form:** * Date Picker (defaulted to current date).
    * Time Range ("From" and "To" pickers).
    * Task Description & Category.
* **Submission History:** Personal log to track daily activity.

### 2. Admin Module (Dashboard & Analytics)
* **Performance Ranking:** A "Leaderboard" ranking supervisors by task quantity.
* **Metrics:** Daily, Weekly, and Monthly task totals.
* **Filtering:** Filter by Date Range, Supervisor Name, or Department.
* **Export:** Generate CSV/PDF reports for evaluations.

### 3. Evaluation Logic
* **Ranking Algorithm:** $$Rank = \sum(\text{Task Count})$$ within the filtered timeframe.
* **Visual Tracking:** Progress bars comparing actual work against "Daily Goals."

---

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ahmedatif99/supervisor-insight](https://github.com/ahmedatif99/supervisor-insight)