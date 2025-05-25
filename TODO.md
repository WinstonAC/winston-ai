# 🧪 Winston AI – Pre-Deploy QA Checklist

## 🌐 Routes to Test
- [ ] /              (Homepage loads, nav works)
- [ ] /join          (Form submits, errors handled, Supabase row added)
- [ ] /dashboard     (Leads data displays properly)
- [ ] /demo          (Route exists and loads)
- [ ] /campaigns     (Decide: keep campaigns.tsx or index.tsx)
- [ ] /login         (OAuth works via Google)

## 🔍 Components
- [ ] Navigation menu
- [ ] Footer links
- [ ] Auth redirects
- [ ] Console errors (browser + server)
- [ ] Email flow (log errors if failing)

## 🛠️ Fix Notes
- [ ] Comment/remove unused Campaigns UI
- [ ] Confirm .env values
- [ ] Supabase: check 'leads' table and fields

## 🔍 Feature Audit
- [ ] Authentication
  - [ ] Google OAuth flow
  - [ ] Session management
  - [ ] Protected routes
  - [ ] Logout functionality

- [ ] Dashboard
  - [ ] Stats cards display correct data
  - [ ] Recent activity feed updates
  - [ ] Lead table sorting/filtering
  - [ ] CSV import functionality
  - [ ] Campaign metrics display

- [ ] Campaign Management
  - [ ] Campaign creation flow
  - [ ] Template selection
  - [ ] Audience targeting
  - [ ] Scheduling options
  - [ ] Status updates

- [ ] Email Integration
  - [ ] Thank you email delivery
  - [ ] Email template rendering
  - [ ] Bounce handling
  - [ ] Reply tracking

## 🐛 Known Issues
1. Duplicate page detected: `/campaigns` route has conflicting files
   - [ ] Decide between `pages/campaigns.tsx` and `pages/campaigns/index.tsx`
   - [ ] Remove unused file
   - [ ] Update all references

## 🔄 Environment Setup
- [ ] Verify all environment variables
  - [ ] Supabase credentials
  - [ ] Email service configuration
  - [ ] OAuth credentials
  - [ ] API keys

## 📱 Responsive Design
- [ ] Mobile navigation
- [ ] Dashboard layout
- [ ] Campaign creation forms
- [ ] Lead table display

## 🔒 Security Checks
- [ ] API route protection
- [ ] Environment variable exposure
- [ ] Input validation
- [ ] Rate limiting
- [ ] CORS configuration

## 🚀 Performance
- [ ] Page load times
- [ ] API response times
- [ ] Image optimization
- [ ] Bundle size analysis

## 📝 Documentation
- [ ] API documentation
- [ ] Environment setup guide
- [ ] Deployment process
- [ ] User onboarding flow 