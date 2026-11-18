import React, { useState, useEffect } from 'react';
import { Category, Priority, Ticket, TicketRequest } from '../types/ticket';
import { getTicketById, updateTicket } from '../api/ticketApi';
import { getErrorMessage } from '../api/client';
import { usePersona } from '../context/PersonaContext';

interface TicketEditProps {
  ticket?: Ticket | null;
  ticketId?: number | null;
  onSuccess: (updatedTicket: Ticket) => void;
  onCancel: () => void;
}

const CATEGORIES: Category[] = ['Hardware', 'Software', 'Network', 'Access', 'Other'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export const TicketEdit: React.FC<TicketEditProps> = ({
  ticket: initialTicket,
  ticketId,
  onSuccess,
  onCancel,
}) => {
  const { currentPersona } = usePersona();

  const [activeTicket, setActiveTicket] = useState<Ticket | null>(initialTicket || null);
  const [loading, setLoading] = useState<boolean>(!initialTicket && !!ticketId);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialTicket?.title || '');
  const [description, setDescription] = useState(initialTicket?.description || '');
  const [category, setCategory] = useState<Category>(initialTicket?.category || 'Hardware');
  const [priority, setPriority] = useState<Priority>(initialTicket?.priority || 'Medium');

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch ticket if only ticketId was provided (e.g. from direct URL navigation or refresh)
  useEffect(() => {
    if (!initialTicket && ticketId) {
      setLoading(true);
      getTicketById(ticketId)
        .then((fetched) => {
          setActiveTicket(fetched);
          setTitle(fetched.title);
          setDescription(fetched.description);
          setCategory(fetched.category);
          setPriority(fetched.priority);
        })
        .catch((err) => {
          setLoadError(getErrorMessage(err));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [initialTicket, ticketId]);

  if (loading) {
    return (
      <div className="loader-overlay" style={{ padding: '4rem 2rem' }}>
        <div className="atlas-spinner" />
        <span>Loading ticket for editing...</span>
      </div>
    );
  }

  if (loadError || !activeTicket) {
    return (
      <div className="alert-banner alert-banner-error" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="alert-content">
          <span>⚠️ {loadError || 'Unable to load ticket details for editing.'}</span>
        </div>
        <button className="btn-secondary-action" onClick={onCancel} type="button">
          Back
        </button>
      </div>
    );
  }

  // Business Rule Validations
  if (currentPersona.role !== 'EMPLOYEE') {
    return (
      <div className="alert-banner alert-banner-error" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="alert-content">
          <span>⚠️ Support staff cannot edit ticket contents. Updates should be communicated via status progression and comments.</span>
        </div>
        <button className="btn-secondary-action" onClick={onCancel} type="button">
          Back
        </button>
      </div>
    );
  }

  if (activeTicket.createdBy !== currentPersona.userId) {
    return (
      <div className="alert-banner alert-banner-error" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="alert-content">
          <span>⚠️ You are only authorized to edit tickets you submitted.</span>
        </div>
        <button className="btn-secondary-action" onClick={onCancel} type="button">
          Back
        </button>
      </div>
    );
  }

  if (activeTicket.status === 'Closed') {
    return (
      <div className="alert-banner alert-banner-error" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="alert-content">
          <span>🔒 Closed tickets are locked and cannot be edited.</span>
        </div>
        <button className="btn-secondary-action" onClick={onCancel} type="button">
          Back
        </button>
      </div>
    );
  }

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!title.trim()) {
      errors.title = 'Title cannot be empty.';
    } else if (title.length > 100) {
      errors.title = `Title must not exceed 100 characters (currently ${title.length}).`;
    }

    if (!description.trim()) {
      errors.description = 'Description cannot be empty.';
    }

    if (!category) {
      errors.category = 'Category is required.';
    }

    if (!priority) {
      errors.priority = 'Priority is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload: TicketRequest = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      };

      const updated = await updateTicket(activeTicket.id, payload);
      onSuccess(updated);
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-shell-card">
      <div className="form-shell-header">
        <h2>Edit Ticket #{activeTicket.id.toString().padStart(2, '0')}</h2>
        <p className="form-shell-subtitle">
          Status: <strong>{activeTicket.status}</strong> (Status is managed exclusively by IT Support)
        </p>
      </div>

      <div className="form-shell-body">
        {apiError && (
          <div className="alert-banner alert-banner-error" style={{ marginBottom: '1.5rem' }}>
            <div className="alert-content">
              <strong>Update Failed:</strong> {apiError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title Field with Character Counter */}
          <div className="form-field-group">
            <div className="form-field-label-row">
              <label htmlFor="edit-ticket-title" className="field-label">
                Issue Summary / Title <span className="required-mark">*</span>
              </label>
              <span
                className={`live-char-counter ${
                  title.length > 100 ? 'char-counter-danger' : ''
                }`}
              >
                {title.length} / 100
              </span>
            </div>
            <input
              id="edit-ticket-title"
              type="text"
              className={`input-enterprise ${
                validationErrors.title ? 'field-error-ring' : ''
              }`}
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
            {validationErrors.title && (
              <span className="field-error-msg">{validationErrors.title}</span>
            )}
          </div>

          {/* Category & Priority Grid */}
          <div className="form-row-grid">
            <div className="form-field-group" style={{ marginBottom: 0 }}>
              <div className="form-field-label-row">
                <label htmlFor="edit-ticket-category" className="field-label">
                  Category <span className="required-mark">*</span>
                </label>
              </div>
              <select
                id="edit-ticket-category"
                className={`select-enterprise ${
                  validationErrors.category ? 'field-error-ring' : ''
                }`}
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                disabled={submitting}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {validationErrors.category && (
                <span className="field-error-msg">{validationErrors.category}</span>
              )}
            </div>

            <div className="form-field-group" style={{ marginBottom: 0 }}>
              <div className="form-field-label-row">
                <label htmlFor="edit-ticket-priority" className="field-label">
                  Urgency / Priority <span className="required-mark">*</span>
                </label>
              </div>
              <select
                id="edit-ticket-priority"
                className={`select-enterprise ${
                  validationErrors.priority ? 'field-error-ring' : ''
                }`}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                disabled={submitting}
              >
                {PRIORITIES.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri}
                  </option>
                ))}
              </select>
              {validationErrors.priority && (
                <span className="field-error-msg">{validationErrors.priority}</span>
              )}
            </div>
          </div>

          {/* Description Textarea */}
          <div className="form-field-group">
            <div className="form-field-label-row">
              <label htmlFor="edit-ticket-desc" className="field-label">
                Detailed Description <span className="required-mark">*</span>
              </label>
            </div>
            <textarea
              id="edit-ticket-desc"
              className={`textarea-enterprise ${
                validationErrors.description ? 'field-error-ring' : ''
              }`}
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
            {validationErrors.description && (
              <span className="field-error-msg">{validationErrors.description}</span>
            )}
          </div>

          {/* Footer Actions */}
          <div className="form-footer-actions">
            <button
              type="button"
              className="btn-secondary-action"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-action"
              disabled={submitting}
              id="save-ticket-form-btn"
            >
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
