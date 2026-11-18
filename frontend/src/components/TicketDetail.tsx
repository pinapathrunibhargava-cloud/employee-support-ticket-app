import React, { useEffect, useState } from 'react';
import { Ticket, Comment, Status, getNextStatus } from '../types/ticket';
import { getTicketById, updateTicketStatus, getComments, addComment } from '../api/ticketApi';
import { getErrorMessage } from '../api/client';
import { usePersona } from '../context/PersonaContext';

interface TicketDetailProps {
  ticketId: number;
  onBack: () => void;
  onEdit: (ticket: Ticket) => void;
}

const LIFECYCLE_STAGES: Status[] = ['Open', 'In Progress', 'Resolved', 'Closed'];

export const TicketDetail: React.FC<TicketDetailProps> = ({
  ticketId,
  onBack,
  onEdit,
}) => {
  const { currentPersona } = usePersona();

  // Ticket State
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState<boolean>(true);
  const [ticketError, setTicketError] = useState<string | null>(null);

  // Status Action State
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [statusActionError, setStatusActionError] = useState<string | null>(null);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState<string | null>(null);

  // Comments State
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // New Comment Form State
  const [newCommentContent, setNewCommentContent] = useState<string>('');
  const [commentValidationError, setCommentValidationError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [commentSuccessMessage, setCommentSuccessMessage] = useState<string | null>(null);

  const fetchTicket = async () => {
    setLoadingTicket(true);
    setTicketError(null);
    try {
      const data = await getTicketById(ticketId);
      setTicket(data);
    } catch (err) {
      setTicketError(getErrorMessage(err));
    } finally {
      setLoadingTicket(false);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    setCommentsError(null);
    try {
      const data = await getComments(ticketId);
      setComments(data);
    } catch (err) {
      setCommentsError(getErrorMessage(err));
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchComments();
  }, [ticketId, currentPersona.userId]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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
        return <span className="priority-tag priority-tag-high">High Priority</span>;
      case 'Medium':
        return <span className="priority-tag priority-tag-medium">Medium Priority</span>;
      case 'Low':
        return <span className="priority-tag priority-tag-low">Low Priority</span>;
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

  const handleStatusTransition = async () => {
    if (!ticket) return;
    const nextStatus = getNextStatus(ticket.status);
    if (!nextStatus) return;

    setUpdatingStatus(true);
    setStatusActionError(null);
    setStatusSuccessMessage(null);

    try {
      const updated = await updateTicketStatus(ticket.id, nextStatus);
      setTicket(updated);
      setStatusSuccessMessage(`Status updated to "${nextStatus}".`);
      setTimeout(() => setStatusSuccessMessage(null), 4000);
    } catch (err) {
      setStatusActionError(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentValidationError(null);
    setCommentSuccessMessage(null);

    const trimmed = newCommentContent.trim();
    if (!trimmed) {
      setCommentValidationError('Comment content cannot be empty.');
      return;
    }

    setSubmittingComment(true);
    try {
      await addComment(ticketId, { content: trimmed });
      setNewCommentContent('');
      setCommentSuccessMessage('Comment added to ticket history.');
      setTimeout(() => setCommentSuccessMessage(null), 4000);
      await fetchComments();
    } catch (err) {
      setCommentValidationError(getErrorMessage(err));
    } finally {
      setSubmittingComment(false);
    }
  };

  // Business Rule Evaluation
  const isEmployee = currentPersona.role === 'EMPLOYEE';
  const isSupportStaff = currentPersona.role === 'SUPPORT_STAFF';
  const isOwner = ticket !== null && ticket.createdBy === currentPersona.userId;
  const isClosed = ticket !== null && ticket.status === 'Closed';
  const canEdit = isEmployee && isOwner && !isClosed;
  const nextStatus = ticket ? getNextStatus(ticket.status) : null;

  // Stepper State Logic
  const getStageState = (stage: Status): 'completed' | 'active' | 'pending' => {
    if (!ticket) return 'pending';
    const currentIdx = LIFECYCLE_STAGES.indexOf(ticket.status);
    const stageIdx = LIFECYCLE_STAGES.indexOf(stage);

    if (ticket.status === 'Closed') {
      return 'completed';
    }
    if (stageIdx < currentIdx) {
      return 'completed';
    }
    if (stageIdx === currentIdx) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <div className="ticket-detail-container">
      {/* Back Navigation Bar */}
      <div className="back-nav-bar">
        <button className="back-link-btn" onClick={onBack} type="button">
          <span>←</span>
          <span>Back to Ticket Queue</span>
        </button>

        {canEdit && (
          <button
            className="btn-secondary-action"
            onClick={() => onEdit(ticket)}
            type="button"
            id="detail-edit-top-btn"
          >
            <span>✏️</span>
            <span>Edit Ticket</span>
          </button>
        )}
      </div>

      {loadingTicket && (
        <div className="loader-overlay">
          <div className="atlas-spinner" />
          <span>Loading ticket details...</span>
        </div>
      )}

      {ticketError && (
        <div className="alert-banner alert-banner-error">
          <div className="alert-content">
            <strong>Access Error:</strong> {ticketError}
          </div>
          <button className="btn-secondary-action" onClick={fetchTicket} type="button">
            Retry
          </button>
        </div>
      )}

      {!loadingTicket && !ticketError && ticket && (
        <div className="two-column-workspace">
          {/* LEFT COLUMN: Main Issue Content & Timeline (70%) */}
          <div className="primary-feed-column">
            {/* Ticket Header & Description Card */}
            <div className="ticket-header-card">
              <div className="ticket-header-tags">
                <span className="ticket-id-tag">#{ticket.id.toString().padStart(2, '0')}</span>
                <span className="category-badge">
                  <span>{getCategoryIcon(ticket.category)}</span>
                  <span>{ticket.category}</span>
                </span>
                {getPriorityBadge(ticket.priority)}
                {getStatusBadge(ticket.status)}
              </div>

              <h1 className="ticket-display-title">{ticket.title}</h1>

              <div className="description-box">
                <div className="description-header">Issue Description</div>
                <div className="description-content">{ticket.description}</div>
              </div>
            </div>

            {/* Activity & Comments Timeline Card */}
            <div className="activity-timeline-card">
              <div className="timeline-card-header">
                <h3 className="timeline-title">
                  <span>💬</span>
                  <span>Discussion & Activity ({comments.length})</span>
                </h3>
              </div>

              {loadingComments && (
                <div className="loader-overlay" style={{ padding: '2rem 1rem' }}>
                  <div className="atlas-spinner" />
                  <span>Loading discussion history...</span>
                </div>
              )}

              {commentsError && (
                <div className="alert-banner alert-banner-error">
                  <div className="alert-content">
                    <strong>Error loading comments:</strong> {commentsError}
                  </div>
                </div>
              )}

              {!loadingComments && !commentsError && comments.length === 0 && (
                <div className="empty-timeline">
                  No comments or notes have been posted on this ticket yet.
                </div>
              )}

              {!loadingComments && !commentsError && comments.length > 0 && (
                <div className="comments-timeline">
                  {comments.map((comment) => (
                    <div key={comment.id} className="timeline-comment-node">
                      <div
                        className={`comment-avatar-bubble ${
                          comment.authorRole === 'EMPLOYEE'
                            ? 'avatar-employee'
                            : 'avatar-support'
                        }`}
                      >
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="comment-bubble-body">
                        <div className="comment-bubble-top">
                          <div className="comment-author-group">
                            <span className="comment-author-name">{comment.author}</span>
                            <span
                              className={`role-pill ${
                                comment.authorRole === 'EMPLOYEE'
                                  ? 'role-pill-employee'
                                  : 'role-pill-support'
                              }`}
                            >
                              {comment.authorRole === 'EMPLOYEE' ? 'Employee' : 'Support Staff'}
                            </span>
                          </div>
                          <span className="comment-timestamp">{formatDate(comment.createdAt)}</span>
                        </div>
                        <div className="comment-text">{comment.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Composer */}
              <div className="comment-composer-box">
                <div className="composer-header">
                  <span>✏️</span>
                  <span>
                    Add a comment as <strong>{currentPersona.name}</strong> ({currentPersona.userId})
                  </span>
                </div>

                {commentSuccessMessage && (
                  <div className="alert-banner alert-banner-success">
                    <div className="alert-content">
                      <span>✓</span>
                      <span>{commentSuccessMessage}</span>
                    </div>
                  </div>
                )}

                {commentValidationError && (
                  <div className="alert-banner alert-banner-error">
                    <div className="alert-content">
                      <span>⚠️</span>
                      <span>{commentValidationError}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddComment}>
                  <textarea
                    id="composer-input"
                    className="composer-textarea"
                    rows={3}
                    placeholder="Provide additional details, diagnostic output, or resolution steps..."
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    disabled={submittingComment}
                  />
                  <div className="composer-footer">
                    <button
                      type="submit"
                      className="btn-primary-action"
                      disabled={submittingComment || !newCommentContent.trim()}
                      id="composer-submit-btn"
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Inspector & Action Panels (30%) */}
          <aside className="inspector-column">
            {/* SUPPORT STAFF ONLY: 4-Stage Lifecycle Stepper */}
            {isSupportStaff && (
              <div className="lifecycle-stepper-card">
                <div className="stepper-header-row">
                  <span className="stepper-title">⚙️ Lifecycle Workflow</span>
                  <span className="role-pill role-pill-support">Staff Action</span>
                </div>

                {statusSuccessMessage && (
                  <div className="alert-banner alert-banner-success" style={{ padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>
                    <div className="alert-content" style={{ fontSize: '0.78rem' }}>
                      <span>✓ {statusSuccessMessage}</span>
                    </div>
                  </div>
                )}

                {statusActionError && (
                  <div className="alert-banner alert-banner-error" style={{ padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>
                    <div className="alert-content" style={{ fontSize: '0.78rem' }}>
                      <span>⚠️ {statusActionError}</span>
                    </div>
                  </div>
                )}

                <div className="stepper-track">
                  {LIFECYCLE_STAGES.map((stage, idx) => {
                    const state = getStageState(stage);
                    return (
                      <div key={stage} className={`step-node step-node-${state}`}>
                        <div className="step-circle">
                          {state === 'completed' ? '✓' : idx + 1}
                        </div>
                        <span>{stage}</span>
                      </div>
                    );
                  })}
                </div>

                {isClosed ? (
                  <div className="terminal-closed-card">
                    <strong>Ticket Closed (Terminal State)</strong>
                    <div>This ticket has completed its resolution lifecycle. No further status changes can be made.</div>
                  </div>
                ) : (
                  <button
                    className="advance-action-btn"
                    onClick={handleStatusTransition}
                    disabled={updatingStatus || !nextStatus}
                    type="button"
                    id="advance-stage-btn"
                  >
                    {updatingStatus ? (
                      'Advancing...'
                    ) : (
                      <>
                        <span>Advance to &quot;{nextStatus}&quot;</span>
                        <span>➔</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Ticket Properties Inspector */}
            <div className="inspector-card">
              <div className="inspector-card-header">
                <span>📋 Ticket Properties</span>
              </div>

              <div className="properties-list">
                <div className="property-row">
                  <span className="property-key">Status</span>
                  <span className="property-val">{getStatusBadge(ticket.status)}</span>
                </div>
                <div className="property-row">
                  <span className="property-key">Priority</span>
                  <span className="property-val">{ticket.priority}</span>
                </div>
                <div className="property-row">
                  <span className="property-key">Category</span>
                  <span className="property-val">
                    {getCategoryIcon(ticket.category)} {ticket.category}
                  </span>
                </div>
                <div className="property-row">
                  <span className="property-key">Requester</span>
                  <span className="property-val property-val-mono">{ticket.createdBy}</span>
                </div>
                <div className="property-row">
                  <span className="property-key">Created</span>
                  <span className="property-val property-val-mono">{formatDate(ticket.createdAt)}</span>
                </div>
                <div className="property-row">
                  <span className="property-key">Updated</span>
                  <span className="property-val property-val-mono">{formatDate(ticket.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* EMPLOYEE ONLY: Edit Actions (If Owner & Not Closed) */}
            {canEdit && (
              <div className="inspector-card">
                <div className="inspector-card-header">
                  <span>✏️ Requester Controls</span>
                </div>
                <button
                  className="btn-edit-inspector"
                  onClick={() => onEdit(ticket)}
                  type="button"
                  id="inspector-edit-ticket-btn"
                >
                  <span>✏️ Edit Ticket Content</span>
                </button>
              </div>
            )}

            {isClosed && (
              <div className="inspector-card" style={{ backgroundColor: '#f8fafc' }}>
                <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                  🔒 <strong>Closed Ticket:</strong> Core ticket attributes are locked against editing. Discussion and resolution notes remain accessible.
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};
