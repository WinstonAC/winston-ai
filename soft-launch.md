# Winston AI Soft Launch Checklist

## Environment & Configuration
- [ ] Check .env config + SMTP credentials
  - [ ] SMTP_HOST
  - [ ] SMTP_PORT
  - [ ] SMTP_USER
  - [ ] SMTP_PASS
  - [ ] FROM_EMAIL
  - [ ] OPENAI_API_KEY

## Email Testing
- [ ] Test sending to real inboxes
  - [ ] Gmail
  - [ ] Outlook
  - [ ] Yahoo
- [ ] Check Gmail deliverability / spam
  - [ ] SPF record configured
  - [ ] DKIM configured
  - [ ] DMARC configured
  - [ ] Test email not in spam folder

## Application Testing
- [ ] Upload CSV and confirm all leads show
  - [ ] Test with 10+ rows
  - [ ] Verify data parsing
  - [ ] Check error handling
- [ ] Confirm UI displays properly on mobile
  - [ ] Hero section responsive
  - [ ] CSV uploader works on mobile
  - [ ] Dashboard table scrolls horizontally
  - [ ] All buttons accessible

## API Testing
- [ ] Manually run /api/sendCampaign test
  - [ ] Test with single lead
  - [ ] Test with multiple leads
  - [ ] Verify error handling
- [ ] Test /api/classifyReply endpoint
- [ ] Test /api/sendDemo endpoint

## Deployment
- [ ] Setup Vercel env vars
  - [ ] Copy all .env.local variables
  - [ ] Verify production URLs
- [ ] Deploy app
  - [ ] Check build logs
  - [ ] Verify all pages load
  - [ ] Test all API endpoints

## Branding & Meta
- [ ] Add "Powered by Cylon Digital Consulting" in footer
- [ ] Confirm favicon and meta tags are working
  - [ ] favicon.ico present
  - [ ] Open Graph tags
  - [ ] Twitter card tags
  - [ ] Meta description

## Final Checks
- [ ] Run Lighthouse audit
- [ ] Test all main user flows
- [ ] Backup database (if applicable)
- [ ] Document any known issues

## Post-Launch Monitoring
- [ ] Setup error monitoring
- [ ] Setup email delivery monitoring
- [ ] Monitor API response times
- [ ] Watch for any spam reports

---
Last updated: March 2024 