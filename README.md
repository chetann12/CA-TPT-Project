# Client Portal System

A full-stack web application for managing client documents, billing, and profiles using the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- Secure authentication using PAN and OTP
- Document management (view/download PDFs)
- Profile management
- Billing and payment tracking
- Admin dashboard
- File access logging
- User activity monitoring

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Twilio account (for SMS)
- SMTP server (for email)

## Project Structure

```
client-portal/
├── backend/           # Node.js/Express backend
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   ├── utils/        # Utility functions
│   └── uploads/      # File uploads
└── frontend/         # React frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd client-portal
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Configure environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Update the values in `.env` with your configuration

4. Create required directories:
   ```bash
   mkdir -p backend/uploads/documents
   mkdir -p backend/uploads/bills
   ```

5. Start the development servers:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- POST `/api/auth/login` - Login with PAN
- POST `/api/auth/verify-otp` - Verify OTP
- POST `/api/auth/resend-otp` - Resend OTP

### Documents
- GET `/api/documents` - Get user's documents
- GET `/api/documents/:id/download` - Download document
- GET `/api/documents/:id/view` - View document
- POST `/api/documents/upload` - Upload document (admin)
- DELETE `/api/documents/:id` - Delete document (admin)

### Profile
- GET `/api/profile` - Get user profile
- PATCH `/api/profile` - Update profile
- GET `/api/profile/all` - Get all users (admin)
- POST `/api/profile` - Create user (admin)
- PATCH `/api/profile/:id` - Update user (admin)

### Billing
- GET `/api/billing` - Get user's bills
- GET `/api/billing/:id` - Get bill details
- GET `/api/billing/:id/download` - Download bill
- POST `/api/billing` - Create bill (admin)
- PATCH `/api/billing/:id` - Update bill (admin)
- POST `/api/billing/:id/payments` - Add payment (admin)

### Admin
- GET `/api/admin/stats` - Get system statistics
- GET `/api/admin/logs/documents` - Get document access logs
- GET `/api/admin/bills/overdue` - Get overdue bills
- POST `/api/admin/users/deactivate-overdue` - Deactivate users with overdue payments
- GET `/api/admin/users/:id/activity` - Get user activity summary

## Security Features

- OTP-based authentication
- Rate limiting
- File type validation
- Access control
- Activity logging
- Account locking after failed attempts

## License

MIT 