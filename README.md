# Winston AI

Winston AI is an AI-powered sales assistant that helps manage leads, campaigns, and automate sales processes.

![Winston AI Chatbot](public/chatbot-screenshot.png)
*The chatbot in action on the dashboard page*

## Features

### Team Management
- **Team Member Invitation**: Invite team members via email
- **Team Dashboard**: Manage team members and their roles
- **Secure Authentication**: Supabase-powered authentication with magic links and social providers

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
- **Sign In**: Secure authentication with magic links
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
   npm install
   ```
4. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Required environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Sandbox Testing

The sandbox environment provides a pre-configured testing environment with sample data and users. This is ideal for:
- Testing new features
- Demonstrating the application
- Training new team members
- Running automated tests

### Setting Up the Sandbox

1. **Prerequisites**:
   - Supabase project (local or cloud)
   - Node.js v18.18.0 or later
   - All dependencies installed (`npm install`)

2. **Database Setup**:
   ```bash
   # Run Supabase migrations
   npx supabase db push
   ```

3. **Environment Configuration**:
   Create a `.env.local` file with the following variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
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
   - Demo User:
     - Email: demo@winston-ai.com
   - Test User:
     - Email: test@winston-ai.com

   Note: Use magic links to sign in - no passwords required!

3. **Sample Data**:
   - 15 leads per user
   - Various lead statuses (Pending, Sent, Opened, etc.)
   - Sample email templates
   - Campaign metrics
   - Team activities

### Testing Workflows

1. **Authentication Testing**:
   - Test magic link sign-in
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
   - Verify Supabase project is running
   - Check environment variables
   - Ensure database migrations are up to date

2. **Authentication Problems**:
   - Verify Supabase URL and anon key
   - Check email configuration in Supabase dashboard
   - Clear browser cookies if needed

3. **Data Reset**:
   If you need to reset the sandbox data:
   ```bash
   npm run sandbox:reset
   npm run sandbox:setup
   ```

4. **Common Errors**:
   - "Failed to fetch": Check Supabase connection
   - "Invalid credentials": Verify magic link
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

2. **Sign In**:
   Use one of these test accounts:
   - Admin Account (Full Access):
     - Email: admin@winston-ai.com
   - Demo Account (Limited Access):
     - Email: demo@winston-ai.com
   - Test Account (Basic Access):
     - Email: test@winston-ai.com

   You'll receive a magic link in your email to sign in securely.

### What to Test

1. **Basic Navigation**:
   - Can you sign in successfully with the magic link?
   - Can you see the dashboard after signing in?
   - Does the chatbot respond to your questions?

## Quick Reference Guide

### Login Information
| Account Type | Email | Access Level |
|-------------|-------|--------------|
| Admin | admin@winston-ai.com | Full Access |
| Demo | demo@winston-ai.com | Limited Access |
| Test | test@winston-ai.com | Basic Access |

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
   - Verify email and magic link
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
