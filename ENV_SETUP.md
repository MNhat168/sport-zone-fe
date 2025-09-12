# Environment Configuration Guide

## Setup Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Development Configuration
VITE_APP_ENV=development
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set Authorized redirect URIs to: `http://localhost:5173/auth/google/callback`
6. Copy the Client ID and paste it in your `.env` file

## Common Issues

### "Failed to construct 'URL': Invalid URL"
This error occurs when:
- `VITE_GOOGLE_CLIENT_ID` is not defined
- The Google Client ID is invalid
- The redirect URI is malformed

### Solution
1. Make sure you have created a `.env` file
2. Verify your Google Client ID is correct
3. Check that the redirect URI matches what you configured in Google Cloud Console

## Development vs Production

For production, update the redirect URI in Google Cloud Console to match your production domain:
- Development: `http://localhost:5173/auth/google/callback`
- Production: `https://yourdomain.com/auth/google/callback`
