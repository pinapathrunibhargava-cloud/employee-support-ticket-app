import React, { useEffect, useState } from 'react';
import { Ticket, Status } from '../types/ticket';
import { getTickets } from '../api/ticketApi';
import { getErrorMessage } from '../api/client';
import { usePersona } from '../context/PersonaContext';

interface TicketListProps {
  onSelectTicket: (ticketId: number) => void;
  onNavigateToCreate: () => void;
  onTicketsLoaded?: (count: number) => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  onSelectTicket,
  onNavigateToCreate,
  onTicketsLoaded,
}) => {
  const { currentPersona } = usePersona();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTickets();
      setTickets(data);
      if (onTicketsLoaded) {
        onTicketsLoaded(data.length);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentPersona.userId]);

  // Compute 4 KPI summary metrics from existing in-memory tickets array
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedClosedCount = tickets.filter(
    (t) => t.status === 'Resolved' || t.status === 'Closed'
  ).length;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'Open':
        return (
          <span className="status-pill status-pill-open">
            <span className="status-dot" />
            Open
          </span>
        );
      case 'In Progress':
        return (
          <span className="status-pill status-pill-in-progress">
            <span className="status-dot" />
            In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="status-pill status-pill-resolved">
            <span className="status-dot" />
            Resolved
          </span>
        );
      case 'Closed':
        return (
          <span className="status-pill status-pill-closed">
            <span className="status-dot" />
            Closed
          </span>
        );
      default:
        return <span className="status-pill">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <span className="priority-tag priority-tag-high">High</span>;
      case 'Medium':
        return <span className="priority-tag priority-tag-medium">Medium</span>;
      case 'Low':
        return <span className="priority-tag priority-tag-low">Low</span>;
      default:
        return <span className="priority-tag">{priority}</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hardware':
        return '🖥️';
      case 'Software':
        return '💾';
      case 'Network':
        return '🌐';
      case 'Access':
        return '🔑';
      case 'Other':
      default:
        return '📦';
    }
  };

  const isEmployee = currentPersona.role === 'EMPLOYEE';

  return (
    <div className="ticket-dashboard-view">
      {/* 4 KPI Summary Metric Cards Strip */}
      <div className="metrics-strip">
        <div className="metric-kpi-card">
          <div className="metric-kpi-content">
            <span className="metric-kpi-label">Total Tickets</span>
            <span className="metric-kpi-value">{totalCount}</span>
            <span className="metric-kpi-subtitle">
              {isEmployee ? 'Submitted by you' : 'Entire organization'}
            </span>
          </div>
          <div className="metric-kpi-icon-wrap icon-wrap-total">📋</div>
        </div>

        <div className="metric-kpi-card">
          <div className="metric-kpi-content">
            <span className="metric-kpi-label">Open</span>
            <span className="metric-kpi-value">{openCount}</span>
            <span className="metric-kpi-subtitle">Awaiting triage</span>
          </div>
          <div className="metric-kpi-icon-wrap icon-wrap-open">🔵</div>
        </div>

        <div className="metric-kpi-card">
          <div className="metric-kpi-content">
            <span className="metric-kpi-label">In Progress</span>
            <span className="metric-kpi-value">{inProgressCount}</span>
            <span className="metric-kpi-subtitle">Active investigation</span>
          </div>
          <div className="metric-kpi-icon-wrap icon-wrap-prog">🟡</div>
        </div>

        <div className="metric-kpi-card">
          <div className="metric-kpi-content">
            <span className="metric-kpi-label">Resolved / Closed</span>
            <span className="metric-kpi-value">{resolvedClosedCount}</span>
            <span className="metric-kpi-subtitle">Completed lifecycle</span>
          </div>
          <div className="metric-kpi-icon-wrap icon-wrap-res">🟢</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="table-card-container">
        <div className="table-card-header">
          <div className="queue-title-group">
            <h2>{isEmployee ? 'My Support Tickets' : 'All Support Tickets Queue'}</h2>
            <p className="queue-subtitle">
              {isEmployee
                ? `Tracking ${tickets.length} tickets filed under ${currentPersona.name} (${currentPersona.userId})`
                : `Active IT service queue: monitoring all organizational requests`}
            </p>
          </div>

          <div className="queue-header-actions">
            {isEmployee && (
              <button
                className="btn-primary-action"
                onClick={onNavigateToCreate}
                type="button"
                id="table-create-ticket-btn"
              >
                <span>+</span>
                <span>New Ticket</span>
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="loader-overlay">
            <div className="atlas-spinner" />
            <span>Loading tickets from service desk...</span>
          </div>
        )}

        {error && (
          <div className="alert-banner alert-banner-error" style={{ margin: '1.5rem' }}>
            <div className="alert-content">
              <strong>Error fetching tickets:</strong> {error}
            </div>
            <button className="btn-secondary-action" onClick={fetchTickets} type="button">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && tickets.length === 0 && (
          <div className="empty-queue-slate">
            <div className="empty-icon-glyph">📭</div>
            <h3 className="empty-title">No support tickets found</h3>
            <p className="empty-caption">
              {isEmployee
                ? 'You currently have no submitted support tickets.'
                : 'There are currently no tickets in the service queue.'}
            </p>
            {isEmployee && (
              <button
                className="btn-primary-action"
                onClick={onNavigateToCreate}
                type="button"
                style={{ margin: '0 auto' }}
              >
                Create Your First Ticket
              </button>
            )}
          </div>
        )}

        {!loading && !error && tickets.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="ticket-data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Ticket ID</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Requester</th>
                  <th>Created Date</th>
                  <th>Updated Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket.id)}
                    className="ticket-row-interactive"
                  >
                    <td className="td-ticket-id">#{ticket.id.toString().padStart(2, '0')}</td>
                    <td className="td-ticket-subject">
                      <span className="subject-line-clamp" title={ticket.title}>
                        {ticket.title}
                      </span>
                    </td>
                    <td>
                      <span className="category-badge">
                        <span>{getCategoryIcon(ticket.category)}</span>
                        <span>{ticket.category}</span>
                      </span>
                    </td>
                    <td>{getPriorityBadge(ticket.priority)}</td>
                    <td>{getStatusBadge(ticket.status)}</td>
                    <td>
                      <span className="requester-pill">
                        <span className="requester-mini-avatar">
                          {ticket.createdBy.charAt(0).toUpperCase()}
                        </span>
                        <span>{ticket.createdBy}</span>
                      </span>
                    </td>
                    <td className="td-tabular-date">{formatDate(ticket.createdAt)}</td>
                    <td className="td-tabular-date">{formatDate(ticket.updatedAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-secondary-action"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(ticket.id);
                        }}
                        type="button"
                      >
                        View ➔
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
