# Production 500 Error Troubleshooting Guide

## Common Causes of 500 Errors in Production

### 1. **Missing Environment Variables**

The most common cause is missing or incorrectly set environment variables in Vercel.

**Check:**
- Visit `/api/knot/debug` in your production app to see which variables are missing
- Verify in Vercel Dashboard → Settings → Environment Variables

**Required Variables:**
- `NEXT_PUBLIC_KNOT_CLIENT_ID` - Must be set
- `KNOT_API_SECRET` - Must be set  
- `KNOT_ENVIRONMENT` - Should be `development` or `production`

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure all variables are set for **Production** environment
3. **Redeploy** after adding/changing variables

### 2. **Environment Variable Validation Failure**

Previously, if environment variables had invalid formats (e.g., invalid URL), the entire app would crash at module load time.

**Fix Applied:**
- Environment validation is now more lenient
- App will use defaults if validation fails instead of crashing
- Errors are logged to console for debugging

### 3. **Knot API Connection Failure**

The app calls Knot's API to create sessions. If this fails, you'll get a 500 error.

**Check Vercel Logs:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment → Logs
3. Look for:
   - `Error calling Knot API:`
   - `Knot session creation error:`
   - `Failed to create Knot session`

**Common Issues:**
- Invalid credentials (wrong Client ID or Secret)
- Wrong environment (`KNOT_ENVIRONMENT` doesn't match your credentials)
- Network issues (Knot API is down)
- Rate limiting

### 4. **Supabase Connection Issues**

If Supabase is configured but connection fails, the app falls back to mock mode. However, if Supabase client creation throws an error, it can cause 500.

**Check:**
- Are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set correctly?
- Is your Supabase project active?

### 5. **Error Details Hidden in Production**

Previously, production errors only showed "Internal server error" without details.

**Fix Applied:**
- Error messages now include the actual error message
- Error type is included to help identify the issue
- Full error details are logged to Vercel logs (check Logs tab)

## How to Debug

### Step 1: Check Debug Endpoint

Visit: `https://your-domain.com/api/knot/debug`

This will show:
- Which environment variables are set
- Which are missing
- Common issues checklist

### Step 2: Check Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments" → Latest deployment
4. Click "Logs" tab
5. Look for error messages, especially:
   - `Session creation error:`
   - `Full error details:`
   - `Error calling Knot API:`

### Step 3: Check Error Response

When you get a 500 error, the response now includes:
```json
{
  "error": "Internal server error",
  "message": "Actual error message here",
  "errorType": "Error",
  "hint": "Check Vercel logs for full error details..."
}
```

The `message` field will tell you what actually failed.

### Step 4: Verify Environment Variables

In Vercel Dashboard:
1. Settings → Environment Variables
2. Verify these are set for **Production**:
   - `NEXT_PUBLIC_KNOT_CLIENT_ID`
   - `KNOT_API_SECRET`
   - `KNOT_ENVIRONMENT`
3. Make sure there are no extra spaces or newlines
4. Values should match exactly (case-sensitive)

### Step 5: Test Knot API Directly

You can test if your Knot credentials work by checking the Vercel logs when the session endpoint is called. The logs will show:
- `Calling Knot API:` with the baseUrl and environment
- `Knot session creation error:` if the API call fails

## Recent Fixes Applied

1. **Environment Validation**: Made more lenient to prevent app crashes
2. **Error Messages**: Now include actual error details in production
3. **Fallback Logic**: Added fallback to `process.env` if `env` object fails
4. **Better Logging**: Full error details logged to console (visible in Vercel logs)
5. **Debug Endpoint**: Enhanced to work in production and show issues

## Next Steps

1. **Redeploy** your app after these fixes
2. **Check** `/api/knot/debug` endpoint to verify env vars
3. **Monitor** Vercel logs when testing the session endpoint
4. **Verify** the error message in the 500 response to identify the specific issue

## Still Getting 500?

If you're still getting 500 errors after checking the above:

1. Share the error message from the API response
2. Share relevant logs from Vercel (with sensitive data redacted)
3. Check if the issue is:
   - During session creation (`/api/knot/session`)
   - During transaction sync (`/api/knot/transactions/sync`)
   - During other operations

The improved error messages should now tell you exactly what's failing!

