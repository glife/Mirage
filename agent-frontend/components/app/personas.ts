export interface Persona {
    id: string;
    name: string;
    image: string;
    description: string;
    colors: {
        primary: string; // e.g., Cyan
        secondary: string; // e.g., Violet
        accent: string; // e.g., Blue
    };
}

export const PERSONAS: Persona[] = [
    {
        id: 'mirage-default',
        name: 'Mirage',
        description: 'The default friendly assistant.',
        image: '/m_tempimg.jpg',
        colors: {
            primary: 'rgba(6, 182, 212, 0.8)', // Cyan
            secondary: 'rgba(139, 92, 246, 0.9)', // Violet
            accent: 'rgba(59, 130, 246, 0.8)', // Blue
        },
    },
    {
        id: 'professional-variant',
        name: 'Professional',
        description: 'A more formal and structured assistant.',
        image: '/m_tempimg2.jpg',
        colors: {
            primary: 'rgba(20, 184, 166, 0.8)', // Teal
            secondary: 'rgba(99, 102, 241, 0.9)', // Indigo
            accent: 'rgba(255, 255, 255, 0.6)', // White/Clean
        },
    },
];

export const DEFAULT_PERSONA = PERSONAS[0];
