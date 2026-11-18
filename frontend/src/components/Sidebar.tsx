import React from 'react';
import { usePersona } from '../context/PersonaContext';

interface SidebarProps {
  currentView: 'list' | 'detail' | 'create' | 'edit';
  ticketCount: number;
  onNavigateToList: () => void;
  onNavigateToCreate: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  ticketCount,
  onNavigateToList,
  onNavigateToCreate,
}) => {
  const { currentPersona, setPersona, personas } = usePersona();

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  const handlePersonaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = personas.find((p) => p.userId === e.target.value);
    if (selected) {
      setPersona(selected);
    }
  };

  const isEmployee = currentPersona.role === 'EMPLOYEE';

  return (
    <aside className="atlas-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand-container">
        <div className="brand-wrapper" onClick={onNavigateToList} role="button" tabIndex={0}>
          <div className="brand-logo-icon">🔷</div>
          <div className="brand-info">
            <span className="brand-app-name">Atlas ITSM</span>
            <span className="brand-subtext">Service Desk</span>
          </div>
        </div>
        <span className="env-badge">DEMO</span>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-nav-section">
        {isEmployee && (
          <button
            className="sidebar-action-btn"
            onClick={onNavigateToCreate}
            type="button"
            id="sidebar-create-ticket-btn"
          >
            <span>+</span>
            <span>New Ticket</span>
          </button>
        )}

        <div className="sidebar-section-title">Support Queues</div>

        <button
          className={`sidebar-nav-item ${currentView === 'list' ? 'active' : ''}`}
          onClick={onNavigateToList}
          type="button"
          id="sidebar-nav-tickets-btn"
        >
          <div className="nav-item-left">
            <span className="nav-icon">📋</span>
            <span>{isEmployee ? 'My Tickets' : 'All Tickets Queue'}</span>
          </div>
          <span className="nav-badge-count">{ticketCount}</span>
        </button>
      </div>

      {/* Footer Profile & Persona Switcher */}
      <div className="sidebar-footer">
        <div className="profile-card">
          <div
            className={`user-avatar-initials ${
              isEmployee ? 'avatar-employee' : 'avatar-support'
            }`}
          >
            {getInitials(currentPersona.name)}
          </div>
          <div className="profile-meta">
            <div className="profile-name-row">
              <span className="profile-name" title={currentPersona.name}>
                {currentPersona.name}
              </span>
              <span
                className={`role-pill ${
                  isEmployee ? 'role-pill-employee' : 'role-pill-support'
                }`}
              >
                {isEmployee ? 'EMP' : 'STAFF'}
              </span>
            </div>
            <span className="profile-id">{currentPersona.userId}</span>
          </div>
        </div>

        <div className="sidebar-switcher-box">
          <label htmlFor="sidebar-persona-select" className="switcher-label">
            Switch Persona
          </label>
          <select
            id="sidebar-persona-select"
            className="sidebar-persona-select"
            value={currentPersona.userId}
            onChange={handlePersonaChange}
          >
            {personas.map((persona) => (
              <option key={persona.userId} value={persona.userId}>
                {persona.name} ({persona.role === 'EMPLOYEE' ? 'Employee' : 'Support Staff'})
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
};
