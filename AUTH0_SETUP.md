# Auth0 Setup Guide

## Environment Variables

Create a `.env` file in the `notiflow` directory with the following variables:

```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier

# Existing API Configuration
VITE_NOTIFLOW_API_URL=your-api-url
VITE_NOTIFLOW_API_KEY=your-api-key
```

## Auth0 Configuration Steps

1. **Get your Auth0 domain and client ID** from your Auth0 dashboard
2. **Update the auth0-config.js file** with your actual values
3. **Configure your Auth0 application**:
   - Set the Allowed Callback URLs to: `http://localhost:5173, http://localhost:5173/auth`
   - Set the Allowed Logout URLs to: `http://localhost:5173`
   - Set the Allowed Web Origins to: `http://localhost:5173`

## Application Flow

1. **Landing Page** (`/`) - Public dashboard with "Try for Free" button
2. **Auth Page** (`/auth`) - Auth0 login/signup interface
3. **Home Page** (`/home`) - Protected authenticated dashboard

## Testing the Integration

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5173`
3. Click "Try for Free" button
4. Complete Auth0 authentication
5. You'll be redirected to the protected `/home` page

## Route Protection

- `/home` - Protected route (requires authentication)
- `/auth` - Public route (authentication interface)
- `/` - Public route (landing page)
- All other routes remain unchanged
