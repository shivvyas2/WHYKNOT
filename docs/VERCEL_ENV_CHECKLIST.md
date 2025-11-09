# Vercel Environment Variables Checklist

## ✅ Code Changes
**Status:** Already pushed to GitHub - Vercel will auto-deploy

The fix to use `https://production.knotapi.com` has been committed and pushed. Vercel should automatically detect the changes and start a new deployment.

---

## 🔍 Environment Variables to Verify in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Variables for Production:

1. **NEXT_PUBLIC_KNOT_CLIENT_ID**
   - ✅ Should be set to: `a390e79d-2920-4440-9ba1-b747bc92790b`
   - Make sure it's enabled for **Production** environment
   - This is your production Client ID

2. **KNOT_API_SECRET**
   - ✅ Should be set to: `be1e86abb4fc42a3b904b2f52215847e`
   - Make sure it's enabled for **Production** environment
   - This is your production API Secret

3. **KNOT_ENVIRONMENT** ⚠️ **IMPORTANT**
   - ✅ Should be set to: `production`
   - Make sure it's enabled for **Production** environment
   - This tells the app to use `https://production.knotapi.com`
   - **If this is set to `development`, it will use the wrong URL!**

---

## 📋 Quick Checklist

- [ ] Code is pushed (✅ Already done)
- [ ] `NEXT_PUBLIC_KNOT_CLIENT_ID` is set to production Client ID
- [ ] `KNOT_API_SECRET` is set to production Secret
- [ ] `KNOT_ENVIRONMENT` is set to `production` (not `development`)
- [ ] All variables are enabled for **Production** environment
- [ ] Wait for Vercel deployment to complete
- [ ] Test the endpoint after deployment

---

## 🚀 After Deployment

Once Vercel finishes deploying:

1. **Test in your app** - Try the opt-in flow
2. **Check Vercel logs** - Look for:
   - `baseUrl: 'https://production.knotapi.com'`
   - `endpoint: 'https://production.knotapi.com/session/create'`
3. **Verify it works** - Should no longer get 405 errors

---

## ⚠️ Common Issues

**If you still get 405 errors:**
- Check that `KNOT_ENVIRONMENT=production` is set (not `development`)
- Verify the deployment completed successfully
- Check Vercel logs to see which URL is being called

**If variables aren't updating:**
- Make sure variables are set for **Production** (not just Preview/Development)
- After changing variables, you may need to **Redeploy** manually
- Go to Deployments → Latest → Three dots → Redeploy

---

## 📝 Summary

**You DON'T need to push anything** - code is already pushed ✅

**You DO need to verify:**
- `KNOT_ENVIRONMENT=production` is set in Vercel
- Production Client ID and Secret are correct
- All variables are enabled for Production environment

**Then:**
- Wait for auto-deployment (or manually redeploy)
- Test the endpoint

