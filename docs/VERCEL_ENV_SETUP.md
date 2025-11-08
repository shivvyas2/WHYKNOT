# Vercel Environment Variables Setup

## Required Environment Variables for Production

To deploy WhyKnot to production on Vercel, you need to set the following environment variables in your Vercel project settings:

### Knot API Configuration

1. **NEXT_PUBLIC_KNOT_CLIENT_ID**
   - Value: `dda0778d-9486-47f8-bd80-6f2512f9bcdb`
   - This is your Knot API Client ID
   - Must be set for the Knot SDK to work

2. **KNOT_API_SECRET**
   - Value: `ff5e51b6dcf84a829898d37449cbc47a`
   - This is your Knot API Secret
   - Used for server-side API calls
   - **Important**: Do NOT expose this in client-side code

3. **KNOT_ENVIRONMENT**
   - Value: `development` (or `production` if you have production credentials)
   - Determines which Knot API endpoint to use
   - Default: `development`

### Supabase Configuration (Optional for Mock Mode)

If you want to use real authentication instead of mock mode:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://dcqoexxqmwrjnkaqxbwa.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Your Supabase service role key (server-side only)

### App Configuration

1. **NEXT_PUBLIC_APP_URL**
   - Your production URL
   - Example: `https://www.why-knot.tech`

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: The variable name (e.g., `NEXT_PUBLIC_KNOT_CLIENT_ID`)
   - **Value**: The variable value
   - **Environment**: Select which environments (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application for changes to take effect

## Troubleshooting

### "INVALID_CLIENT_ID" Error

This error occurs when:
- `NEXT_PUBLIC_KNOT_CLIENT_ID` is not set in Vercel
- The client ID is incorrect
- The client ID doesn't match the environment (development vs production)

**Solution**: 
1. Verify `NEXT_PUBLIC_KNOT_CLIENT_ID` is set in Vercel
2. Ensure it matches your Knot account credentials
3. Ensure `KNOT_ENVIRONMENT` matches your client ID's environment

### "Failed to get user" Error

This error occurs when:
- Supabase credentials are not configured
- Authentication fails

**Solution**:
- The app will automatically use mock mode if Supabase isn't configured
- To use real authentication, set all Supabase environment variables

## Current Configuration

Based on your setup:
- **Client ID**: `dda0778d-9486-47f8-bd80-6f2512f9bcdb`
- **Secret**: `ff5e51b6dcf84a829898d37449cbc47a`
- **Environment**: `development`

Make sure these are set in Vercel for both **Production** and **Preview** environments.

