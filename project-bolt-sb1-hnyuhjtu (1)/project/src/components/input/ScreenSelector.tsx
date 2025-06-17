import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Square, Sparkles, Upload, RefreshCw } from 'lucide-react';
import { usePermissions } from '../../contexts/PermissionContext';
import SmartPermissionHandler from './SmartPermissionHandler';

interface ScreenSelectorProps {
  onSubmit: (task: any) => void;
}

const ScreenSelector: React.FC<ScreenSelectorProps> = ({ onSubmit }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const { 
    hasScreenPermission, 
    requestScreenPermission, 
    permissionErrors, 
    isSupported
  } = usePermissions();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleStartScreenCapture = async () => {
    setError(null);
    setIsSelecting(true);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
      }

      video.onloadedmetadata = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          stream.getTracks().forEach(track => track.stop());
          setError('Failed to create canvas for screen capture.');
          setIsSelecting(false);
          return;
        }

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          stream.getTracks().forEach(track => track.stop());
          setError('Failed to get canvas context.');
          setIsSelecting(false);
          return;
        }

        // Draw the video frame to canvas
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
        setIsSelecting(false);
      };

      // Handle stream end (user stops sharing)
      stream.getVideoTracks()[0].onended = () => {
        setIsSelecting(false);
      };

    } catch (error: any) {
      setIsSelecting(false);
      
      if (error.name === 'NotAllowedError') {
        setError('Screen sharing was denied. Please try again or use the image upload option instead.');
      } else if (error.name === 'NotSupportedError') {
        setError('Screen sharing is not supported in this browser. Please try Chrome, Edge, or Firefox.');
      } else if (error.name === 'NotFoundError') {
        setError('No screen available for sharing. Please try again.');
      } else if (error.name === 'AbortError') {
        setError('Screen sharing was cancelled. You can try again or upload an image instead.');
      } else {
        setError('Unable to capture screen. Please try uploading an image instead.');
      }
      
      console.error('Screen capture error:', error);
    }
  };

  const handleProcessCapture = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate OCR and AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock extracted steps
      const steps = [
        { id: 1, title: 'Step 1', description: 'Click on the File menu', completed: false, type: 'action' as const },
        { id: 2, title: 'Step 2', description: 'Select Open from the dropdown', completed: false, type: 'action' as const },
        { id: 3, title: 'Step 3', description: 'Choose your document', completed: false, type: 'action' as const },
        { id: 4, title: 'Step 4', description: 'Click Open button', completed: false, type: 'action' as const },
      ];

      const task = {
        id: Date.now().toString(),
        title: 'Screen Capture Task',
        description: 'Task created from screen capture',
        steps,
        mode: 'screen' as const,
        originalCapture: capturedImage,
        createdAt: new Date().toISOString()
      };

      onSubmit(task);
    } catch (error) {
      setError('Failed to process the captured screen. Please try again.');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setCapturedImage(null);
    handleStartScreenCapture();
  };

  const clearCapture = () => {
    setCapturedImage(null);
    setError(null);
  };

  const handlePermissionGranted = () => {
    // Permission granted, can now use screen capture
    setShowFallback(false);
  };

  const handleUseFallback = () => {
    setShowFallback(true);
  };

  // Show fallback image upload
  if (showFallback) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Upload className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-blue-400">Using Image Upload Instead</span>
          </div>
          <p className="text-sm text-blue-300">
            You can upload a screenshot or image with instructions instead of screen sharing.
          </p>
        </div>
        
        <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Upload Screenshot</h3>
          <p className="text-gray-400 mb-4">
            Drag & drop or click to select an image with instructions
          </p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="image-upload"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  setCapturedImage(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <label
            htmlFor="image-upload"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200"
          >
            <Upload className="w-5 h-5" />
            <span>Choose Image</span>
          </label>
        </div>
        
        {capturedImage && (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={capturedImage} 
                alt="Uploaded image" 
                className="w-full max-h-64 object-contain rounded-xl border border-white/20"
              />
              <button
                onClick={clearCapture}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            
            <motion.button
              onClick={handleProcessCapture}
              disabled={isProcessing}
              className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 px-6 py-4 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
              whileHover={{ scale: isProcessing ? 1 : 1.02 }}
              whileTap={{ scale: isProcessing ? 1 : 0.98 }}
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  <span>Processing image & creating guide...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Process Image & Create Guide</span>
                </>
              )}
            </motion.button>
          </div>
        )}
        
        <button
          onClick={() => setShowFallback(false)}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          ← Back to screen capture
        </button>
      </div>
    );
  }

  return (
    <SmartPermissionHandler
      permissionType="screen"
      isRequired={false}
      onPermissionGranted={handlePermissionGranted}
      onFallback={handleUseFallback}
      requestPermission={requestScreenPermission}
      error={permissionErrors.screen}
      isSupported={isSupported.screen}
      fallbackText="Upload Image Instead"
    >
      <div className="space-y-6">
        <canvas ref={canvasRef} className="hidden" />
        
        {!capturedImage ? (
          <div className="text-center">
            <motion.button
              onClick={handleStartScreenCapture}
              disabled={!hasScreenPermission || isSelecting}
              className="flex items-center justify-center space-x-3 mx-auto bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 disabled:from-gray-600 disabled:to-gray-700 px-8 py-6 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
              whileHover={{ scale: isSelecting || !hasScreenPermission ? 1 : 1.05 }}
              whileTap={{ scale: isSelecting || !hasScreenPermission ? 1 : 0.95 }}
            >
              {isSelecting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Monitor className="w-6 h-6" />
                  </motion.div>
                  <span>Select your screen...</span>
                </>
              ) : (
                <>
                  <Monitor className="w-6 h-6" />
                  <span>Start Screen Capture</span>
                </>
              )}
            </motion.button>
            
            <div className="mt-6 space-y-3 text-gray-400">
              <div className="flex items-center justify-center space-x-2">
                <Square className="w-4 h-4" />
                <span className="text-sm">1. Click to start screen sharing</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Square className="w-4 h-4" />
                <span className="text-sm">2. Select the window or screen to share</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Square className="w-4 h-4" />
                <span className="text-sm">3. AI will extract and create steps</span>
              </div>
            </div>

            {/* Fallback suggestion */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-center space-x-2 text-gray-400">
                <Upload className="w-5 h-5" />
                <button
                  onClick={handleUseFallback}
                  className="text-sm hover:text-white transition-colors"
                >
                  Can't use screen sharing? Try <strong>uploading an image instead</strong>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={capturedImage} 
                alt="Screen capture" 
                className="w-full max-h-64 object-contain rounded-xl border border-white/20"
              />
              <button
                onClick={clearCapture}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                aria-label="Remove capture"
              >
                ×
              </button>
            </div>

            <div className="flex space-x-3">
              <motion.button
                onClick={handleProcessCapture}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 disabled:from-gray-600 disabled:to-gray-700 px-6 py-4 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
                whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                whileTap={{ scale: isProcessing ? 1 : 0.98 }}
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    <span>Analyzing screen & creating guide...</span>
                  </>
                ) : (
                  <>
                    <Monitor className="w-5 h-5" />
                    <span>Process Capture & Create Guide</span>
                  </>
                )}
              </motion.button>

              <button
                onClick={handleRetry}
                disabled={isProcessing}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 px-4 py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                aria-label="Retry capture"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </SmartPermissionHandler>
  );
};

export default ScreenSelector;