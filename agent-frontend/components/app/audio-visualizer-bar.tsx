'use client';

import { useEffect, useRef } from 'react';
import { TrackReferenceOrPlaceholder, useTrackVolume } from '@livekit/components-react';
import { cn } from '@/lib/utils';

interface AudioVisualizerBarProps {
    trackRef?: TrackReferenceOrPlaceholder;
    className?: string;
    colors?: {
        primary: string;
        secondary: string;
        accent: string;
    };
}

export function AudioVisualizerBar({ trackRef, className, colors }: AudioVisualizerBarProps) {
    const volume = useTrackVolume(trackRef as any);
    const volumeRef = useRef(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeRef = useRef(0);

    useEffect(() => {
        volumeRef.current = volume;
    }, [volume]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        let animationFrameId: number;

        const render = () => {
            const currentVolume = volumeRef.current;

            ctx.clearRect(0, 0, rect.width, rect.height);
            timeRef.current += 0.05; // Slightly faster for linear feel

            const width = rect.width;
            const height = rect.height;
            const centerY = height / 2;

            // Visual parameters
            const sensitivity = 0.5; // Adjusted for height constraint
            const baseAmplitude = height * 0.15;
            const dynamicAmplitude = height * 0.4 * Math.min(1, currentVolume * 4); // Cap max height

            // Gradients
            const theme = colors || {
                primary: 'rgba(6, 182, 212, 0.8)',
                secondary: 'rgba(139, 92, 246, 0.9)',
                accent: 'rgba(59, 130, 246, 0.8)'
            };

            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(0.2, theme.primary);
            gradient.addColorStop(0.5, theme.secondary);
            gradient.addColorStop(0.8, theme.accent);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            // Draw horizontal waves
            drawLinearWave(ctx, width, centerY, baseAmplitude + dynamicAmplitude, 0.05, timeRef.current, gradient, 2);
            drawLinearWave(ctx, width, centerY, (baseAmplitude + dynamicAmplitude) * 0.8, 0.03, -timeRef.current * 0.8, gradient, 1.5);

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className={cn("relative h-10 w-32 overflow-hidden rounded-full bg-black/20", className)}>
            <canvas ref={canvasRef} className="h-full w-full" />
        </div>
    );
}

function drawLinearWave(
    ctx: CanvasRenderingContext2D,
    width: number,
    centerY: number,
    amplitude: number,
    frequency: number,
    phase: number,
    style: string | CanvasGradient,
    lineWidth: number
) {
    ctx.beginPath();
    ctx.strokeStyle = style;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    for (let x = 0; x <= width; x += 2) {
        const y = centerY + Math.sin(x * frequency + phase) * amplitude * Math.sin(x / width * Math.PI); // Envelope to taper ends
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}
