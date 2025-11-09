# Adding New Environment Variables to Vercel

## Step-by-Step Instructions

### 1. Go to Vercel Dashboard
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **WHYKNOT** project

### 2. Navigate to Environment Variables
1. Click on **Settings** (in the top navigation)
2. Click on **Environment Variables** (in the left sidebar)

### 3. Add Each Variable

For each variable below, follow these steps:
- Click **Add New**
- Enter the **Key** (variable name)
- Enter the **Value** (the actual value)
- Select **Environments**: Check **Production**, **Preview**, and **Development** (or just Production if you prefer)
- Click **Save**

---

## Variables to Add

### 1. MONGO_URI
- **Key**: `MONGO_URI`
- **Value**: `mongodb+srv://whyknot:YOUR_PASSWORD@whyknot.74u10e2.mongodb.net/?appName=whyknot`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- **Note**: Replace `YOUR_PASSWORD` with your actual MongoDB password

### 2. NOVA_ACT_API_KEY
- **Key**: `NOVA_ACT_API_KEY`
- **Value**: `YOUR_NOVA_ACT_API_KEY`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- **Note**: Get this from your Nova Act dashboard

### 3. DEDALUS_LABS_KEY
- **Key**: `DEDALUS_LABS_KEY`
- **Value**: `YOUR_DEDALUS_LABS_KEY`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- **Note**: Get this from your Dedalus Labs account

### 4. CLAUDE_API_KEY
- **Key**: `CLAUDE_API_KEY`
- **Value**: `YOUR_CLAUDE_API_KEY`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- **Note**: Get this from your Anthropic/Claude account

---

## Important Notes

### Security
- ⚠️ **Never commit these values to Git** - they're already in your codebase, but make sure they're in `.gitignore`
- These are sensitive credentials - keep them secure
- Only add them in Vercel's environment variables section

### After Adding Variables

1. **Redeploy your application**:
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger auto-deployment

2. **Verify the variables are loaded**:
   - Check Vercel logs after deployment
   - Use the `/api/knot/debug` endpoint (if available) to verify
   - Make sure variables are accessible in your code

### Environment Selection

- **Production**: Used when deployed to your production domain
- **Preview**: Used for preview deployments (PR previews)
- **Development**: Used for local development (if using Vercel CLI)

**Recommendation**: Add to all three environments for consistency, or just Production if you only need them in production.

---

## Quick Checklist

- [ ] Added `MONGO_URI` to Vercel
- [ ] Added `NOVA_ACT_API_KEY` to Vercel
- [ ] Added `DEDALUS_LABS_KEY` to Vercel
- [ ] Added `CLAUDE_API_KEY` to Vercel
- [ ] Selected appropriate environments for each variable
- [ ] Redeployed the application
- [ ] Verified variables are accessible in the app

---

## Troubleshooting

### Variables not working after adding?
1. Make sure you **Redeployed** after adding variables
2. Check that variables are set for the correct environment (Production/Preview/Development)
3. Verify the variable names match exactly (case-sensitive)
4. Check Vercel logs for any errors

### Need to update a variable?
1. Go to Settings → Environment Variables
2. Find the variable
3. Click the three dots (⋯) → Edit
4. Update the value
5. Save and Redeploy

### Variables showing as undefined?
- Make sure variable names match exactly (no typos)
- Check that you selected the correct environment
- Verify the deployment completed successfully
- Check Vercel logs for any errors

