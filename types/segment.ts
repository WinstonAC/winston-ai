export interface Segment {
  id: string;
  name: string;
  description: string;
  filters: SegmentFilter[];
  leadCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  teamId?: string;
}

export interface SegmentFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
  value: string | number | boolean | Date | Array<string | number | boolean | Date>;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array';
  conjunction: 'AND' | 'OR';
} 