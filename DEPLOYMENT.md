# Deployment Guide for WhyKnot

This guide explains how to deploy WhyKnot to Vercel with separate staging and production environments.

## Domain Configuration

- **Production**: `www.why-knot.tech` (deploys from `main` branch)
- **Staging**: `staging.why-knot.tech` (deploys from `staging` branch)

## Vercel Setup Instructions

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `shivvyas2/WHYKNOT`
4. Vercel will auto-detect Next.js

### 2. Configure Production Environment (main branch)

1. In project settings, go to **Settings > Git**
2. Set **Production Branch** to `main`
3. Go to **Settings > Domains**
4. Add custom domain: `www.why-knot.tech`
5. Follow DNS configuration instructions from Vercel

### 3. Configure Staging Environment (staging branch)

1. Go to **Settings > Git**
2. Under **Git Branches**, enable **Preview Deployments**
3. Go to **Settings > Domains**
4. Add custom domain: `staging.why-knot.tech`
5. In domain settings, set it to deploy from `staging` branch only

### 4. Set Environment Variables

For **Production** (main branch):
1. Go to **Settings > Environment Variables**
2. Add the following variables (mark as "Production" only):
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `NEXT_PUBLIC_KNOT_API_KEY` - Knot API key (when available)
   - `KNOT_API_SECRET` - Knot API secret (when available)
   - `KNOT_WEBHOOK_SECRET` - Knot webhook secret (when available)
   - `NEXT_PUBLIC_APP_URL` - `https://www.why-knot.tech`

For **Staging** (staging branch):
1. Add the same variables but mark as "Preview" or "Staging"
2. Use staging Supabase project credentials (recommended)
3. Set `NEXT_PUBLIC_APP_URL` to `https://staging.why-knot.tech`

### 5. DNS Configuration

For both domains, you'll need to add DNS records:

**For www.why-knot.tech:**
- Add a CNAME record pointing to Vercel's provided domain
- Or use A records as instructed by Vercel

**For staging.why-knot.tech:**
- Add a CNAME record pointing to Vercel's provided domain
- Or use A records as instructed by Vercel

### 6. Automatic Deployments

- **Production**: Automatically deploys when you push to `main` branch
- **Staging**: Automatically deploys when you push to `staging` branch

## Branch Strategy

- **main**: Production-ready code → `www.why-knot.tech`
- **staging**: Testing/development code → `staging.why-knot.tech`

## Workflow

1. Make changes in a feature branch
2. Merge to `staging` → Auto-deploys to `staging.why-knot.tech`
3. Test on staging environment
4. Merge `staging` to `main` → Auto-deploys to `www.why-knot.tech`

## Environment Variables Checklist

Make sure these are set in Vercel for both environments:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` (different for staging vs production)
- [ ] `NEXT_PUBLIC_KNOT_API_KEY` (when available)
- [ ] `KNOT_API_SECRET` (when available)
- [ ] `KNOT_WEBHOOK_SECRET` (when available)

## Troubleshooting

### Domain not working
- Check DNS propagation (can take up to 48 hours)
- Verify DNS records in your domain registrar
- Check Vercel domain configuration

### Environment variables not loading
- Ensure variables are set for the correct environment (Production/Preview)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### Build failures
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify Node.js version compatibility

