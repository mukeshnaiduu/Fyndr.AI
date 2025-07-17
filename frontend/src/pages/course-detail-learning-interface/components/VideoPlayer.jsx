import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const VideoPlayer = ({ videoUrl, title, onProgressUpdate, currentTime = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentVideoTime, setCurrentVideoTime] = useState(currentTime);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentVideoTime(video.currentTime);
      if (onProgressUpdate) {
        onProgressUpdate(video.currentTime, video.duration);
      }
    };

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onProgressUpdate]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    video.currentTime = newTime;
    setCurrentVideoTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const changePlaybackSpeed = (speed) => {
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const skipTime = (seconds) => {
    const video = videoRef.current;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={videoUrl}
        poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop"
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Play/Pause Overlay */}
      {!isPlaying && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          >
            <Icon name="Play" size={32} color="white" />
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div className="mb-4">
          <div 
            className="w-full h-2 bg-white/20 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-primary rounded-full relative"
              style={{ width: `${(currentVideoTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg"></div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              <Icon name={isPlaying ? "Pause" : "Play"} size={20} />
            </Button>

            {/* Skip Buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skipTime(-10)}
              className="text-white hover:bg-white/20"
            >
              <Icon name="RotateCcw" size={18} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => skipTime(10)}
              className="text-white hover:bg-white/20"
            >
              <Icon name="RotateCw" size={18} />
            </Button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                <Icon name={isMuted ? "VolumeX" : "Volume2"} size={18} />
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none slider"
              />
            </div>

            {/* Time Display */}
            <span className="text-white text-sm font-mono">
              {formatTime(currentVideoTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Playback Speed */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                {playbackSpeed}x
              </Button>
              <div className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => changePlaybackSpeed(speed)}
                    className={`block w-full text-left px-3 py-1 text-sm rounded hover:bg-white/20 ${
                      playbackSpeed === speed ? 'text-primary' : 'text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Icon name={isFullscreen ? "Minimize" : "Maximize"} size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Title Overlay */}
      <div className="absolute top-4 left-4 right-4">
        <h2 className="text-white text-lg font-semibold drop-shadow-lg">{title}</h2>
      </div>
    </div>
  );
};

export default VideoPlayer;
