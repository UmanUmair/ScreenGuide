import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Sparkles, Type, RefreshCw } from 'lucide-react';
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';
import { usePermissions } from '../../contexts/PermissionContext';
import SmartPermissionHandler from './SmartPermissionHandler';

interface VoiceInputProps {
  onSubmit: (task: any) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onSubmit }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  
  const { 
    hasMicPermission, 
    requestMicPermission, 
    permissionErrors, 
    isSupported
  } = usePermissions();

  const { speak, speaking, cancel } = useSpeechSynthesis();
  const { listen, stop, supported: speechRecognitionSupported } = useSpeechRecognition({
    onResult: (result: string) => {
      setTranscript(result);
    },
    onEnd: () => {
      setIsListening(false);
    },
    onError: (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setError('Microphone access was denied. Please grant permission and try again.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try speaking again.');
      } else if (event.error === 'network') {
        setError('Network error occurred. Please check your connection and try again.');
      } else {
        setError('Speech recognition failed. Please try again or use text input instead.');
      }
    }
  });

  const isFullySupported = isSupported.microphone && speechRecognitionSupported;

  const handleStartListening = async () => {
    setError(null);
    
    try {
      setIsListening(true);
      setTranscript('');
      listen({ continuous: true, interimResults: true });
    } catch (error: any) {
      setIsListening(false);
      setError('Failed to start listening. Please try again or use text input instead.');
      console.error('Speech recognition error:', error);
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
    stop();
  };

  const handlePlayback = () => {
    if (speaking) {
      cancel();
    } else if (transcript) {
      speak({ text: transcript });
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Parse transcript into steps
      const steps = transcript.split(/[.!?]/)
        .filter(sentence => sentence.trim())
        .map((step, index) => ({
          id: index + 1,
          title: `Step ${index + 1}`,
          description: step.trim(),
          completed: false,
          type: 'action' as const
        }));

      const task = {
        id: Date.now().toString(),
        title: 'Voice Task',
        description: 'Task created from voice input',
        steps,
        mode: 'voice' as const,
        originalTranscript: transcript,
        createdAt: new Date().toISOString()
      };

      onSubmit(task);
    } catch (error) {
      setError('Failed to process voice input. Please try again.');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setTranscript('');
    handleStartListening();
  };

  const handlePermissionGranted = () => {
    // Permission granted, can now use voice input
    setShowFallback(false);
  };

  const handleUseFallback = () => {
    setShowFallback(true);
  };

  // Show fallback text input
  if (showFallback) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Type className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-blue-400">Using Text Input Instead</span>
          </div>
          <p className="text-sm text-blue-300">
            You can type your instructions below instead of using voice input.
          </p>
        </div>
        
        <textarea
          placeholder="Type your task instructions here..."
          className="w-full h-32 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
        
        {transcript && (
          <motion.button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 px-6 py-4 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
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
                <span>Processing with AI...</span>
              </>
            ) : (
              <>
                <Type className="w-5 h-5" />
                <span>Create Visual Guide</span>
              </>
            )}
          </motion.button>
        )}
        
        <button
          onClick={() => setShowFallback(false)}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          ← Back to voice input
        </button>
      </div>
    );
  }

  return (
    <SmartPermissionHandler
      permissionType="microphone"
      isRequired={false}
      onPermissionGranted={handlePermissionGranted}
      onFallback={handleUseFallback}
      requestPermission={requestMicPermission}
      error={permissionErrors.microphone}
      isSupported={isFullySupported}
      fallbackText="Use Text Input"
    >
      <div className="space-y-6">
        {/* Voice Input Interface */}
        <div className="text-center">
          <motion.button
            onClick={isListening ? handleStopListening : handleStartListening}
            disabled={!hasMicPermission}
            className={`relative w-24 h-24 rounded-full mx-auto mb-4 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
            }`}
            whileHover={{ scale: isListening || !hasMicPermission ? 1 : 1.1 }}
            whileTap={{ scale: isListening || !hasMicPermission ? 1 : 0.9 }}
            animate={isListening ? { scale: [1, 1.1, 1] } : {}}
            transition={isListening ? { duration: 1, repeat: Infinity } : {}}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            ) : (
              <Mic className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            )}
            
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-300"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>

          <h3 className="text-lg font-medium mb-2">
            {isListening ? 'Listening...' : 'Tap to start speaking'}
          </h3>
          <p className="text-gray-400">
            {isListening 
              ? 'Speak your task instructions clearly' 
              : 'Click the microphone and describe your task'
            }
          </p>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-blue-400">Transcript</span>
              </div>
              <button
                onClick={handlePlayback}
                disabled={!transcript}
                className="flex items-center space-x-1 text-sm bg-white/10 hover:bg-white/20 disabled:bg-white/5 px-3 py-1 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Volume2 className="w-4 h-4" />
                <span>{speaking ? 'Stop' : 'Play'}</span>
              </button>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
              {transcript}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {transcript && (
          <div className="flex space-x-3">
            <motion.button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 px-6 py-4 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
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
                  <span>Processing with AI...</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Create Visual Guide</span>
                </>
              )}
            </motion.button>

            <button
              onClick={handleRetry}
              disabled={isProcessing}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 px-4 py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              aria-label="Retry recording"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Fallback suggestion */}
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <Type className="w-5 h-5" />
            <button
              onClick={handleUseFallback}
              className="text-sm hover:text-white transition-colors"
            >
              Having trouble with voice? Try <strong>text input instead</strong>
            </button>
          </div>
        </div>
      </div>
    </SmartPermissionHandler>
  );
};

export default VoiceInput;