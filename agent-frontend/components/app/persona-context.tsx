'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Persona, PERSONAS, DEFAULT_PERSONA } from './personas';

interface PersonaContextType {
    currentPersona: Persona;
    setPersona: (persona: Persona) => void;
    personas: Persona[];
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
    const [currentPersona, setPersona] = useState<Persona>(DEFAULT_PERSONA);

    return (
        <PersonaContext.Provider value={{ currentPersona, setPersona, personas: PERSONAS }}>
            {children}
        </PersonaContext.Provider>
    );
}

export function usePersona() {
    const context = useContext(PersonaContext);
    if (context === undefined) {
        throw new Error('usePersona must be used within a PersonaProvider');
    }
    return context;
}
