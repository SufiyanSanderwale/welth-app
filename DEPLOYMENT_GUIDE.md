# 🚀 Welth Finance Platform - Vercel Deployment Guide

## 📋 Prerequisites
- GitHub account with your Welth repository
- Vercel account (free)
- Supabase account (free)
- Clerk account (free)
- Inngest account (free)

---

## 🔧 Step 1: Prepare Your Project

### 1.1 Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Welth Finance Platform"
```

### 1.2 Connect to GitHub
```bash
git remote add origin https://github.com/SufiyanSanderwale/Welth.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Set Up External Services

### 2.1 Supabase Database (Free)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your database URL from Settings → Database
4. Copy both `DATABASE_URL` and `DIRECT_URL`

### 2.2 Clerk Authentication (Free)
1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Get your API keys from API Keys section
4. Set up redirect URLs:
   - Sign-in: `/sign-in`
   - Sign-up: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

### 2.3 Google Gemini AI (Free)
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create API key
3. Copy the API key

### 2.4 Resend Email (Free)
1. Go to [resend.com](https://resend.com)
2. Create account and get API key

### 2.5 Arcjet Security (Free)
1. Go to [arcjet.com](https://arcjet.com)
2. Create account and get API key

### 2.6 Inngest Background Jobs (Free)
1. Go to [inngest.com](https://inngest.com)
2. Create account
3. Get Event Key and Signing Key

### 2.7 Financial Modeling Prep (Free)
1. Go to [financialmodelingprep.com](https://financialmodelingprep.com)
2. Sign up for free API key

---

## 🚀 Step 3: Deploy to Vercel

### 3.1 Connect GitHub Repository
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your Welth repository
5. Select the repository: `SufiyanSanderwale/Welth`

### 3.2 Configure Environment Variables
In Vercel dashboard, go to Settings → Environment Variables and add:

```bash
# Database
DATABASE_URL=your_supabase_database_url
DIRECT_URL=your_supabase_direct_url

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# AI Services
GEMINI_API_KEY=your_gemini_api_key

# Email Service
RESEND_API_KEY=your_resend_api_key

# Security
ARCJET_KEY=your_arcjet_key

# Market Data
FMP_API_KEY=your_fmp_api_key

# Background Jobs
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

### 3.3 Deploy Settings
- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`

---

## 🔄 Step 4: Set Up Inngest Background Jobs

### 4.1 Install Inngest CLI
```bash
npm install -g @inngest/cli
```

### 4.2 Configure Inngest
Create `inngest.config.ts`:
```typescript
import { serve } from "inngest/next";
import { inngest } from "./lib/inngest/client";
import { budgetAlertFunction } from "./lib/inngest/function";

export default serve({
  client: inngest,
  functions: [budgetAlertFunction],
});
```

### 4.3 Deploy Functions
```bash
npx inngest-cli@latest deploy
```

---

## 🗄️ Step 5: Database Setup

### 5.1 Push Prisma Schema
```bash
npx prisma db push
```

### 5.2 Generate Prisma Client
```bash
npx prisma generate
```

---

## ✅ Step 6: Verify Deployment

### 6.1 Test Core Features
- [ ] User registration/login
- [ ] Account creation
- [ ] Transaction management
- [ ] Budget tracking
- [ ] AI insights
- [ ] Email notifications

### 6.2 Test Background Jobs
- [ ] Budget alerts
- [ ] Recurring transactions
- [ ] Email notifications

---

## 🔧 Step 7: Production Optimizations

### 7.1 Enable Analytics
- Go to Vercel dashboard
- Enable Analytics and Speed Insights

### 7.2 Set Up Monitoring
- Monitor function execution in Inngest dashboard
- Check Vercel function logs
- Monitor Supabase database performance

### 7.3 Performance Optimization
- Enable Vercel Edge Functions
- Optimize images with Next.js Image component
- Use Vercel's CDN for static assets

---

## 🚨 Troubleshooting

### Common Issues:

#### 1. Database Connection Issues
```bash
# Check DATABASE_URL format
postgresql://username:password@host:port/database
```

#### 2. Clerk Authentication Issues
- Verify redirect URLs match exactly
- Check API keys are correct
- Ensure CORS settings allow your domain

#### 3. Inngest Functions Not Working
```bash
# Check function deployment
npx inngest-cli@latest list

# View function logs
npx inngest-cli@latest logs
```

#### 4. Build Failures
- Check Node.js version (use 18.x)
- Verify all dependencies are in package.json
- Check for TypeScript errors

---

## 📊 Monitoring & Maintenance

### Daily Checks:
- [ ] Function execution status
- [ ] Database performance
- [ ] Error logs in Vercel

### Weekly Checks:
- [ ] Update dependencies
- [ ] Review performance metrics
- [ ] Check security alerts

### Monthly Checks:
- [ ] Review usage limits
- [ ] Optimize database queries
- [ ] Update API keys if needed

---

## 🎯 Success Checklist

- [ ] ✅ Repository pushed to GitHub
- [ ] ✅ Vercel deployment successful
- [ ] ✅ All environment variables configured
- [ ] ✅ Database schema deployed
- [ ] ✅ Authentication working
- [ ] ✅ Background jobs deployed
- [ ] ✅ Email notifications working
- [ ] ✅ AI features functional
- [ ] ✅ All pages loading correctly
- [ ] ✅ Mobile responsive design working

---

## 🔗 Useful Links

- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
- **Clerk Dashboard**: [clerk.com/dashboard](https://clerk.com/dashboard)
- **Inngest Dashboard**: [inngest.com/dashboard](https://inngest.com/dashboard)
- **GitHub Repository**: [github.com/SufiyanSanderwale/Welth](https://github.com/SufiyanSanderwale/Welth)

---

## 💡 Pro Tips

1. **Use Vercel's Preview Deployments** for testing before production
2. **Set up branch protection** on GitHub for main branch
3. **Enable automatic deployments** from main branch
4. **Use Vercel's Edge Functions** for better performance
5. **Monitor function cold starts** in Inngest dashboard
6. **Set up error tracking** with Sentry or similar service

---

*Your Welth Finance Platform is now ready for production! 🎉*
