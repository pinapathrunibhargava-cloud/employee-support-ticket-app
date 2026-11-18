import React, { createContext, useContext, useState, useEffect } from 'react';
import { Persona } from '../types/ticket';
import { PREDEFINED_PERSONAS, DEFAULT_PERSONA, setClientPersona } from '../api/client';

interface PersonaContextType {
  currentPersona: Persona;
  setPersona: (persona: Persona) => void;
  personas: Persona[];
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

const getInitialPersona = (): Persona => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const pParam = params.get('persona');
    if (pParam) {
      const match = PREDEFINED_PERSONAS.find((p) => p.userId === pParam);
      if (match) return match;
    }
  }
  return DEFAULT_PERSONA;
};

export const PersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPersona, setCurrentPersona] = useState<Persona>(getInitialPersona);

  useEffect(() => {
    setClientPersona(currentPersona);
  }, [currentPersona]);

  const handleSetPersona = (persona: Persona) => {
    setCurrentPersona(persona);
    setClientPersona(persona);
  };

  return (
    <PersonaContext.Provider
      value={{
        currentPersona,
        setPersona: handleSetPersona,
        personas: PREDEFINED_PERSONAS,
      }}
    >
      {children}
    </PersonaContext.Provider>
  );
};

export const usePersona = (): PersonaContextType => {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
};
