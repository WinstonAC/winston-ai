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
- **Context-Aware Responses**: The chatbot provides relevant information based on the current page
- **Navigation**: Clickable topics that can navigate to different sections of the application
- **Real-Time Interaction**: Instant responses to user queries
- **Brutalist Design**: Consistent with the application's aesthetic
  - Monospace font
  - Uppercase text
  - Underscore styling
  - Lime green accent color

### Pages
- **Landing Page**: Minimal design with floating animations
- **Login**: Secure authentication with team support
- **Dashboard**: Overview of leads, campaigns, and team activity
- **Leads**: Lead management and tracking
- **Campaigns**: Campaign creation and monitoring
- **Team Management**: Manage team members and permissions
- **Demo**: Request a personalized demo

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Documentation

For detailed information about the chatbot and its features, visit our [Chatbot Documentation](/docs/chatbot).

### Quick Start with the Chatbot

1. Click the "OPEN_CHAT_" button in the bottom-right corner
2. Select from available topics or type your query
3. Click on navigation options to move between pages
4. Use the "CLEAR_" button to reset the conversation

![Chatbot Navigation](public/chatbot-navigation.png)
*Navigating between pages using the chatbot*

### Available Commands

#### Dashboard
- VIEW_YOUR_LEAD_STATS_
- MANAGE_YOUR_CAMPAIGNS_
- UPLOAD_NEW_LEADS_
- CHECK_SYSTEM_STATUS_
- VIEW_TEAM_ACTIVITY_

#### Leads
- VIEW_LEAD_DETAILS_
- CLASSIFY_LEADS_
- EXPORT_LEAD_DATA_
- GO_TO_DASHBOARD_

#### Campaigns
- CREATE_NEW_CAMPAIGN_
- MONITOR_CAMPAIGN_PERFORMANCE_
- ADJUST_CAMPAIGN_SETTINGS_
- GO_TO_DASHBOARD_

#### Team Management
- INVITE_TEAM_MEMBER_
- VIEW_TEAM_MEMBERS_
- MANAGE_TEAM_PERMISSIONS_
- GO_TO_DASHBOARD_

## Example Interactions

### Viewing Lead Stats
```
USER: VIEW_YOUR_LEAD_STATS_
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

### Team Management
```
USER: INVITE_TEAM_MEMBER_
BOT: TEAM_INVITATION_SETUP_
     1_ENTER_EMAIL_ADDRESS_
     2_SELECT_ROLE_
     3_SEND_INVITATION_
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
