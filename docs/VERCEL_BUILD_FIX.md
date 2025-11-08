# Fixing "INVALID_CLIENT_ID" Error on Vercel

## The Problem

The error occurs because `NEXT_PUBLIC_KNOT_CLIENT_ID` is not available in the client bundle when deployed to Vercel, even though it's set in environment variables.

## Root Cause

In Next.js, `NEXT_PUBLIC_` variables are embedded into the client bundle **at build time**. If the variable isn't set when Vercel builds your app, it won't be in the bundle.

## Solution

### Step 1: Verify Environment Variables in Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Check that `NEXT_PUBLIC_KNOT_CLIENT_ID` is set to: `dda0778d-9486-47f8-bd80-6f2512f9bcdb`
3. **CRITICAL**: Make sure it's enabled for **Production** environment (not just Preview/Development)
4. Also set `KNOT_ENVIRONMENT` to `development` for **Production** (currently it's only set for Pre-Production)

### Step 2: Clear Build Cache and Redeploy

1. Go to your Vercel project → **Settings** → **General**
2. Scroll down to "Build & Development Settings"
3. Click "Clear Build Cache" (if available)
4. Or go to **Deployments** → Click the three dots on latest deployment → **Redeploy**

### Step 3: Verify the Fix

After redeploying, check the browser console. You should see:
- "Opening Knot SDK with:" log showing the clientId
- The `clientIdSource` should show "from API" (the API returns it)

## Why It Works Locally But Not on Vercel

- **Locally**: Your `.env.local` file is loaded during development, so the variable is always available
- **On Vercel**: The variable must be set in Vercel's environment variables AND available during the build process

## Current Workaround

The code now has a fallback mechanism:
1. First tries to use `clientId` from the API response (preferred)
2. Falls back to `env.NEXT_PUBLIC_KNOT_CLIENT_ID` if API doesn't return it
3. The API should always return the client ID, so this should work

## If Still Not Working

1. Check Vercel build logs to see if `NEXT_PUBLIC_KNOT_CLIENT_ID` is available during build
2. Check browser console for the detailed log showing where client ID is coming from
3. Verify the API endpoint `/api/knot/session` is returning the `clientId` in the response

