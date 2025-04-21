# Winston AI

Winston AI is an AI-powered sales assistant that helps manage leads, campaigns, and automate sales processes.

![Winston AI Chatbot](public/chatbot-screenshot.png)
*The chatbot in action on the dashboard page*

## Features

### Team Management
- **Team Member Invitation**: Invite team members via email
- **Team Dashboard**: Manage team members and their roles
- **Secure Authentication**: Robust session handling and access control

### Chatbot Assistant
- **Unified Interface**: Single chatbot for both general assistance and analytics help
- **Context-Aware Responses**: The chatbot provides relevant information based on the current page and context
- **Navigation**: Clickable topics that can navigate to different sections of the application
- **Real-Time Interaction**: Instant responses to user queries
- **Brutalist Design**: Consistent with the application's aesthetic
  - Monospace font
  - High contrast colors
  - Sharp edges
  - Bold typography
  - Minimal shadows
  - Grid-based layouts

### Pages
- **Landing Page**: Minimal design with floating animations
- **Login**: Secure authentication with team support
- **Dashboard**: Overview of leads, campaigns, and team activity
- **Leads**: Lead management and tracking
- **Campaigns**: Campaign creation and monitoring
- **Team Management**: Manage team members and permissions
- **Demo**: Request a personalized demo
- **Solutions**: Overview of available features and capabilities
- **Pricing**: Transparent pricing plans and add-ons

## Getting Started

1. Clone the repository
2. Install Node.js v18.18.0 (required for compatibility)
3. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
4. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

Note: The `--legacy-peer-deps` flag is required due to dependency conflicts between Storybook versions.

## Sandbox Testing

The sandbox environment provides a pre-configured testing environment with sample data and users. This is ideal for:
- Testing new features
- Demonstrating the application
- Training new team members
- Running automated tests

### Setting Up the Sandbox

1. **Prerequisites**:
   - PostgreSQL database running locally
   - Node.js v18.18.0 or later
   - All dependencies installed (`npm install --legacy-peer-deps`)

2. **Database Setup**:
   ```bash
   # Create the database
   createdb winston_ai
   
   # Run migrations
   npx prisma migrate deploy
   ```

3. **Environment Configuration**:
   Create a `.env` file with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/winston_ai?schema=public"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Email (optional for testing)
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-specific-password"
   EMAIL_FROM="noreply@winston-ai.com"
   ```

4. **Initialize Sandbox**:
   ```bash
   # Run the sandbox setup script
   npm run sandbox:setup
   ```

### Sandbox Features

The sandbox environment includes:

1. **Demo Team**:
   - Pre-configured team with sample settings
   - Team limits set for testing

2. **Test Users**:
   - Admin User:
     - Email: admin@winston-ai.com
     - Password: demo123
     - Role: Team Admin
   - Demo User:
     - Email: demo@winston-ai.com
     - Password: demo123
     - Role: Team Member
   - Test User:
     - Email: test@winston-ai.com
     - Password: demo123
     - Role: Team Member

3. **Sample Data**:
   - 15 leads per user
   - Various lead statuses (Pending, Sent, Opened, etc.)
   - Sample email templates
   - Campaign metrics
   - Team activities

### Testing Workflows

1. **Authentication Testing**:
   - Test login with different user roles
   - Verify role-based access control
   - Test session management

2. **Lead Management**:
   - Create new leads
   - Update lead status
   - Add notes and activities
   - Test lead assignment

3. **Campaign Testing**:
   - Create test campaigns
   - Monitor campaign metrics
   - Test email templates
   - Verify analytics

4. **Team Collaboration**:
   - Test team member invitations
   - Verify role permissions
   - Test team settings

5. **Analytics Dashboard**:
   - View different chart types
   - Test data export
   - Compare campaigns
   - Monitor real-time updates

### Sandbox Commands

```bash
# Initialize sandbox
npm run sandbox:setup

# Reset sandbox data
npm run sandbox:reset

# Start sandbox server
npm run sandbox:start

# Full sandbox reset and start
npm run sandbox
```

### Troubleshooting

1. **Database Connection Issues**:
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database exists and is accessible

2. **Authentication Problems**:
   - Verify NEXTAUTH_URL and NEXTAUTH_SECRET
   - Check session configuration
   - Clear browser cookies if needed

3. **Data Reset**:
   If you need to reset the sandbox data:
   ```bash
   npm run sandbox:reset
   npm run sandbox:setup
   ```

4. **Common Errors**:
   - "Database not found": Run migrations
   - "Invalid credentials": Verify user data
   - "Permission denied": Check role settings

### Best Practices

1. **Data Management**:
   - Use sandbox for testing only
   - Reset data before important demos
   - Don't use production credentials

2. **Testing Strategy**:
   - Test all user roles
   - Verify edge cases
   - Document any issues found

3. **Security**:
   - Use test email accounts
   - Don't expose sandbox publicly
   - Reset sensitive data after testing

## Testing Guide for Non-Technical Users

This section provides simplified instructions for non-technical team members who need to test the application.

### Quick Start Guide

1. **Access the Application**:
   - Open your web browser
   - Go to: http://localhost:3000
   - If the page doesn't load, contact your technical team

2. **Login Information**:
   Use one of these test accounts:
   - Admin Account (Full Access):
     - Email: admin@winston-ai.com
     - Password: demo123
   - Demo Account (Limited Access):
     - Email: demo@winston-ai.com
     - Password: demo123
   - Test Account (Basic Access):
     - Email: test@winston-ai.com
     - Password: demo123

### What to Test

1. **Basic Navigation**:
   - Can you log in successfully?
   - Can you see the dashboard after logging in?
   - Can you access all menu items?

2. **Lead Management**:
   - Can you view the list of leads?
   - Can you add a new lead?
   - Can you update a lead's status?

3. **Campaign Testing**:
   - Can you view existing campaigns?
   - Can you create a new campaign?
   - Can you see campaign statistics?

4. **Team Features**:
   - Can you see other team members?
   - Can you view team activity?
   - Can you access team settings?

### Common Issues and Solutions

1. **Login Problems**:
   - If you can't log in:
     - Double-check your email and password
     - Try a different browser
     - Contact your technical team

2. **Page Loading Issues**:
   - If pages don't load:
     - Refresh the page
     - Clear your browser cache
     - Try a different browser

3. **Data Not Showing**:
   - If you don't see any data:
     - Log out and log back in
     - Check if you're using the correct account
     - Contact your technical team

### Reporting Issues

When reporting problems, please include:
1. What you were trying to do
2. What happened instead
3. Any error messages you saw
4. Which account you were using
5. Which browser you were using

### Testing Checklist

Use this checklist to ensure you've tested all key features:

- [ ] Login with each account type
- [ ] View and navigate the dashboard
- [ ] Check lead management features
- [ ] Test campaign creation and viewing
- [ ] Verify team member visibility
- [ ] Test the chatbot assistant
- [ ] View analytics and reports
- [ ] Check email notifications (if configured)

### Support

If you encounter any issues:
1. First, try the solutions listed above
2. If the problem persists, contact your technical team
3. Provide as much detail as possible about the issue

## Quick Reference Guide

### Login Information
| Account Type | Email | Password | Access Level |
|-------------|-------|----------|--------------|
| Admin | admin@winston-ai.com | demo123 | Full Access |
| Demo | demo@winston-ai.com | demo123 | Limited Access |
| Test | test@winston-ai.com | demo123 | Basic Access |

### Common Actions
1. **Viewing Leads**
   - Click "Leads" in the menu
   - Use search bar to find specific leads
   - Filter by status or source
   - Click on a lead to view details

2. **Creating Campaigns**
   - Click "Campaigns" in the menu
   - Click "Create Campaign"
   - Fill in campaign details
   - Select target audience
   - Choose email template
   - Schedule or send immediately

3. **Viewing Analytics**
   - Click "Analytics" in the menu
   - Select date range
   - Choose chart type
   - Compare campaigns
   - Export data if needed

### Status Indicators
| Color | Meaning |
|-------|---------|
| Green | Success/Active |
| Red | Error/Inactive |
| Yellow | Warning/Pending |
| Blue | Information/Processing |

### Common Issues
1. **Page Not Loading**
   - Refresh the page
   - Check internet connection
   - Try a different browser

2. **Can't Log In**
   - Verify email and password
   - Check caps lock
   - Try a different account

3. **Data Not Showing**
   - Check filters
   - Verify date range
   - Refresh the page

### Support Contacts
- Technical Issues: [Your Support Email]
- Account Problems: [Your Admin Email]
- General Questions: [Your Help Desk Email]

## Documentation

For detailed information about the chatbot and its features, visit our [Chatbot Documentation](/docs/chatbot).

### Quick Start with the Chatbot

1. Click the "Open Chat" button in the bottom-right corner
2. Select from available topics or type your query
3. Click on navigation options to move between pages
4. Use the "Clear" button to reset the conversation
5. Toggle between general and analytics modes using the context switch button

![Chatbot Navigation](public/chatbot-navigation.png)
*Navigating between pages using the chatbot*

### Available Commands

#### General Mode
- View your lead stats
- Manage your campaigns
- Upload new leads
- Check system status
- View team activity

#### Analytics Mode
- View different chart types
- Check key metrics
- Export data in various formats
- Compare campaigns
- Monitor real-time updates

## Example Interactions

### Viewing Lead Stats
```
USER: VIEW_LEAD_STATS_
BOT: CURRENT_METRICS_
     LEADS_123_
     ACTIVE_CAMPAIGNS_5_
     CONVERSION_RATE_12%_
```

### Creating a Campaign
```
USER: CREATE_NEW_CAMPAIGN_
BOT: NEW_CAMPAIGN_SETUP_
     1_SELECT_CAMPAIGN_TYPE_
     2_DEFINE_TARGET_AUDIENCE_
     3_SET_OBJECTIVES_
```

### Analytics Help
```
USER: SHOW_CHART_TYPES_
BOT: AVAILABLE_CHART_TYPES_
     1_LINE_CHART_TRENDS_OVER_TIME_
     2_BAR_CHART_COMPARE_METRICS_
     3_PIE_CHART_DISTRIBUTIONS_
     4_SCATTER_PLOT_RELATIONSHIPS_
     5_AREA_CHART_CUMULATIVE_
     6_HEATMAP_DENSITY_
```

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma (Database ORM)
- NextAuth.js (Authentication)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Testing

### Automated Testing

The project uses Jest and React Testing Library for automated testing. Tests are organized in the `__tests__` directory.

#### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

#### Test Structure

1. **Component Tests**:
   - Located in `__tests__/components/`
   - Tests UI components and interactions
   - Includes snapshot testing

2. **Page Tests**:
   - Located in `__tests__/pages/`
   - Tests page rendering and routing
   - Includes authentication tests

3. **API Tests**:
   - Located in `__tests__/api/`
   - Tests API endpoints
   - Includes error handling tests

4. **Integration Tests**:
   - Located in `__tests__/integration/`
   - Tests complete user flows
   - Includes cross-feature testing

#### Test Coverage

The project maintains a minimum coverage threshold:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

### Manual Testing

#### Testing Checklist

1. **Authentication**:
   - [ ] Login with valid credentials
   - [ ] Login with invalid credentials
   - [ ] Session persistence
   - [ ] Logout functionality
   - [ ] Password reset flow

2. **Campaign Management**:
   - [ ] Create new campaign
   - [ ] Edit existing campaign
   - [ ] Delete campaign
   - [ ] Schedule campaign
   - [ ] View campaign metrics
   - [ ] Export campaign data

3. **Lead Management**:
   - [ ] Add new lead
   - [ ] Update lead information
   - [ ] Delete lead
   - [ ] Import leads
   - [ ] Export leads
   - [ ] Lead assignment

4. **Team Features**:
   - [ ] Invite team member
   - [ ] Update team member role
   - [ ] Remove team member
   - [ ] Team settings
   - [ ] Team analytics

5. **Analytics**:
   - [ ] View dashboard
   - [ ] Filter data
   - [ ] Export reports
   - [ ] Real-time updates
   - [ ] Custom date ranges

6. **Chatbot**:
   - [ ] General assistance
   - [ ] Analytics help
   - [ ] Navigation commands
   - [ ] Error handling
   - [ ] Context awareness

### Performance Testing

1. **Load Testing**:
   - [ ] Page load times
   - [ ] API response times
   - [ ] Database query performance
   - [ ] Real-time updates

2. **Stress Testing**:
   - [ ] Multiple concurrent users
   - [ ] Large data sets
   - [ ] Network latency
   - [ ] Browser compatibility

### Security Testing

1. **Authentication**:
   - [ ] Session management
   - [ ] Role-based access
   - [ ] Password policies
   - [ ] Token handling

2. **Data Protection**:
   - [ ] Input validation
   - [ ] XSS prevention
   - [ ] CSRF protection
   - [ ] Data encryption

### Browser Compatibility

Tested on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Responsiveness

Tested on:
- iPhone (iOS)
- Android devices
- iPad
- Various screen sizes

### Error Handling

1. **User Errors**:
   - [ ] Invalid input
   - [ ] Missing data
   - [ ] Network issues
   - [ ] Timeout handling

2. **System Errors**:
   - [ ] Database errors
   - [ ] API failures
   - [ ] Authentication issues
   - [ ] File upload errors

### Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots (if applicable)
5. Browser/device information
6. Error messages

### Test Data

Use the sandbox environment for testing:
```bash
# Initialize test data
npm run sandbox:setup

# Reset test data
npm run sandbox:reset
```

Test accounts:
- Admin: admin@winston-ai.com
- Demo: demo@winston-ai.com
- Test: test@winston-ai.com
Password: demo123
