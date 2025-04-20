# Winston AI - Developer Documentation

## Project Structure

```
winston-ai/
├── components/         # React components
├── pages/             # Next.js pages
├── prisma/            # Database schema and migrations
├── lib/               # Utility functions and shared code
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── styles/            # Global styles and Tailwind config
├── public/            # Static assets
├── __tests__/         # Test files
└── scripts/           # Build and utility scripts
```

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Testing**: Jest, React Testing Library

## Development Setup

1. **Prerequisites**
   - Node.js (v18 or higher)
   - PostgreSQL
   - npm or yarn

2. **Environment Setup**
   ```bash
   # Copy environment variables
   cp .env.example .env.local
   
   # Install dependencies
   npm install
   
   # Set up database
   npx prisma migrate dev
   
   # Run development server
   npm run dev
   ```

3. **Environment Variables**
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Secret for NextAuth.js
   - `NEXTAUTH_URL`: Base URL for authentication
   - `EMAIL_SERVER_*`: Email service configuration
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

## Key Features Implementation

### Authentication & Team Management

- **NextAuth.js Configuration**: `pages/api/auth/[...nextauth].ts`
- **Team Schema**: `prisma/schema.prisma`
- **Team API Routes**: `pages/api/team/*`
- **Team Components**: `components/team/*`

### Chatbot Implementation

- **Chatbot Component**: `components/Chatbot.tsx`
- **Chatbot Logic**: `lib/chatbot.ts`
- **Chatbot Types**: `types/chatbot.ts`

### Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  team          Team?     @relation(fields: [teamId], references: [id])
  teamId        String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Team {
  id            String    @id @default(cuid())
  name          String
  members       User[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  ADMIN
  USER
}
```

## API Endpoints

### Authentication
- `POST /api/auth/signin`
- `POST /api/auth/signout`
- `GET /api/auth/session`

### Team Management
- `GET /api/team` - Get team details
- `POST /api/team/invite` - Invite team member
- `PUT /api/team/member/:id` - Update team member role
- `DELETE /api/team/member/:id` - Remove team member

### Chatbot
- `POST /api/chatbot/query` - Process chatbot queries
- `GET /api/chatbot/context` - Get current page context

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.tsx
```

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

## Contributing Guidelines

1. **Branch Naming**
   - Feature branches: `feature/description`
   - Bug fixes: `fix/description`
   - Documentation: `docs/description`

2. **Commit Messages**
   - Use conventional commits format
   - Example: `feat: add team management feature`

3. **Code Style**
   - Follow TypeScript best practices
   - Use ESLint and Prettier
   - Write unit tests for new features

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Verify `DATABASE_URL` in `.env.local`
   - Check PostgreSQL service status
   - Run `npx prisma generate` if schema changes

2. **Authentication**
   - Verify OAuth credentials
   - Check session configuration
   - Clear browser cookies if needed

3. **Chatbot**
   - Check context provider setup
   - Verify API endpoint responses
   - Review error logs in console

## Support

For development support:
- Check the project's GitHub issues
- Review the documentation
- Contact the development team 