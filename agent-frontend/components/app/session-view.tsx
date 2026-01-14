'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useSessionContext, useSessionMessages } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { PreConnectMessage } from '@/components/app/preconnect-message';
import { TileLayout } from '@/components/app/tile-layout';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/livekit/agent-control-bar/agent-control-bar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';

const MotionBottom = motion.create('div');

const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 20 },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: { duration: 0.3, delay: 0.2, ease: 'easeOut' },
};

interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const [chatOpen, setChatOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsScreenShare,
  };

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section className="relative z-10 h-full w-full overflow-hidden" {...props}>
      {/* 1. Underlying Tile Layout (Full Screen) */}
      <TileLayout chatOpen={chatOpen} />

      {/* 2. Chat Overlay (If open) */}
      <div
        className={cn(
          'fixed inset-0 z-40 pointer-events-none transition-all duration-300',
          chatOpen ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
        )}
      />

      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-md bg-zinc-950/90 shadow-2xl transition-transform duration-300 ease-in-out md:w-[400px]',
          chatOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Chat Header */}
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <h2 className="text-lg font-medium text-white">Transcript</h2>
        </div>

        <ScrollArea ref={scrollAreaRef} className="h-[calc(100%-4rem)] p-6">
          <ChatTranscript
            hidden={!chatOpen}
            messages={messages}
            className="space-y-4"
          />
        </ScrollArea>
      </div>

      {/* 3. Bottom Control Bar (Floating) */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-0 bottom-8 z-50 flex justify-center pointer-events-none"
      >
        <div className="pointer-events-auto">
          {appConfig.isPreConnectBufferEnabled && (
            <PreConnectMessage messages={messages} className="mb-4" />
          )}
          <AgentControlBar
            controls={controls}
            isConnected={session.isConnected}
            onDisconnect={session.end}
            onChatOpenChange={setChatOpen}
          />
        </div>
      </MotionBottom>
    </section>
  );
};
