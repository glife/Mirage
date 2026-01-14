import React, { useMemo } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
import {
  BarVisualizer,
  type TrackReference,
  VideoTrack,
  useLocalParticipant,
  useTracks,
  useVoiceAssistant,
} from '@livekit/components-react';
import { cn } from '@/lib/utils';
import { OrbVisualizer } from './orb-visualizer';

const MotionContainer = motion.create('div');

const ANIMATION_TRANSITION = {
  type: 'spring',
  stiffness: 675,
  damping: 75,
  mass: 1,
};

export function useLocalTrackRef(source: Track.Source) {
  const { localParticipant } = useLocalParticipant();
  const publication = localParticipant.getTrackPublication(source);
  const trackRef = useMemo<TrackReference | undefined>(
    () => (publication ? { source, participant: localParticipant, publication } : undefined),
    [source, publication, localParticipant]
  );
  return trackRef;
}

interface TileLayoutProps {
  chatOpen?: boolean;
}

export function TileLayout({ chatOpen = false }: TileLayoutProps) {
  const {
    state: agentState,
    audioTrack: agentAudioTrack,
    videoTrack: agentVideoTrack,
  } = useVoiceAssistant();
  const [screenShareTrack] = useTracks([Track.Source.ScreenShare]);
  const cameraTrack: TrackReference | undefined = useLocalTrackRef(Track.Source.Camera);

  const isCameraEnabled = cameraTrack && !cameraTrack.publication.isMuted;
  const isScreenShareEnabled = screenShareTrack && !screenShareTrack.publication.isMuted;
  const isAvatar = agentVideoTrack !== undefined;

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-black">
      {/* 1. LAYER: AGENT (Background / Main Spotlight) */}
      <div className="absolute inset-0 flex h-full w-full items-center justify-center">
        <AnimatePresence mode="popLayout">
          {/* A. If Agent has VIDEO */}
          {isAvatar && agentVideoTrack && (
            <MotionContainer
              key="agent-video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full object-cover"
            >
              <VideoTrack
                trackRef={agentVideoTrack}
                className="h-full w-full object-cover"
              />
            </MotionContainer>
          )}

          {/* B. If Agent is AUDIO ONLY (Visualizer) */}
          {/* B. If Agent is AUDIO ONLY (Visualizer) */}
          {!isAvatar && (
            <MotionContainer
              key="agent-visualizer"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex h-full w-full items-center justify-center"
            >
              <div className="flex flex-col items-center gap-12">
                <OrbVisualizer
                  state={agentState}
                  trackRef={agentAudioTrack}
                  className="scale-150"
                />
                <p className="font-mono text-sm font-medium tracking-widest text-white/50 uppercase">
                  {agentState}
                </p>
              </div>
            </MotionContainer>
          )}
        </AnimatePresence>
      </div>

      {/* 2. LAYER: USER (Foreground / PiP) */}
      <div className="absolute top-6 right-6 z-20 w-48 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 transition-all hover:ring-white/20 md:w-64">
        <AnimatePresence mode="popLayout">
          {((cameraTrack && isCameraEnabled) || (screenShareTrack && isScreenShareEnabled)) && (
            <MotionContainer
              key="user-pip"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={ANIMATION_TRANSITION}
              className="relative aspect-video w-full bg-zinc-900"
            >
              <VideoTrack
                trackRef={screenShareTrack || cameraTrack}
                className="h-full w-full object-cover mirror-x"
              />
            </MotionContainer>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
