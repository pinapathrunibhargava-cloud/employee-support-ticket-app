import React from 'react';
import { usePersona } from '../context/PersonaContext';

interface HeaderProps {
  currentView: 'list' | 'detail' | 'create' | 'edit';
  activeTicketId?: number | null;
  onNavigateToList: () => void;
  onNavigateToCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  activeTicketId,
  onNavigateToList,
  onNavigateToCreate,
}) => {
  const { currentPersona } = usePersona();
  const isEmployee = currentPersona.role === 'EMPLOYEE';

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case 'list':
        return isEmployee ? 'My Tickets' : 'Global Queue';
      case 'detail':
        return activeTicketId ? `Ticket #${activeTicketId}` : 'Ticket Details';
      case 'create':
        return 'Create New Ticket';
      case 'edit':
        return activeTicketId ? `Edit Ticket #${activeTicketId}` : 'Edit Ticket';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="atlas-topbar">
      <div className="topbar-left">
        <nav className="breadcrumb-trail" aria-label="Breadcrumb">
          <span className="breadcrumb-root" onClick={onNavigateToList}>
            Service Desk
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-root" onClick={onNavigateToList}>
            Tickets
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{getBreadcrumbTitle()}</span>
        </nav>
      </div>

      <div className="topbar-right">
        <div className="role-context-indicator">
          <span
            className={`indicator-dot ${
              isEmployee ? 'indicator-employee' : 'indicator-support'
            }`}
          />
          <span>
            {isEmployee ? 'Workplace Employee View' : 'IT Service Staff Queue'}
          </span>
        </div>

        {isEmployee && currentView !== 'create' && (
          <button
            className="topbar-action-btn"
            onClick={onNavigateToCreate}
            type="button"
            id="topbar-create-ticket-btn"
          >
            <span>+</span>
            <span>New Ticket</span>
          </button>
        )}
      </div>
    </header>
  );
};
