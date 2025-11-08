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
- The environment variable is set but not available at build/runtime

**Solution**: 
1. **Verify the variable is set correctly in Vercel:**
   - Go to Settings → Environment Variables
   - Check that `NEXT_PUBLIC_KNOT_CLIENT_ID` is set to: `dda0778d-9486-47f8-bd80-6f2512f9bcdb`
   - Make sure it's enabled for **Production** environment
   - **Important**: `NEXT_PUBLIC_` variables must be set for the Production environment specifically

2. **Ensure `KNOT_ENVIRONMENT` matches your client ID:**
   - If using development client ID (`dda0778d-9486-47f8-bd80-6f2512f9bcdb`), set `KNOT_ENVIRONMENT` to `development`
   - If using production client ID, set `KNOT_ENVIRONMENT` to `production`

3. **Redeploy after setting variables:**
   - After adding/changing environment variables, you MUST redeploy
   - Go to Deployments → Click the three dots on latest deployment → Redeploy
   - Or push a new commit to trigger a redeploy

4. **Check Vercel logs:**
   - Go to your deployment → Logs
   - Look for "Opening Knot SDK with:" log message
   - Verify the clientId and environment values match

5. **Common issues:**
   - Variable set only for Preview/Development but not Production
   - Variable has extra spaces or characters
   - Variable not set for the correct environment (Production vs Preview)
   - Build cache - try clearing build cache and redeploying

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

