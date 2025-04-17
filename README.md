# Winston AI

A brutalist AI outreach engine that books calls while you sleep. Upload your leads, let AI handle personalized outreach, and wake up to booked calls.

![Winston AI](public/screenshot.png)

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

Create a `.env.local` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
FROM_EMAIL=winston@yourdomain.com

# OpenAI API
OPENAI_API_KEY=your-openai-key
```

## Features

### 📊 Lead Management
- CSV upload with drag-and-drop
- Preview leads before sending
- Track delivery status

### 🤖 AI-Powered Outreach
- GPT-powered reply classification
- Personalized email templates
- Automated follow-ups

### 📈 Campaign Tracking
- Email open tracking
- Click-through rates
- Reply monitoring
- Calendar booking stats

## Documentation

Visit our [documentation](https://your-domain.com/docs) for:
- Detailed setup guide
- API reference
- Best practices
- FAQ

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- OpenAI API
- Nodemailer

## License

© 2024 Cylon Digital Consulting. All rights reserved.
