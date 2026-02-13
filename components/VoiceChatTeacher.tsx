'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Phone, PhoneOff, Mic, MicOff, Loader, Volume2, VolumeX } from 'lucide-react';

interface VoiceChatTeacherProps {
  onSpeakingChange?: (speaking: boolean) => void;
  onLipSyncIntensityChange?: (intensity: number) => void;
  onPhonemeChange?: (phoneme: string) => void;
  onEmotionChange?: (emotion: string) => void;
}

interface SessionInfo {
  channel_name: string;
  user_token: string;
  user_uid: string;
  agent_id: string;
  agent_uid: string;
  status: string;
}

export default function VoiceChatTeacher({
  onSpeakingChange,
  onLipSyncIntensityChange,
  onPhonemeChange,
  onEmotionChange
}: VoiceChatTeacherProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [agoraRTC, setAgoraRTC] = useState<any>(null);
  const [userProfile] = useState({
    level: 'intermediate',
    topic: 'Chemistry Learning',
    goals: 'Learn chemistry concepts through voice interaction'
  });

  const clientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);

  // Load Agora RTC on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('agora-rtc-sdk-ng').then((module) => {
        setAgoraRTC(module.default);
      });
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);



  const startSession = async () => {
    try {
      if (!agoraRTC) {
        throw new Error('Agora RTC not loaded');
      }

      setIsConnecting(true);
      setError(null);

      console.log('=== Starting Voice Chat Session ===');
      console.log('User Profile:', userProfile);

      const response = await fetch('/api/voice/chat?action=start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start session');
      }

      const data = await response.json();
      const session = data.data as SessionInfo;
      setSessionInfo(session);
      setAgentStatus('connecting');

      console.log('=== Session Started ===');
      console.log('Session Info:', session);
      console.log('User Token:', session.user_token);
      console.log('App ID:', process.env.NEXT_PUBLIC_AGORA_APP_ID);

      // Initialize Agora client
      const client = agoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

      if (!appId) {
        throw new Error('Agora App ID not configured');
      }

      console.log('=== Joining Channel ===');
      console.log('Channel:', session.channel_name);
      console.log('App ID:', appId);
      console.log('User UID:', session.user_uid);

      try {
        // Join channel with the token
        await client.join(appId, session.channel_name, session.user_token, parseInt(session.user_uid));
        console.log('✓ Successfully joined channel');
      } catch (joinError) {
        console.error('✗ Join error details:', joinError);
        throw joinError;
      }

      // Create and publish microphone track
      const localAudioTrack = await agoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = localAudioTrack;
      await client.publish([localAudioTrack]);

      console.log('✓ Microphone track published');

      // Handle remote user
      client.on('user-published', async (user: any, mediaType: string) => {
        console.log('User published:', user.uid, mediaType);
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          user.audioTrack?.play();
          setAgentStatus('connected');
          onSpeakingChange?.(true);
          console.log('✓ Agent audio playing');
        }
      });

      client.on('user-unpublished', () => {
        console.log('User unpublished');
        setAgentStatus('disconnected');
        onSpeakingChange?.(false);
      });

      client.on('connection-state-change', (curState: string, prevState: string, reason: string) => {
        console.log('Connection state changed:', prevState, '->', curState, 'reason:', reason);
      });

      setIsSessionActive(true);
      setIsConnecting(false);
    } catch (err) {
      console.error('Failed to start session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start voice chat');
      setIsConnecting(false);
    }
  };

  const handleEndSession = async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      }

      if (clientRef.current) {
        await clientRef.current.leave();
      }

      if (sessionInfo?.agent_id) {
        await fetch('/api/voice/chat?action=stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: sessionInfo.agent_id })
        });
      }

      setIsSessionActive(false);
      setSessionInfo(null);
      setAgentStatus('idle');
      setIsMuted(false);
      onSpeakingChange?.(false);
      onLipSyncIntensityChange?.(0);
    } catch (err) {
      console.error('Failed to end session:', err);
      setError('Failed to end session properly');
    }
  };

  const toggleMute = () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const getStatusColor = () => {
    const colors = {
      connected: '#48bb78',
      connecting: '#ed8936',
      disconnected: '#f56565',
      idle: '#718096'
    };
    return colors[agentStatus] || colors.idle;
  };

  const getStatusText = () => {
    const texts = {
      connected: 'AI Assistant is listening',
      connecting: 'Connecting to AI Assistant...',
      disconnected: 'AI Assistant disconnected',
      idle: 'Ready to start'
    };
    return texts[agentStatus] || texts.idle;
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="animate-spin" size={32} color="currentColor" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {!isSessionActive ? (
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-elixra-bunsen to-elixra-copper flex items-center justify-center shadow-lg">
              <Mic size={40} className="text-white" />
            </div>
            <h4 className="text-xl font-bold text-elixra-charcoal dark:text-white mb-2">
              Start Voice Chat
            </h4>
            <p className="text-sm text-elixra-secondary dark:text-gray-400 mb-8">
              Click the button below to start a voice conversation with your AI chemistry assistant
            </p>
            <button
              onClick={startSession}
              disabled={isConnecting}
              className="w-full px-6 py-3 bg-gradient-to-r from-elixra-bunsen to-elixra-bunsen-light hover:from-elixra-bunsen-dark hover:to-elixra-bunsen disabled:opacity-60 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              {isConnecting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone size={18} />
                  Start Voice Chat
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center w-full">
            <div
              className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${getStatusColor()} 0%, ${getStatusColor()}dd 100%)`,
                boxShadow: `0 20px 40px ${getStatusColor()}40`,
                animation: agentStatus === 'connected' ? 'pulse 2s ease-in-out infinite' : 'none'
              }}
            >
              <Volume2 size={48} className="text-white" />
            </div>

            <h4 className="text-2xl font-bold text-elixra-charcoal dark:text-white mb-2">
              {agentStatus === 'connected' ? 'Listening...' : 'Connecting...'}
            </h4>
            <p className="text-sm text-elixra-secondary dark:text-gray-400 mb-8">
              {agentStatus === 'connected' 
                ? 'Speak naturally and the AI will respond in real-time'
                : 'Establishing connection with AI assistant'}
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={toggleMute}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md ${
                  isMuted
                    ? 'bg-elixra-error hover:bg-elixra-error/90 text-white'
                    : 'bg-elixra-bunsen hover:bg-elixra-bunsen-dark text-white'
                }`}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                {isMuted ? 'Unmute' : 'Mute'}
              </button>

              <button
                onClick={handleEndSession}
                className="px-6 py-3 bg-gradient-to-r from-elixra-error to-elixra-error/80 hover:from-elixra-error/90 hover:to-elixra-error text-white font-semibold rounded-lg flex items-center gap-2 transition-all shadow-md"
              >
                <PhoneOff size={18} />
                End Chat
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-elixra-error/10 border border-elixra-error/30 text-elixra-error rounded-lg text-sm max-w-sm">
            {error}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
