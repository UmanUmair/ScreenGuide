import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Square, RotateCcw, Maximize2, Eye, Brain } from 'lucide-react';
import VisualOverlay from './VisualOverlay';
import { VisualCue } from '../services/aiVisionService';

interface ScreenShareViewerProps {
  isActive: boolean;
  onStop: () => void;
  visualCues?: VisualCue[];
  onScreenCapture?: (imageData: string) => void;
}

const ScreenShareViewer: React.FC<ScreenShareViewerProps> = ({ 
  isActive, 
  onStop, 
  visualCues = [],
  onScreenCapture 
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenDimensions, setScreenDimensions] = useState({ width: 800, height: 600 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScreenShare = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { 
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false 
      });
      
      setStream(mediaStream);
      setIsRecording(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Update screen dimensions when video loads
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            setScreenDimensions({
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight
            });
          }
        };
      }

      // Handle stream end (user stops sharing)
      mediaStream.getVideoTracks()[0].onended = () => {
        handleStopScreenShare();
      };

    } catch (err: any) {
      setIsRecording(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Screen sharing was denied. Please grant permission to continue.');
      } else if (err.name === 'NotSupportedError') {
        setError('Screen sharing is not supported in this browser.');
      } else {
        setError('Failed to start screen sharing. Please try again.');
      }
      
      console.error('Screen sharing error:', err);
    }
  };

  const captureScreenFrame = async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0);
    
    // Convert to base64 image data
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const handleStopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsRecording(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    onStop();
  };

  const handleRetry = () => {
    setError(null);
    startScreenShare();
  };

  const handleManualCapture = async () => {
    const imageData = await captureScreenFrame();
    if (imageData && onScreenCapture) {
      onScreenCapture(imageData);
    }
  };

  // Auto-start when component becomes active
  useEffect(() => {
    if (isActive && !stream && !error) {
      startScreenShare();
    }
  }, [isActive]);

  // Auto-capture frames for AI analysis
  useEffect(() => {
    if (isRecording && onScreenCapture) {
      const interval = setInterval(async () => {
        const imageData = await captureScreenFrame();
        if (imageData) {
          onScreenCapture(imageData);
        }
      }, 5000); // Capture every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isRecording, onScreenCapture]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-2 rounded-lg">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Live Screen Capture</h3>
            <p className="text-sm text-gray-400">
              {isRecording ? 'AI-enhanced visual guidance active' : 'Ready to capture your screen'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isRecording && (
            <div className="flex items-center space-x-2 bg-red-500/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-400 font-medium">LIVE</span>
            </div>
          )}
          
          {visualCues.length > 0 && (
            <div className="flex items-center space-x-2 bg-blue-500/20 px-3 py-1 rounded-full">
              <Eye className="w-3 h-3 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">
                {visualCues.length} cue{visualCues.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {error ? (
        <div className="text-center py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-4">
            <Square className="w-12 h-12 mx-auto mb-3 text-red-400" />
            <h4 className="font-medium text-red-400 mb-2">Screen Sharing Failed</h4>
            <p className="text-sm text-red-300 mb-4">{error}</p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={handleRetry}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={onStop}
                className="text-gray-400 hover:text-gray-300 px-4 py-2 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : !isRecording ? (
        <div className="text-center py-8">
          <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h4 className="font-medium mb-2">Starting Screen Share...</h4>
          <p className="text-sm text-gray-400 mb-4">
            Select the screen or window you want to share
          </p>
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
            />
            <span className="text-sm text-gray-400">Waiting for selection...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Video Preview with Visual Overlay */}
          <div className="relative bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-64 object-contain"
              style={{ backgroundColor: '#000' }}
            />
            
            {/* Visual Overlay for AI Guidance */}
            <VisualOverlay 
              visualCues={visualCues}
              isActive={true}
              screenDimensions={screenDimensions}
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-white font-medium">AI Enhanced</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleManualCapture}
                  className="bg-black/50 backdrop-blur-sm hover:bg-black/70 p-2 rounded-lg transition-all duration-200"
                  title="Capture frame for analysis"
                >
                  <Brain className="w-4 h-4 text-white" />
                </button>
                
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.requestFullscreen) {
                        videoRef.current.requestFullscreen();
                      }
                    }
                  }}
                  className="bg-black/50 backdrop-blur-sm hover:bg-black/70 p-2 rounded-lg transition-all duration-200"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <motion.button
              onClick={handleStopScreenShare}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Square className="w-5 h-5" />
              <span>Stop Sharing</span>
            </motion.button>
          </div>

          {/* Status Info */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Monitor className="w-5 h-5 text-green-400" />
              <span className="font-medium text-green-400">AI Vision Active</span>
            </div>
            <p className="text-sm text-green-300">
              Your screen is being analyzed in real-time. The AI provides visual guidance, 
              detects your progress, and offers contextual suggestions.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ScreenShareViewer;