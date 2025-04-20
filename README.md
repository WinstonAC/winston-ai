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
