import React from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
  videoUrl?: string | string[]; // Updated to handle array
  exerciseName: string;
  exerciseDescription: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  exerciseName,
  exerciseDescription,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const selectedVideoUrl = Array.isArray(videoUrl) ? videoUrl[0] : videoUrl; // Use the first video if it's an array

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  return (
    <motion.div 
      className="w-full rounded-2xl overflow-hidden shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative bg-black aspect-video w-full">
        {selectedVideoUrl ? (
          <video
            ref={videoRef}
            src={selectedVideoUrl}
            className="w-full h-full object-cover"
            poster="/placeholder.svg"
            loop
            onClick={handlePlayPause}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-violet-100">
            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-violet-200 flex items-center justify-center">
                <Play size={36} className="text-violet-700 ml-1" />
              </div>
              <p className="text-lg text-violet-800">Video not available</p>
            </div>
          </div>
        )}

        {/* Video controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-white" />
                ) : (
                  <Play className="h-5 w-5 text-white ml-1" />
                )}
              </button>
              <button 
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
                onClick={handleSkip}
              >
                <SkipForward className="h-4 w-4 text-white" />
              </button>
            </div>

            <button 
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
              onClick={handleMute}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="p-4 bg-white">
        <h2 className="text-xl font-bold text-violet-900 mb-1">{exerciseName}</h2>
        <p className="text-gray-700">{exerciseDescription}</p>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;