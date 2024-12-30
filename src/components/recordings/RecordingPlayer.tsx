import React, { useState, useEffect } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { getRecordingLink } from '../../services/recordings/get-link';

interface RecordingPlayerProps {
  roomName: string;
  interactionId: string;
}

export function RecordingPlayer({ roomName, interactionId }: RecordingPlayerProps) {
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function fetchRecordingUrl() {
      try {
        const url = await getRecordingLink(roomName, interactionId);
        setRecordingUrl(url);
      } catch (err) {
        setError('Failed to load recording');
      } finally {
        setLoading(false);
      }
    }

    fetchRecordingUrl();
  }, [roomName, interactionId]);

  const handlePlayPause = () => {
    const audio = document.getElementById(`recording-${roomName}`) as HTMLAudioElement;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 dark:text-dark-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading recording...</span>
      </div>
    );
  }

  if (error || !recordingUrl) {
    return (
      <div className="text-sm text-red-600 dark:text-red-400">
        {error || 'Recording not available'}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePlayPause}
        className="p-2 rounded-full bg-dark-100 hover:bg-dark-200 dark:bg-dark-200 dark:hover:bg-dark-300 text-dark-600"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>
      
      <audio
        id={`recording-${roomName}`}
        src={recordingUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      
      <span className="text-sm text-gray-600 dark:text-dark-400">
        Call Recording
      </span>
    </div>
  );
}