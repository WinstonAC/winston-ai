export interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  body: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PartialTemplate = Partial<Template>; 