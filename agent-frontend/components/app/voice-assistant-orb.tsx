'use client';

import { useEffect, useState } from 'react';
import { TrackReferenceOrPlaceholder, useTrackVolume } from '@livekit/components-react';
import { motion, useAnimation } from 'motion/react';
import { cn } from '@/lib/utils';

interface VoiceAssistantOrbProps {
    trackRef?: TrackReferenceOrPlaceholder;
    className?: string;
}

export function VoiceAssistantOrb({ trackRef, className }: VoiceAssistantOrbProps) {
    const volume = useTrackVolume(trackRef as any);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Normalize volume to a useful scale (usually 0-1, but microphone input might be low)
    // We want a base size + dynamic size
    // Enhanced sensitivity for visual impact
    const intensity = Math.min(1, Math.max(0, volume * 4));

    useEffect(() => {
        setIsSpeaking(intensity > 0.05);
    }, [intensity]);

    return (
        <div className={cn("relative flex items-center justify-center size-full", className)}>
            {/* Core Glow */}
            <motion.div
                animate={{
                    scale: 1 + intensity * 0.5,
                    opacity: 0.5 + intensity * 0.5,
                    filter: `blur(${10 + intensity * 20}px)`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute w-1/2 h-1/2 rounded-full bg-cyan-400/50 mix-blend-screen"
            />

            {/* Secondary Pulse */}
            <motion.div
                animate={{
                    scale: 1 + intensity * 1.2,
                    opacity: 0.3 + intensity * 0.4,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="absolute w-1/2 h-1/2 rounded-full bg-purple-500/40 mix-blend-screen blur-xl"
            />

            {/* Outer Ripple */}
            <motion.div
                animate={{
                    scale: isSpeaking ? [1, 1.5] : 1,
                    opacity: isSpeaking ? [0.4, 0] : 0,
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                }}
                className="absolute w-1/2 h-1/2 rounded-full border border-white/20"
            />

            {/* Center Core */}
            <div className="relative w-1/3 h-1/3 rounded-full bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.8)] backdrop-blur-sm" />
        </div>
    );
}
