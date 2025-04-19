# Winston AI Sandbox Environment

Welcome to the Winston AI Sandbox! This environment is pre-configured with sample data and test accounts to help you explore and test all features of the application.

## 🚀 Quick Start

1. Start the sandbox environment:
   ```bash
   npm run sandbox:start
   ```
   This will set up sample data and start the application.

2. Open your browser and go to:
   ```
   http://localhost:3000
   ```

## 👤 Test Accounts

You can log in with either of these accounts:

### Admin User
- Email: admin@winston-ai.com
- Password: demo123

### Demo User
- Email: demo@winston-ai.com
- Password: demo123

## 📊 Sample Data

The sandbox comes pre-loaded with:
- 2 user accounts (Admin and Demo)
- 10 sample leads with various statuses
- Different lead classifications
- Varied creation and sent dates

## 🎯 Features to Test

### 1. Authentication
- Log in with provided test accounts
- Try switching between accounts
- Test password reset (if implemented)

### 2. Lead Management
- View all leads
- Filter leads by status
- Sort leads by different criteria
- Add new leads
- Edit existing leads
- Delete leads

### 3. Email Features
- Test sending emails to leads
- Check email tracking functionality
- View email statistics

### 4. Dashboard
- View lead statistics
- Check conversion rates
- Explore data visualizations

## 🔄 Reset the Sandbox

If you want to reset all data to its initial state:
```bash
npm run sandbox:reset
```

## 📝 Notes

- All actions in the sandbox are safe and won't affect any production data
- Email sending is configured to use a test SMTP server
- All dates and statistics are generated as sample data
- Feel free to experiment with all features!

## 🆘 Need Help?

If you encounter any issues or need assistance:
1. Check the error messages in the console
2. Make sure the application is running
3. Try resetting the sandbox
4. Contact the development team for support

Happy Testing! 🎉 