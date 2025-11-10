# Knot SDK Iframe Cross-Origin Error

## Error Message
```
Blocked a frame with origin "https://www.why-knot.tech" from accessing a frame with origin "https://cardswitcher.knotapi.com". Protocols, domains, and ports must match.
```

## What This Means

This error occurs because:
1. The Knot SDK uses an **iframe** from `cardswitcher.knotapi.com` to display the card switcher interface
2. Your site (`www.why-knot.tech`) is trying to access content inside that iframe
3. Browsers block cross-origin iframe access for security (Same-Origin Policy)

## Is This a Problem?

**Usually NO** - This is typically just a **console warning** and doesn't break functionality.

The Knot SDK uses the `postMessage` API to communicate between your site and the iframe, which is the correct and secure way to handle cross-origin communication.

## When It Might Be a Problem

1. **If the SDK isn't working** - The iframe isn't loading or responding
2. **If users can't connect** - The card switcher modal doesn't appear
3. **If callbacks aren't firing** - `onSuccess`, `onError`, etc. aren't being called

## Solutions

### 1. Verify SDK is Working
Check if the Knot SDK modal actually opens and functions correctly despite the console error. If it works, you can safely ignore the error.

### 2. Check Knot SDK Configuration
Make sure you're using the correct:
- `clientId` (matches your environment)
- `environment` ('development' or 'production')
- `sessionId` (valid and not expired)

### 3. Contact Knot Support
If the SDK isn't working, this might be:
- A configuration issue on Knot's side
- A CORS policy that needs to be updated
- An issue with your domain being whitelisted

### 4. Check Browser Console for Other Errors
Look for additional errors that might indicate the real problem:
- Network errors (404, 403, CORS)
- SDK initialization errors
- Session creation failures

## Current Configuration

Your Knot SDK is configured with:
- **Environment**: Set via `KNOT_ENVIRONMENT` env variable
- **Client ID**: Set via `NEXT_PUBLIC_KNOT_CLIENT_ID` env variable
- **Session**: Created via `/api/knot/session` endpoint

## Testing

1. **Check if SDK opens**: Does the card switcher modal appear?
2. **Check if connection works**: Can users successfully connect their accounts?
3. **Check callbacks**: Are `onSuccess` and `onError` callbacks firing?

If all of these work, the console error can be safely ignored.

## Next Steps

1. **Test the functionality** - Try connecting an account and see if it works
2. **Check Knot dashboard** - Verify your domain is properly configured
3. **Monitor for real errors** - Look for errors that actually break functionality
4. **Contact Knot support** - If functionality is broken, reach out with:
   - Your domain: `www.why-knot.tech`
   - Environment: Production
   - Client ID: (your production client ID)
   - Error logs from browser console

