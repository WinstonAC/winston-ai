export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum TeamPermission {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  password?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  teamId?: string | null;
  teamRole?: TeamPermission | null;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  emailSignature?: string | null;
  defaultTemplate?: string | null;
  templates?: any; // JSON type
  createdAt: Date;
  updatedAt: Date;
}
