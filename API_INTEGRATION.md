# API Integration Guide

## Overview

This document describes the integration between the NotiFlow frontend (React) and backend (Flask API) for user authentication and API key management.

## User Flow

1. **User clicks "Try for Free"** on the landing page (`/`)
2. **Redirected to Auth0** authentication page (`/auth`)
3. **User signs up/signs in** via Auth0 (email, Google, etc.)
4. **Frontend calls backend** to create user in MongoDB
5. **Backend generates API key** and stores user data
6. **User redirected to dashboard** (`/home`) with personalized API key

## Backend API Endpoints

### Create User

- **URL**: `POST /auth/create-user`
- **Purpose**: Create new user in MongoDB from Auth0 data
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "sub": "auth0|user_id",
    "name": "John Doe"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "user": {
      "email": "user@example.com",
      "api_key": "generated_api_key",
      "status": "active",
      "plan": "trial",
      "rate_limit": 300,
      "requests_used": 0,
      "reset_time": "2025-01-01T00:00:00.000+00:00"
    },
    "api_key": "generated_api_key"
  }
  ```

### Get User

- **URL**: `GET /auth/user/{email}`
- **Purpose**: Retrieve user data by email
- **Response**: User object without sensitive data

### Get User API Key

- **URL**: `GET /auth/user/{email}/api-key`
- **Purpose**: Get user's API key and status
- **Response**:
  ```json
  {
    "success": true,
    "api_key": "user_api_key",
    "status": "active",
    "plan": "trial"
  }
  ```

## Frontend Integration

### User Service (`src/utils/userService.js`)

Utility functions for managing user data and API keys:

- `getApiKey()` - Get stored API key from localStorage
- `setApiKey(apiKey)` - Store API key in localStorage
- `removeApiKey()` - Remove API key from localStorage
- `getUserByEmail(email)` - Fetch user data from backend
- `getUserApiKey(email)` - Fetch user's API key from backend
- `hasValidApiKey()` - Check if user has valid API key
- `logout()` - Clear API key and logout

### Authentication Flow

1. **Auth0 authentication** completes
2. **useEffect in Auth.jsx** triggers backend API call
3. **Backend creates user** and returns API key
4. **Frontend stores API key** in localStorage
5. **User redirected** to protected dashboard

### API Key Usage

- **Stored in localStorage** as `notiflow_api_key`
- **Used for all API calls** in authenticated pages
- **Automatically included** in request headers
- **Cleared on logout**

## MongoDB User Schema

```javascript
{
  "_id": ObjectId,
  "email": "user@example.com",
  "api_key": "generated_64_character_hex_string",
  "status": "active" | "inactive",
  "plan": "trial" | "basic" | "premium",
  "rate_limit": 300,
  "requests_used": 0,
  "reset_time": "2025-01-01T00:00:00.000+00:00",
  "auth0_user_id": "auth0|user_id",
  "created_at": "2024-12-17T10:00:00.000+00:00",
  "updated_at": "2024-12-17T10:00:00.000+00:00"
}
```

## Environment Variables

### Frontend (.env)

```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
VITE_NOTIFLOW_API_URL=https://your-api-domain.com
```

### Backend (.env)

```env
MONGO_URI=your_mongodb_connection_string
FLASK_ENV=development
```

## Security Considerations

1. **API Key Storage**: Stored in localStorage (consider more secure storage for production)
2. **Token Verification**: Auth0 JWT tokens should be properly verified in production
3. **Rate Limiting**: Implement rate limiting on API endpoints
4. **CORS**: Configure CORS properly for production domains
5. **HTTPS**: Use HTTPS in production for all API calls

## Testing

1. Start the backend API server
2. Start the frontend development server
3. Navigate to the landing page
4. Click "Try for Free"
5. Complete Auth0 authentication
6. Verify user creation in MongoDB
7. Check API key generation and storage
8. Test protected dashboard functionality
