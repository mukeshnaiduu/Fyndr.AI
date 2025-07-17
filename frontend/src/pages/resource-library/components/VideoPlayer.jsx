import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const VideoPlayer = ({ videoData, onClose, onProgress, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const transcript = [
    { time: 0, text: "Welcome to this comprehensive tutorial on binary search trees." },
    { time: 15, text: "A binary search tree is a hierarchical data structure where each node has at most two children." },
    { time: 30, text: "The left child contains values less than the parent, and the right child contains values greater than the parent." },
    { time: 45, text: "This property makes searching, insertion, and deletion operations very efficient." },
    { time: 60, text: "Let\'s start by implementing a basic BST node structure." },
    { time: 90, text: "Here's how we can define a node class with value, left, and right properties." },
    { time: 120, text: "Now let\'s implement the insertion method to add new nodes to our tree." },
    { time: 150, text: "The search operation follows the BST property to find elements efficiently." },
    { time: 180, text: "Deletion is more complex as we need to handle three cases: leaf nodes, nodes with one child, and nodes with two children." }
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime, video.duration);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
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

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    videoRef.current.playbackRate = rate;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
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
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const jumpToTranscriptTime = (time) => {
    videoRef.current.currentTime = time;
  };

  const getCurrentTranscriptItem = () => {
    return transcript.find((item, index) => {
      const nextItem = transcript[index + 1];
      return currentTime >= item.time && (!nextItem || currentTime < nextItem.time);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <div 
        ref={containerRef}
        className="relative w-full h-full flex flex-col"
        onMouseMove={handleMouseMove}
      >
        {/* Header */}
        <div className={`absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-lg font-semibold">{videoData.title}</h2>
              <p className="text-white/80 text-sm">{videoData.instructor} • {videoData.duration}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-white hover:bg-white/20"
              >
                <Icon name="FileText" size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotes(!showNotes)}
                className="text-white hover:bg-white/20"
              >
                <Icon name="StickyNote" size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Video */}
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              src={videoData.videoUrl}
              className="w-full h-full object-contain"
              onClick={togglePlay}
            />

            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="w-20 h-20 bg-black/50 hover:bg-black/70 text-white rounded-full"
                >
                  <Icon name="Play" size={32} />
                </Button>
              </div>
            )}
          </div>

          {/* Transcript Panel */}
          {showTranscript && (
            <div className="w-80 bg-black/80 backdrop-blur-sm border-l border-white/20 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-white font-semibold mb-4">Transcript</h3>
                <div className="space-y-3">
                  {transcript.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => jumpToTranscriptTime(item.time)}
                      className={`w-full text-left p-3 rounded-lg transition-spring hover:bg-white/10 ${
                        getCurrentTranscriptItem()?.time === item.time 
                          ? 'bg-primary/20 border border-primary/30' :''
                      }`}
                    >
                      <div className="text-xs text-white/60 mb-1">{formatTime(item.time)}</div>
                      <div className="text-sm text-white">{item.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes Panel */}
          {showNotes && (
            <div className="w-80 bg-black/80 backdrop-blur-sm border-l border-white/20">
              <div className="p-4 h-full flex flex-col">
                <h3 className="text-white font-semibold mb-4">Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take notes while watching..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/50 resize-none focus:outline-none focus:border-primary/50"
                />
                <div className="mt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Save Notes
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    Export
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Progress Bar */}
          <div className="mb-4">
            <div 
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-primary rounded-full transition-spring"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                <Icon name={isPlaying ? "Pause" : "Play"} size={20} />
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  <Icon name={isMuted ? "VolumeX" : "Volume2"} size={20} />
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Playback Speed */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  {playbackRate}x
                </Button>
                <div className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={`block w-full text-left px-3 py-1 text-sm text-white hover:bg-white/20 rounded ${
                        playbackRate === rate ? 'bg-primary/20' : ''
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Icon name={isFullscreen ? "Minimize" : "Maximize"} size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
