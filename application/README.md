# Parking Space Marketplace

Welcome to the **Parking Space Marketplace** repository! This project is a full-stack web application designed to help users find, book, and list parking spaces with ease.

---

## Table of Contents

- [Parking Space Marketplace](#parking-space-marketplace)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
    - [Database Setup](#database-setup)
    - [Running the Application](#running-the-application)
  - [Usage](#usage)
  - [Configuration](#configuration)
  - [Folder Structure](#folder-structure)
  - [Contributing](#contributing)
  - [License](#license)
  - [Credits](#credits)

---

## Overview

Parking Space Marketplace is a platform where users can:

- List their available parking spaces for rent.
- Search for and book parking spaces.
- Manage bookings, payments, and support requests.
- Communicate with other users via messaging.

The project is built with a Next.js frontend and a Django backend, using PostgreSQL for data storage and Docker for deployment.

---

## Features

- User dashboard for renters and owners
- Secure authentication and role-based access
- Real-time messaging and notifications
- Support ticket and roadside assistance system
- Responsive design for desktop and mobile
- Admin panel for managing users and listings

---

## Installation

### Prerequisites

- Node.js (v18+)
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL


### Frontend Setup

```bash
cd application/frontend/about
npm install
```

### Running the Application

```bash
# Start the backend server
cd application/backend
docker compose up -d

# In a new terminal, start the frontend development server
cd application/frontend/about
npm run build

npm run start
```

---

## Usage

1. **Register** for an account as a parking space owner or renter.
2. **List** your parking space with details like location, price, and availability.
3. **Search** for parking spaces based on your preferences.
4. **Book** a parking space and make payments securely.
5. **Manage** your bookings and communicate with other users.

---

## Configuration

- Environment variables are stored in the `.env` file in the backend directory.
- Frontend configuration can be found in `application/frontend/about/.env.local`.

---

## Folder Structure

```
Parking-Space-Marketplace/
├── application/
│   ├── backend/
│   │   ├── manage.py
│   │   ├── docer_composr.yml
│   │   ├── Dockerfile
│   │   └── ...
│   └── frontend/
│       ├── package.json
│       ├── .env.local
│       └── ...
|
└── README.md
```

---

## Contributing

We welcome contributions from everyone!

---

## Credits

- **Next.js** - The React Framework for Production
- **Django** - The Web framework for perfectionists with deadlines
- **PostgreSQL** - The world's most advanced open source relational database
- **Docker** - An open platform for developing, shipping, and running applications

---

**Heads Up!** 🚀 Welcome to the epicenter of our project’s awesomeness! The files in this folder are the building blocks
of something amazing, so treat them with care. And remember, with great power comes great responsibility—if you’re
making changes, make sure they’re worthy of the superhero status you now hold. ⚡️

Oh, and if you see a file doing something unique… it’s not a bug, it’s a feature! 😉
