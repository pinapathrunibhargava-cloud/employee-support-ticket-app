import React, { useState, useEffect } from 'react';
import { PersonaProvider, usePersona } from './context/PersonaContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { TicketCreate } from './components/TicketCreate';
import { TicketEdit } from './components/TicketEdit';
import { Ticket } from './types/ticket';

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

const getInitialTicketId = (): number | null => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const ticketParam = params.get('ticket');
    if (ticketParam) {
      const parsed = parseInt(ticketParam, 10);
      return isNaN(parsed) ? null : parsed;
    }
  }
  return null;
};

const getInitialView = (): ViewMode => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ticket')) return 'detail';
    const viewParam = params.get('view') as ViewMode;
    if (viewParam && ['list', 'detail', 'create', 'edit'].includes(viewParam)) {
      return viewParam;
    }
  }
  return 'list';
};

const MainApp: React.FC = () => {
  const { currentPersona } = usePersona();
  const [view, setView] = useState<ViewMode>(getInitialView);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(getInitialTicketId);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [ticketCount, setTicketCount] = useState<number>(0);

  // Clear transient success notification after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Adjust view state when persona switches
  useEffect(() => {
    if (currentPersona.role === 'SUPPORT_STAFF' && (view === 'create' || view === 'edit')) {
      setView('list');
      setSelectedTicketId(null);
      setEditingTicket(null);
    }
  }, [currentPersona.userId, currentPersona.role, view]);

  const handleSelectTicket = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setView('detail');
  };

  const handleNavigateToList = () => {
    setView('list');
    setSelectedTicketId(null);
    setEditingTicket(null);
  };

  const handleNavigateToCreate = () => {
    if (currentPersona.role === 'EMPLOYEE') {
      setView('create');
      setSelectedTicketId(null);
      setEditingTicket(null);
    }
  };

  const handleStartEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setView('edit');
  };

  const handleCreateSuccess = (newTicketId: number) => {
    setSuccessMessage(`Ticket #${newTicketId} created successfully.`);
    setSelectedTicketId(newTicketId);
    setView('detail');
  };

  const handleEditSuccess = (updatedTicket: Ticket) => {
    setSuccessMessage(`Ticket #${updatedTicket.id} updated successfully.`);
    setSelectedTicketId(updatedTicket.id);
    setView('detail');
  };

  return (
    <div className="atlas-app-layout">
      {/* Fixed Enterprise Sidebar */}
      <Sidebar
        currentView={view}
        ticketCount={ticketCount}
        onNavigateToList={handleNavigateToList}
        onNavigateToCreate={handleNavigateToCreate}
      />

      {/* Main Content Pane */}
      <div className="atlas-main-content">
        {/* Top Navigation Bar with Breadcrumbs & Context */}
        <Header
          currentView={view}
          activeTicketId={selectedTicketId}
          onNavigateToList={handleNavigateToList}
          onNavigateToCreate={handleNavigateToCreate}
        />

        <main className="canvas-body">
          {successMessage && (
            <div className="alert-banner alert-banner-success">
              <div className="alert-content">
                <span>✓</span>
                <span>{successMessage}</span>
              </div>
              <button
                className="alert-close-btn"
                onClick={() => setSuccessMessage(null)}
                type="button"
                aria-label="Dismiss alert"
              >
                ×
              </button>
            </div>
          )}

          {view === 'list' && (
            <TicketList
              onSelectTicket={handleSelectTicket}
              onNavigateToCreate={handleNavigateToCreate}
              onTicketsLoaded={(count) => setTicketCount(count)}
            />
          )}

          {view === 'detail' && selectedTicketId !== null && (
            <TicketDetail
              ticketId={selectedTicketId}
              onBack={handleNavigateToList}
              onEdit={handleStartEdit}
            />
          )}

          {view === 'create' && (
            <TicketCreate
              onSuccess={handleCreateSuccess}
              onCancel={handleNavigateToList}
            />
          )}

          {view === 'edit' && (editingTicket !== null || selectedTicketId !== null) && (
            <TicketEdit
              ticket={editingTicket}
              ticketId={selectedTicketId}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                if (selectedTicketId !== null) {
                  setView('detail');
                } else {
                  handleNavigateToList();
                }
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PersonaProvider>
      <MainApp />
    </PersonaProvider>
  );
};

export default App;
