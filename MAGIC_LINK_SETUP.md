# Winston AI Magic Link Setup Guide

## ✅ Code Changes Completed

All necessary code changes have been implemented to fix magic link redirects and improve the email experience.

### Files Modified:
- `pages/auth/signin.tsx` - Fixed magic link redirect
- `pages/login.tsx` - Fixed magic link redirect  
- `lib/supabase-auth.ts` - Fixed all auth redirects
- `pages/auth/callback.tsx` - **FIXED: Updated to properly handle auth codes and prevent router errors**
- `supabase/email-templates/winston-magic-link.html` - Created branded email template

## 🔧 Required Supabase Dashboard Configuration

### Step 1: Update Authentication URLs

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > URL Configuration**
3. Update the following settings:

```
Site URL: http://localhost:3000
(For production: https://your-domain.com)

Additional Redirect URLs:
- http://localhost:3000/auth/callback
- http://localhost:3000/dashboard
(For production: add https://your-domain.com/auth/callback)
```

### Step 2: Update Magic Link Email Template

1. Go to **Authentication > Email Templates**
2. Select **Magic Link** template
3. Replace the entire content with the template from `supabase/email-templates/winston-magic-link.html`
4. Update the subject line to: `Winston AI - Secure Login Link`

### Step 3: Test the Magic Link Flow

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/signin`
3. Enter your email and click "Send magic link"
4. Check your email for the Winston AI branded email
5. Click the "Access Dashboard" button
6. Verify you're redirected to `/auth/callback` then `/dashboard`

## 🎨 Email Template Features

The new Winston AI email template includes:

- **Winston AI Branding**: Black background with lime green (#32CD32) accents
- **Monospace Font**: Consistent with app design
- **Security Notice**: Clear expiration and usage information
- **Multiple Access Methods**: 
  - Primary button link
  - Fallback copy-paste URL
  - 6-digit OTP code
- **Mobile Responsive**: Optimized for all devices
- **Professional Footer**: Company branding and tagline

## 🔄 How the Fixed Flow Works

### Before (Broken):
1. User requests magic link
2. Email redirects directly to `/dashboard`
3. Session not properly processed
4. User sees loading/error states
5. **Router errors**: "Abort fetching component for route: '/dashboard'"

### After (Fixed):
1. User requests magic link
2. Email redirects to `/auth/callback`
3. **Callback page properly processes auth code using `exchangeCodeForSession()`**
4. **Clean redirect using `window.location.href` to avoid router conflicts**
5. User redirected to `/dashboard` with valid session
6. Smooth, reliable authentication flow

## 🚨 Important Notes

- **Local Development**: Use `http://localhost:3000` URLs
- **Production**: Update all URLs to your production domain
- **Email Provider**: Ensure your email provider doesn't have link prefetching enabled
- **Testing**: Test with different email providers (Gmail, Outlook, etc.)
- **Router Fix**: The callback now uses `window.location.href` for clean redirects

## 🔍 Troubleshooting

### Magic Link Not Working:
1. Check Supabase Dashboard URL configuration
2. Verify email template uses `{{ .ConfirmationURL }}`
3. Ensure `/auth/callback` page is accessible
4. Check browser console for errors

### Router Errors (FIXED):
- ✅ **"Abort fetching component for route"** - Fixed by using proper auth code exchange
- ✅ **Multiple redirect attempts** - Fixed by using `window.location.href`
- ✅ **Session processing errors** - Fixed by checking URL parameters first

### Email Not Received:
1. Check spam/junk folder
2. Verify email address is correct
3. Check Supabase Auth logs in dashboard
4. Ensure SMTP settings are configured

### Redirect Issues:
1. Verify all auth functions use `/auth/callback`
2. Check that callback page redirects to `/dashboard`
3. Ensure no conflicting redirects in homepage logic

## 📧 Email Template Variables Used

- `{{ .ConfirmationURL }}` - The magic link URL
- `{{ .Token }}` - 6-digit OTP code
- Standard HTML/CSS for styling

## 🔧 Technical Details

### Callback Page Improvements:
- **Proper Code Exchange**: Uses `supabase.auth.exchangeCodeForSession(code)` instead of just `getSession()`
- **URL Parameter Parsing**: Checks for `code`, `error`, and `error_description` parameters
- **Error Handling**: Comprehensive error handling for different failure scenarios
- **Clean Redirects**: Uses `window.location.href` to avoid Next.js router conflicts
- **Router Ready Check**: Waits for `router.isReady` before processing

### Authentication Flow:
1. **Magic Link Click** → URL with `?code=...` parameter
2. **Callback Processing** → `exchangeCodeForSession(code)`
3. **Session Creation** → Valid Supabase session established
4. **Clean Redirect** → `window.location.href = '/dashboard'`

## 🎯 Next Steps

1. Apply the Supabase Dashboard configuration above
2. Test the complete magic link flow
3. Deploy to production with updated URLs
4. Monitor authentication success rates
5. Consider adding email analytics tracking

---

**Need Help?** Check the Supabase Auth documentation or contact support if you encounter any issues. 