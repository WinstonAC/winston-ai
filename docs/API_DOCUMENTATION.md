# Winston AI API Documentation

## Authentication

All API requests require authentication using a Bearer token.

```bash
Authorization: Bearer <your_token>
```

### Obtaining a Token
1. Register/Login to get access token
2. Use token in Authorization header
3. Token expires after 24 hours

## Base URL
```
https://api.winston-ai.com/v1
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "company": "Example Corp"
}
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "token": "access_token"
}
```

#### POST /auth/login
Login to get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "access_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Teams

#### GET /teams
Get all teams for the authenticated user.

**Response:**
```json
{
  "teams": [
    {
      "id": "team_id",
      "name": "Team Name",
      "members": [
        {
          "id": "member_id",
          "email": "member@example.com",
          "role": "admin"
        }
      ]
    }
  ]
}
```

#### POST /teams
Create a new team.

**Request Body:**
```json
{
  "name": "New Team",
  "emailDomain": "example.com"
}
```

### Campaigns

#### GET /campaigns
Get all campaigns.

**Query Parameters:**
- `status`: Filter by status (active, paused, completed)
- `teamId`: Filter by team
- `page`: Pagination page number
- `limit`: Items per page

**Response:**
```json
{
  "campaigns": [
    {
      "id": "campaign_id",
      "name": "Campaign Name",
      "status": "active",
      "metrics": {
        "sent": 1000,
        "opened": 500,
        "replied": 100
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

#### POST /campaigns
Create a new campaign.

**Request Body:**
```json
{
  "name": "New Campaign",
  "templateId": "template_id",
  "targetAudience": {
    "filters": {
      "industry": ["tech", "finance"],
      "size": ["small", "medium"]
    }
  },
  "schedule": {
    "startDate": "2024-03-20",
    "endDate": "2024-04-20",
    "timezone": "UTC"
  }
}
```

### Leads

#### GET /leads
Get all leads.

**Query Parameters:**
- `status`: Filter by status (new, contacted, qualified)
- `campaignId`: Filter by campaign
- `page`: Pagination page number
- `limit`: Items per page

**Response:**
```json
{
  "leads": [
    {
      "id": "lead_id",
      "email": "lead@example.com",
      "name": "Lead Name",
      "company": "Company Name",
      "status": "new",
      "score": 85
    }
  ],
  "total": 1000,
  "page": 1,
  "limit": 10
}
```

#### POST /leads
Add new leads.

**Request Body:**
```json
{
  "leads": [
    {
      "email": "lead1@example.com",
      "name": "Lead One",
      "company": "Company One"
    },
    {
      "email": "lead2@example.com",
      "name": "Lead Two",
      "company": "Company Two"
    }
  ]
}
```

### Analytics

#### GET /analytics/campaigns/{campaignId}
Get campaign analytics.

**Response:**
```json
{
  "campaignId": "campaign_id",
  "metrics": {
    "sent": 1000,
    "opened": 500,
    "replied": 100,
    "converted": 50
  },
  "timeline": [
    {
      "date": "2024-03-20",
      "sent": 100,
      "opened": 50,
      "replied": 10
    }
  ]
}
```

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

- 100 requests per minute per token
- 1000 requests per hour per token

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1625097600
```

## Webhooks

### Available Events
- `campaign.started`
- `campaign.completed`
- `lead.created`
- `lead.updated`
- `email.sent`
- `email.opened`
- `email.replied`

### Webhook Payload
```json
{
  "event": "campaign.started",
  "data": {
    "campaignId": "campaign_id",
    "startedAt": "2024-03-20T10:00:00Z"
  },
  "timestamp": "2024-03-20T10:00:00Z"
}
```

## SDKs

Official SDKs available for:
- JavaScript/TypeScript
- Python
- Ruby
- Java

Example using JavaScript SDK:
```javascript
const winston = require('winston-ai');

const client = new winston.Client({
  token: 'your_token'
});

// Get campaigns
const campaigns = await client.campaigns.list();

// Create a new lead
const lead = await client.leads.create({
  email: 'lead@example.com',
  name: 'Lead Name'
});
```

## Support

For API support:
- Email: api-support@winston-ai.com
- Documentation: [docs.winston-ai.com](https://docs.winston-ai.com)
- GitHub: [github.com/winston-ai/api](https://github.com/winston-ai/api) 