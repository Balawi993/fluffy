# Fluffly - Modern Email Marketing Platform

![Fluffly Logo](public/vite.svg)

Fluffly is a modern email marketing platform built with React, TypeScript, and Node.js. It provides a clean, intuitive interface for managing contacts, creating email templates, and running marketing campaigns.

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- Heroicons for UI icons

### Backend
- Node.js HTTP server
- Prisma ORM
- PostgreSQL database
- JWT authentication
- bcryptjs for password hashing
- Resend API for email delivery
- Svix for webhook signature verification

## Folder Structure

```
fluffly/
├── src/                      # Frontend source code
│   ├── assets/               # Static assets
│   ├── components/           # Reusable UI components
│   │   └── Layout/           # Layout components (Sidebar, Topbar)
│   ├── lib/                  # Utility functions and API clients
│   └── pages/                # Page components
├── public/                   # Public assets
├── fluffly-backend/          # Backend code
│   ├── prisma/               # Database schema and migrations
│   │   └── schema.prisma     # Prisma schema definition
│   └── basic-server-prisma.js # Main server file
└── .github/                  # GitHub workflows and templates
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (database already configured)

### Frontend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/fluffly.git
   cd fluffly
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`
   ```bash
   cp .env.example .env
   ```

4. Start the development server
   ```bash
   npm run dev
   # or use the batch file
   ./start-frontend.bat
   ```

5. Open your browser at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory
   ```bash
   cd fluffly-backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`
   ```bash
   cp .env.example .env
   ```

4. The database is already configured with Supabase PostgreSQL. The `.env` file should contain:
   ```
   DATABASE_URL="postgresql://postgres.xeoaqmawlxxcgeisjhfo:PQTmUFF5ll7CaVkh@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-fluffly-2024"
   JWT_EXPIRES_IN="7d"
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:5173"
   RESEND_API_KEY="your-resend-api-key"
   RESEND_WEBHOOK_SECRET="your-webhook-signing-secret"
   ```

5. The Prisma schema is already synchronized with the database

6. Start the server
   ```bash
   node basic-server-prisma.js
   # or use the batch file from the root directory
   ./start-backend.bat
   ```

## Database Status

### Current Database Configuration
- **Provider**: Supabase PostgreSQL
- **Status**: ✅ Connected and Working
- **Schema**: Synchronized with Prisma models
- **Connection**: Stable and tested

### Database Models
- **User**: User accounts with authentication
- **Contact**: Email contacts with groups and tags
- **Template**: Email templates with block-based content
- **Campaign**: Email campaigns with tracking
- **SentEmail**: Track sent emails with status
- **EmailEvent**: Track email events (opens, clicks, bounces, etc.)
- **Group**: Contact groups for organization

### Test Data Available
The database contains sample data for testing:
- Test users with authentication
- Sample contacts and groups
- Email templates
- Campaign examples

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Fluffly
VITE_APP_DESCRIPTION="Modern Email Marketing Platform"
```

### Backend (.env)
```
DATABASE_URL="postgresql://postgres.xeoaqmawlxxcgeisjhfo:PQTmUFF5ll7CaVkh@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-fluffly-2024"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
RESEND_API_KEY="your-resend-api-key"
RESEND_WEBHOOK_SECRET="your-webhook-signing-secret"
```

## Resend Webhook Integration

Fluffly integrates with Resend's webhook system to track email events:

1. **Webhook Setup**:
   - Create a webhook endpoint in your Resend dashboard
   - Point it to `https://your-domain.com/api/webhooks/resend`
   - Copy the webhook signing secret to your `.env` file

2. **Supported Events**:
   - `email.sent`: Email was sent
   - `email.delivered`: Email was delivered
   - `email.opened`: Recipient opened the email
   - `email.clicked`: Recipient clicked a link in the email
   - `email.bounced`: Email bounced
   - `email.complained`: Recipient marked as spam

3. **Event Storage**:
   - Events are stored in the `EmailEvent` model
   - Each event is linked to the campaign, user, and contact
   - The sent email status is updated based on the latest event

4. **Testing Webhooks**:
   - Use a tool like ngrok to expose your local server
   - Configure Resend to send webhooks to your ngrok URL
   - Check server logs for webhook processing details

## Deployment Notes

### Frontend Deployment
1. Build the frontend
   ```bash
   npm run build
   ```

2. Deploy the `dist` directory to your static hosting service

### Backend Deployment
1. Set up a PostgreSQL database
2. Configure environment variables for production
3. Deploy the backend to your hosting service
4. Ensure CORS is properly configured to allow requests from your frontend domain
5. Configure Resend webhook URL to point to your production server

## Features

- **User Authentication**: Secure signup and login
- **Contact Management**: Create, view, edit, and delete contacts
- **Email Templates**: Design beautiful email templates with a drag-and-drop editor
- **Campaign Management**: Create and send email campaigns to contact groups
- **Email Analytics**: Track email opens, clicks, and other events via webhooks
- **Responsive Design**: Works on desktop and mobile devices

## How to Contribute

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
