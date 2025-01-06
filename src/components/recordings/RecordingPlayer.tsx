import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { getRecordingLink } from '../../services/recordings/get-link';

interface RecordingPlayerProps {
  roomName: string;
  interactionId: string;
}

export function RecordingPlayer({ roomName, interactionId }: RecordingPlayerProps) {
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // Fetch recording URL if not already loaded
    if (!recordingUrl && !loading) {
      try {
        setLoading(true);
        const url = await getRecordingLink(roomName, interactionId);
        setRecordingUrl(url);
        setError(null);
        
        if (url) {
          audio.src = url;
          await audio.play();
          setIsPlaying(true);
        } else {
          setError('Recording not available');
        }
      } catch (err) {
        setError('Failed to load recording');
        console.error('Error loading recording:', err);
      } finally {
        setLoading(false);
      }
    } else if (recordingUrl) {
      await audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoaded(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLoaded || !audioRef.current) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-dark-100 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-dark-600 mb-3">Recording</h4>
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          disabled={loading}
          className="p-2 rounded-full bg-dark-100 hover:bg-dark-200 dark:bg-dark-200 dark:hover:bg-dark-300 text-dark-600 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>

        <div className="flex-1">
          <div 
            className={`h-2 bg-gray-200 dark:bg-dark-200 rounded-full overflow-hidden ${isLoaded ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            onClick={handleSeek}
          >
            <div 
              className={`h-full rounded-full ${isLoaded ? 'bg-dark-300 dark:bg-dark-400' : 'bg-gray-300 dark:bg-dark-300'}`}
              style={{ width: `${(currentTime / duration) * 100}%`, position: 'relative' }}
            >
              {isLoaded && (
                <div 
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-dark-400 dark:bg-dark-500 rounded-full shadow-md"
                  style={{ transform: 'translate(50%, -50%)' }}
                />
              )}
            </div>
          </div>
          
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-dark-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}