
import { apiClient } from './client';
import { Ticket, TicketRequest, Comment, CommentRequest, Status } from '../types/ticket';

export const getTickets = async (): Promise<Ticket[]> => {
  const response = await apiClient.get<Ticket[]>('/api/tickets');
  return response.data;
};

export const getTicketById = async (id: number): Promise<Ticket> => {
  const response = await apiClient.get<Ticket>(`/api/tickets/${id}`);
  return response.data;
};

export const createTicket = async (data: TicketRequest): Promise<Ticket> => {
  const response = await apiClient.post<Ticket>('/api/tickets', data);
  return response.data;
};

export const updateTicket = async (id: number, data: TicketRequest): Promise<Ticket> => {
  const response = await apiClient.put<Ticket>(`/api/tickets/${id}`, data);
  return response.data;
};

export const updateTicketStatus = async (id: number, status: Status): Promise<Ticket> => {
  const response = await apiClient.patch<Ticket>(`/api/tickets/${id}/status`, { status });
  return response.data;
};

export const getComments = async (ticketId: number): Promise<Comment[]> => {
  const response = await apiClient.get<Comment[]>(`/api/tickets/${ticketId}/comments`);
  return response.data;
};

export const addComment = async (ticketId: number, data: CommentRequest): Promise<Comment> => {
  const response = await apiClient.post<Comment>(`/api/tickets/${ticketId}/comments`, data);
  return response.data;
};
