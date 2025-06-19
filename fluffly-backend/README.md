# Fluffly Backend API

A Node.js + Express + PostgreSQL + Prisma backend API for the Fluffly email marketing platform.

## 🚀 Features

- **Authentication**: JWT-based authentication with signup/login
- **User Management**: Secure user registration and profile management
- **Contacts**: Full CRUD operations for contact management
- **Templates**: Email template creation and management
- **Campaigns**: Campaign creation, management, and sending
- **Security**: JWT tokens, password hashing, input validation
- **Database**: PostgreSQL with Prisma ORM

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## 🛠️ Installation

1. **Clone and setup**
   ```bash
   cd fluffly-backend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/fluffly_db?schema=public"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"

   # Server
   PORT=5000
   NODE_ENV=development

   # CORS
   FRONTEND_URL="http://localhost:5173"
   ```

3. **Database Setup**
   ```bash
   # Push schema to database
   npm run db:push

   # Or run migrations (for production)
   npm run db:migrate
   ```

4. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

## 🏃‍♂️ Running the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All API endpoints (except auth routes) require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

#### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "createdAt": "2023-12-23T12:00:00.000Z"
    },
    "token": "jwt-token"
  }
}
```

#### POST /auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token"
  }
}
```

#### GET /auth/me
Get current user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "createdAt": "2023-12-23T12:00:00.000Z",
      "updatedAt": "2023-12-23T12:00:00.000Z"
    }
  }
}
```

### Contacts

#### GET /contacts
Get all contacts with pagination and search.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email
- `group` (optional): Filter by group

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "uuid",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "tags": "vip,customer",
        "group": "Newsletter",
        "createdAt": "2023-12-23T12:00:00.000Z",
        "updatedAt": "2023-12-23T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### POST /contacts
Create a new contact.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "tags": "vip,customer",
  "group": "Newsletter"
}
```

#### PUT /contacts/:id
Update an existing contact.

#### DELETE /contacts/:id
Delete a contact.

### Templates

#### GET /templates
Get all templates with pagination and search.

#### POST /templates
Create a new email template.

**Request Body:**
```json
{
  "name": "Welcome Email",
  "blocks": [
    {
      "type": "header",
      "content": "Welcome to Fluffly!"
    },
    {
      "type": "text",
      "content": "Thank you for joining us..."
    }
  ]
}
```

#### PUT /templates/:id
Update an existing template.

#### DELETE /templates/:id
Delete a template.

### Campaigns

#### GET /campaigns
Get all campaigns with pagination and search.

**Query Parameters:**
- `page`, `limit`, `search` (same as contacts)
- `status` (optional): Filter by status (draft, scheduled, sent)

#### POST /campaigns
Create a new campaign.

**Request Body:**
```json
{
  "name": "Holiday Newsletter",
  "subject": "Special Holiday Offers!",
  "sender": "John Doe",
  "group": "Newsletter",
  "blocks": [
    {
      "type": "header",
      "content": "Holiday Specials"
    }
  ],
  "status": "draft"
}
```

#### PUT /campaigns/:id
Update an existing campaign (only if not sent).

#### DELETE /campaigns/:id
Delete a campaign (only if not sent).

#### POST /campaigns/:id/send
Send a campaign (changes status to 'sent').

## 🗄️ Database Schema

### User
- `id`: UUID (Primary Key)
- `fullName`: String
- `email`: String (Unique)
- `password`: String (Hashed)
- `createdAt`, `updatedAt`: DateTime

### Contact
- `id`: UUID (Primary Key)
- `name`: String
- `email`: String
- `tags`: String (Optional)
- `group`: String (Optional)
- `userId`: UUID (Foreign Key)
- `createdAt`, `updatedAt`: DateTime

### Template
- `id`: UUID (Primary Key)
- `name`: String
- `blocks`: JSON
- `userId`: UUID (Foreign Key)
- `createdAt`, `updatedAt`: DateTime

### Campaign
- `id`: UUID (Primary Key)
- `name`: String
- `subject`: String
- `sender`: String
- `group`: String
- `blocks`: JSON
- `status`: String (draft, scheduled, sent)
- `userId`: UUID (Foreign Key)
- `createdAt`, `updatedAt`: DateTime

## 🛠️ Development

### Database Management
```bash
# View database in Prisma Studio
npm run db:studio

# Reset database
npx prisma db push --force-reset

# Generate new migration
npx prisma migrate dev --name migration-name
```

### Useful Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push
```

## 🔒 Security Features

- **Password Hashing**: Using bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for specific frontend origins
- **Helmet**: Security headers middleware
- **Rate Limiting**: Can be added for production use

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a secure `JWT_SECRET`
3. Configure production database URL
4. Add rate limiting middleware
5. Set up proper logging
6. Configure SSL/HTTPS

## 📝 Error Handling

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 