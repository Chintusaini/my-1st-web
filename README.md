# Chintu Enterprises - 3D Professional Website

A high-performance, 3D-enabled portfolio and business website for **Chintu Saini**.
This project features a modern, depth-aware interface using **Glassmorphism**, **Parallax effects**, and **3D transforms** to create an engaging user experience.

## 🚀 Features

- **3D Interactive Elements**: Cards and sections react to mouse movement with realistic tilt and depth.
- **Glassmorphism UI**: Modern frosted-glass aesthetic for a premium feel.
- **Admin Panel**: Built-in simple CMS to manage portfolio items, services, and view contact submissions.
- **Dynamic Contact Form**:
  - Sends emails via SMTP (Nodemailer).
  - Saves submissions locally (localStorage) for reliability.
  - Admin dashboard data persistence.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile.

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3 (Advanced custom properties), Vanilla JavaScript.
- **Backend**: Node.js, Express.
- **Email**: Nodemailer.
- **Storage**: Local JSON files (for simplicity and portability).

## 📦 Installation

1.  **Clone the repository** (or unzip the project):
    ```bash
    git clone https://github.com/yourusername/chintu-enterprises.git
    cd chintu-enterprises
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    - Rename `.env.example` to `.env`.
    - Update the `SMTP_*` details if you want email functionality.
    - Set an `ADMIN_KEY` for securing admin uploads (optional).

## 🏃‍♂️ Usage

### Development Mode
Runs the server with hot-reload (requires `nodemon`):
```bash
npm run dev
```

### Production Start
```bash
npm start
```

Visit `http://localhost:3000` to view the site.

### Admin Panel
Visit `http://localhost:3000/admin` to access the CMS.
- **Default Password**: `admin` (Change this in `admin/admin.js` for production safety).

## 📂 Project Structure

```
chintu-enterprises/
├── admin/              # Admin panel (HTML/JS/CSS)
├── uploads/            # User uploaded images
├── server.js           # Express backend
├── index.html          # Main landing page
├── styles.css          # Main site styles
├── package.json        # Dependencies
└── README.md           # Documentation
```

## 📄 License
All rights reserved © Chintu Saini.