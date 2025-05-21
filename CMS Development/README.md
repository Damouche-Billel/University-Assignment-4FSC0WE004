# Fennec FC Content Management System

A custom Content Management System (CMS) for Fennec FC, a fictional football club. The CMS allows administrators and editors to manage website content including news articles, fixtures, merchandise, and user accounts.

## Features

- **Authentication System**
  - User registration with email verification
  - Secure login with password hashing
  - Password reset functionality
  - Role-based access control (Admin & Editor roles)

- **Dashboard**
  - Overview of site statistics
  - Recent activity tracking
  - Quick access to common actions

- **News Management**
  - Create, read, update, delete (CRUD) news articles
  - Categorization of articles
  - Draft, published, and archived states
  - Rich text editor for content
  - Image uploads for featured images

- **Fixtures Management**
  - Add and manage upcoming fixtures
  - Update match results
  - Track match details (location, date, time, competition)
  - Ticket availability and linking

- **Merchandise Management**
  - Manage merchandise catalog
  - Categorize products
  - Track inventory
  - Product images
  - Featured products

- **User Management (Admin only)**
  - Add, edit, and remove users
  - Assign user roles
  - View user activity

- **Profile Management**
  - Update personal details
  - Change password

## Technology Stack

- **Frontend**
  - HTML5, CSS3, JavaScript
  - Responsive design for mobile and desktop
  - Custom animations and UI components

- **Backend**
  - Node.js & Express.js
  - MongoDB with Mongoose
  - RESTful API architecture

- **Security**
  - JWT authentication
  - Password hashing with bcrypt
  - CORS protection
  - Input sanitization
  - Middleware-based authorization

## Installation

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Setup Instructions

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/fennec-fc-cms.git
   cd fennec-fc-cms