import React, { useState } from 'react';
import { Category, Priority, TicketRequest } from '../types/ticket';
import { createTicket } from '../api/ticketApi';
import { getErrorMessage } from '../api/client';
import { usePersona } from '../context/PersonaContext';

interface TicketCreateProps {
  onSuccess: (newTicketId: number) => void;
  onCancel: () => void;
}

const CATEGORIES: Category[] = ['Hardware', 'Software', 'Network', 'Access', 'Other'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export const TicketCreate: React.FC<TicketCreateProps> = ({ onSuccess, onCancel }) => {
  const { currentPersona } = usePersona();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Hardware');
  const [priority, setPriority] = useState<Priority>('Medium');

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (currentPersona.role !== 'EMPLOYEE') {
    return (
      <div className="alert-banner alert-banner-error" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="alert-content">
          <span>⚠️ Support staff members cannot create tickets. Please switch to an employee persona.</span>
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

      const created = await createTicket(payload);
      onSuccess(created.id);
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-shell-card">
      <div className="form-shell-header">
        <h2>Submit New Support Request</h2>
        <p className="form-shell-subtitle">
          Reporting issue as <strong>{currentPersona.name}</strong> ({currentPersona.userId})
        </p>
      </div>

      <div className="form-shell-body">
        <div className="form-helper-tip">
          <span>💡</span>
          <div>
            <strong>Resolution Tip:</strong> Include hardware model, software version, exact error messages, and reproducible steps to help our support engineering team resolve your request promptly.
          </div>
        </div>

        {apiError && (
          <div className="alert-banner alert-banner-error" style={{ marginBottom: '1.5rem' }}>
            <div className="alert-content">
              <strong>Ticket Submission Failed:</strong> {apiError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title Field with Character Counter */}
          <div className="form-field-group">
            <div className="form-field-label-row">
              <label htmlFor="create-ticket-title" className="field-label">
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
              id="create-ticket-title"
              type="text"
              className={`input-enterprise ${
                validationErrors.title ? 'field-error-ring' : ''
              }`}
              placeholder="e.g. Laptop not charging when connected to dock"
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
                <label htmlFor="create-ticket-category" className="field-label">
                  Category <span className="required-mark">*</span>
                </label>
              </div>
              <select
                id="create-ticket-category"
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
                <label htmlFor="create-ticket-priority" className="field-label">
                  Urgency / Priority <span className="required-mark">*</span>
                </label>
              </div>
              <select
                id="create-ticket-priority"
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
              <label htmlFor="create-ticket-desc" className="field-label">
                Detailed Description <span className="required-mark">*</span>
              </label>
            </div>
            <textarea
              id="create-ticket-desc"
              className={`textarea-enterprise ${
                validationErrors.description ? 'field-error-ring' : ''
              }`}
              rows={6}
              placeholder="Provide a comprehensive explanation of what you were doing when the issue occurred, error codes, and symptoms..."
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
              id="submit-ticket-form-btn"
            >
              {submitting ? 'Submitting Request...' : 'Submit Support Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
