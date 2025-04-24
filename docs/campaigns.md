# Campaign Management

This document provides an overview of the campaign management functionality in the application.

## Overview

Campaigns are used to manage email marketing campaigns, including creating, updating, and tracking their performance. Each campaign is associated with an email template and a target audience segment.

## Data Structure

### Campaign Model

```typescript
interface Campaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  targetAudience: {
    segment: string;
    filters: Record<string, any>;
  };
  schedule: {
    type: 'immediate' | 'scheduled';
    date?: string;
    time?: string;
  };
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
    bounced: number;
  };
  createdAt: string;
  updatedAt: string;
  userId: string;
  teamId?: string;
}
```

## API Endpoints

### GET /api/campaigns

Retrieves all campaigns for the authenticated user.

**Response:**
```json
{
  "campaigns": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "status": "string",
      "metrics": {
        "sent": number,
        "opened": number,
        "clicked": number,
        "replied": number,
        "bounced": number
      },
      "createdAt": "string"
    }
  ]
}
```

### POST /api/campaigns

Creates a new campaign.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "templateId": "string",
  "targetAudience": {
    "segment": "string",
    "filters": {}
  },
  "schedule": {
    "type": "immediate" | "scheduled",
    "date": "string",
    "time": "string"
  }
}
```

**Response:**
```json
{
  "campaign": {
    "id": "string",
    "name": "string",
    "description": "string",
    "status": "string",
    "createdAt": "string"
  }
}
```

### PUT /api/campaigns/[id]

Updates an existing campaign.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "templateId": "string",
  "targetAudience": {
    "segment": "string",
    "filters": {}
  },
  "schedule": {
    "type": "immediate" | "scheduled",
    "date": "string",
    "time": "string"
  }
}
```

**Response:**
```json
{
  "campaign": {
    "id": "string",
    "name": "string",
    "description": "string",
    "status": "string",
    "updatedAt": "string"
  }
}
```

### DELETE /api/campaigns/[id]

Deletes a campaign.

**Response:**
```json
{
  "success": true
}
```

## Components

### CampaignCreator

The `CampaignCreator` component provides a user interface for creating and managing campaigns.

#### Props

```typescript
interface CampaignCreatorProps {
  leads: Lead[];
  templates: EmailTemplate[];
  segments: Segment[];
  onCreateCampaign: (campaign: CampaignInput) => Promise<void>;
  onUpdateCampaign: (id: string, campaign: CampaignInput) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
}
```

#### Usage

```tsx
import CampaignCreator from '@/components/CampaignCreator';

const MyComponent = () => {
  const handleCreateCampaign = async (campaign) => {
    // Handle campaign creation
  };

  const handleUpdateCampaign = async (id, campaign) => {
    // Handle campaign update
  };

  const handleDeleteCampaign = async (id) => {
    // Handle campaign deletion
  };

  return (
    <CampaignCreator
      leads={leads}
      templates={templates}
      segments={segments}
      onCreateCampaign={handleCreateCampaign}
      onUpdateCampaign={handleUpdateCampaign}
      onDeleteCampaign={handleDeleteCampaign}
    />
  );
};
```

## Error Handling

The API endpoints and components handle various error cases:

1. Authentication errors (401)
2. Validation errors (400)
3. Not found errors (404)
4. Server errors (500)

Error messages are displayed to the user using toast notifications.

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- Campaign creation: 5 requests per minute
- Campaign updates: 10 requests per minute
- Campaign deletion: 3 requests per minute

## Testing

The campaign functionality is thoroughly tested using Jest and React Testing Library. Tests cover:

1. Component rendering
2. Form validation
3. API integration
4. Error handling
5. User interactions

To run the tests:

```bash
npm test
```

## Security Considerations

1. All API endpoints require authentication
2. Users can only access their own campaigns
3. Team members can access team campaigns based on their permissions
4. Input validation is performed on all API endpoints
5. Rate limiting is implemented to prevent abuse

## Best Practices

1. Always validate campaign data before submission
2. Use appropriate error handling and user feedback
3. Implement proper loading states during API calls
4. Follow the established naming conventions
5. Keep campaign data up to date with the latest metrics 