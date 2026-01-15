'use client';

import { useEffect, useRef } from 'react';
import { TrackReferenceOrPlaceholder, useTrackVolume } from '@livekit/components-react';
import { cn } from '@/lib/utils';

interface CircularAudioVisualizerProps {
    trackRef?: TrackReferenceOrPlaceholder;
    className?: string;
}

export function CircularAudioVisualizer({ trackRef, className }: CircularAudioVisualizerProps) {
    const volume = useTrackVolume(trackRef as any);
    const volumeRef = useRef(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeRef = useRef(0);

    // Keep ref synced with latest volume
    useEffect(() => {
        volumeRef.current = volume;
    }, [volume]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        // We need to wait for layout? 
        // Actually canvas size depends on CSS.
        // For now assume standard rect calc is fine
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        let animationFrameId: number;

        const render = () => {
            const currentVolume = volumeRef.current;

            // Clear canvas
            ctx.clearRect(0, 0, rect.width, rect.height);

            // Update time
            timeRef.current += 0.02;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2 + 40; // Moved lower (+40)

            // Even smaller radius
            const baseRadius = Math.min(rect.width, rect.height) / 2 * 0.35;

            // Visual parameters
            const sensitivity = 50;
            const amplitude = 3 + (currentVolume * sensitivity);

            // Vibrant Gradients
            const gradient1 = ctx.createLinearGradient(0, 0, rect.width, rect.height);
            gradient1.addColorStop(0, 'rgba(6, 182, 212, 0)');
            gradient1.addColorStop(0.5, 'rgba(34, 211, 238, 1)'); // Cyan-400 (Vibrant)
            gradient1.addColorStop(1, 'rgba(6, 182, 212, 0)');

            const gradient2 = ctx.createLinearGradient(rect.width, 0, 0, rect.height);
            gradient2.addColorStop(0, 'rgba(139, 92, 246, 0)');
            gradient2.addColorStop(0.5, 'rgba(167, 139, 250, 1)'); // Violet-400 (Vibrant)
            gradient2.addColorStop(1, 'rgba(139, 92, 246, 0)');

            const gradient3 = ctx.createLinearGradient(0, rect.height, rect.width, 0);
            gradient3.addColorStop(0, 'rgba(59, 130, 246, 0)');
            gradient3.addColorStop(0.5, 'rgba(96, 165, 250, 1)'); // Blue-400 (Vibrant)
            gradient3.addColorStop(1, 'rgba(59, 130, 246, 0)');

            // Thicker lines for "Mesh" aesthetic
            // Layer 1
            drawWave(ctx, centerX, centerY, baseRadius, amplitude, 8, timeRef.current, gradient1, 4);

            // Layer 2
            drawWave(ctx, centerX, centerY, baseRadius * 0.9, amplitude * 0.8, 12, -timeRef.current * 1.5, gradient2, 3);

            // Layer 3
            drawWave(ctx, centerX, centerY, baseRadius * 1.1, amplitude * 1.2, 5, timeRef.current * 0.5, gradient3, 5);

            // Layer 4 (New) - Detailed high-freq mesh
            drawWave(ctx, centerX, centerY, baseRadius * 1.0, amplitude * 0.5, 20, timeRef.current * 2, 'rgba(255, 255, 255, 0.3)', 1);

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []); // Run once on mount

    return (
        <canvas
            ref={canvasRef}
            className={cn("w-full h-full", className)}
        />
    );
}

// Helper to draw detailed circular waves
function drawWave(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    amplitude: number,
    frequency: number,
    phase: number,
    color: string | CanvasGradient,
    lineWidth: number
) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    // Draw smooth circle with sine modulation
    // Use more steps for smoother circle
    const steps = 200;

    for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;

        // Modulate radius with sine wave
        // frequency determines how many "ripples" appear around the circle
        // phase rotates the waves
        const offset = Math.sin(angle * frequency + phase) * amplitude;

        const r = radius + offset;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();
    ctx.stroke();
}
