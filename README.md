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
- **Modern Design**: Consistent with the application's aesthetic
  - Monospace font
  - Clean typography
  - Lime green accent color
  - Dark theme

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

![Chatbot Navigation](public/chatbot-navigation.png)
*Navigating between pages using the chatbot*

### Available Commands

#### Dashboard
- View your lead stats
- Manage your campaigns
- Upload new leads
- Check system status
- View team activity

#### Leads
- View lead details
- Classify leads
- Export lead data
- Go to dashboard

#### Campaigns
- Create new campaign
- Monitor campaign performance
- Adjust campaign settings
- Go to dashboard

#### Team Management
- Invite team member
- View team members
- Manage team permissions
- Go to dashboard

## Example Interactions

### Viewing Lead Stats
```
USER: View lead stats
BOT: Current metrics:
     Leads: 123
     Active campaigns: 5
     Conversion rate: 12%
```

### Creating a Campaign
```
USER: Create new campaign
BOT: New campaign setup:
     1. Select campaign type
     2. Define target audience
     3. Set objectives
```

### Team Management
```
USER: Invite team member
BOT: Team invitation setup:
     1. Enter email address
     2. Select role
     3. Send invitation
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
