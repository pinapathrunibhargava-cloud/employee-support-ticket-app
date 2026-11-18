export type Category = 'Hardware' | 'Software' | 'Network' | 'Access' | 'Other';

export type Priority = 'Low' | 'Medium' | 'High';

export type Status = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export type Role = 'EMPLOYEE' | 'SUPPORT_STAFF';

export interface Persona {
  userId: string;
  name: string;
  role: Role;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketRequest {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
}

export interface Comment {
  id: number;
  ticketId?: number;
  author: string;
  authorRole: Role;
  content: string;
  createdAt: string;
}

export interface CommentRequest {
  content: string;
}

export interface StatusUpdateRequest {
  status: Status;
}

export const getNextStatus = (currentStatus: Status): Status | null => {
  switch (currentStatus) {
    case 'Open':
      return 'In Progress';
    case 'In Progress':
      return 'Resolved';
    case 'Resolved':
      return 'Closed';
    case 'Closed':
    default:
      return null;
  }
};
