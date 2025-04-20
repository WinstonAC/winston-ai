# Technical Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- MongoDB (for local development)

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/winston-ai.git
cd winston-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

## Development

1. Start the development server:
```bash
npm run dev
# or
yarn dev
```

2. Access the application at `http://localhost:3000`

## Testing

Run the test suite:
```bash
npm test
# or
yarn test
```

## Sandbox Environment

The sandbox environment provides a safe space for testing features without affecting production data.

### Setup Sandbox
```bash
npm run setup-sandbox
# or
yarn setup-sandbox
```

### Reset Sandbox
```bash
npm run reset-sandbox
# or
yarn reset-sandbox
```

## Authentication Flow

The application uses NextAuth.js for authentication. The flow includes:
1. User registration
2. Email verification
3. Login
4. Session management
5. Team-based access control

## API Integration

### Available Endpoints
- `/api/auth/*` - Authentication endpoints
- `/api/teams/*` - Team management
- `/api/campaigns/*` - Campaign operations
- `/api/leads/*` - Lead management
- `/api/analytics/*` - Analytics data

### API Documentation
Detailed API documentation is available at `/api/docs` when running in development mode.

## Deployment

### Production Deployment
1. Build the application:
```bash
npm run build
# or
yarn build
```

2. Start the production server:
```bash
npm start
# or
yarn start
```

### Environment Variables for Production
Ensure all required environment variables are set in your production environment:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `EMAIL_SERVER`
- `EMAIL_FROM`

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify MongoDB URI
   - Check network connectivity
   - Ensure MongoDB service is running

2. **Authentication Problems**
   - Clear browser cookies
   - Verify environment variables
   - Check email server configuration

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are properly installed

## Contributing

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git commit -m "Description of your changes"
```

3. Push your changes and create a pull request:
```bash
git push origin feature/your-feature-name
```

## Support

For technical support:
- Check the [GitHub Issues](https://github.com/your-org/winston-ai/issues)
- Contact the development team at dev-support@winston-ai.com 