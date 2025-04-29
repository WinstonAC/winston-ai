export interface Template {
  id: string;
  name: string;
  content: string;
  type: 'email' | 'sms' | 'push';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  assets?: TemplateAsset[];
  sharedWith?: TemplateShare[];
}

export interface TemplateAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateShare {
  id: string;
  templateId: string;
  userId: string;
  permission: 'view' | 'edit' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export type PartialTemplate = Partial<Template>; 