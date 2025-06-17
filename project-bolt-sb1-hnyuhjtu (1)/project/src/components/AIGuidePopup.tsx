import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Draggable from 'react-draggable';
import { 
  Eye, 
  X, 
  SkipBack, 
  SkipForward, 
  Play, 
  Pause, 
  CheckCircle,
  Minimize2,
  Maximize2,
  RotateCcw,
  GripHorizontal,
  Brain,
  ArrowRight
} from 'lucide-react';

interface GuideStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface AIGuidePopupProps {
  steps?: GuideStep[];
  title?: string;
  onComplete?: () => void;
  onDismiss?: () => void;
  autoStart?: boolean;
  position?: { x: number; y: number };
}

interface GuideState {
  isVisible: boolean;
  currentStep: number;
  isMinimized: boolean;
  isPlaying: boolean;
  position: { x: number; y: number };
  completedSteps: number[];
  status: 'active' | 'paused' | 'completed' | 'dismissed';
}

const STORAGE_KEY = 'aiGuideState';
const STATUS_KEY = 'aiGuideStatus';

const defaultSteps: GuideStep[] = [
  {
    id: 1,
    title: "Welcome to AI Guide",
    description: "This popup will guide you through tasks step by step. You can drag it around and it will persist across page reloads.",
    completed: false
  },
  {
    id: 2,
    title: "Navigation Controls",
    description: "Use the Previous/Next buttons to navigate between steps, or click the step numbers at the bottom.",
    completed: false
  },
  {
    id: 3,
    title: "Auto-Play Feature",
    description: "Click the Play button to automatically advance through steps every 10 seconds.",
    completed: false
  },
  {
    id: 4,
    title: "Minimize & Maximize",
    description: "Click the minimize button to collapse the popup while keeping it accessible.",
    completed: false
  },
  {
    id: 5,
    title: "Persistent State",
    description: "Your progress is automatically saved. Refresh the page and this popup will remember where you left off.",
    completed: false
  },
  {
    id: 6,
    title: "Complete Steps",
    description: "Mark steps as complete using the Complete button. Completed steps are saved automatically.",
    completed: false
  },
  {
    id: 7,
    title: "Drag to Reposition",
    description: "Grab the header area to drag this popup to any position on your screen.",
    completed: false
  },
  {
    id: 8,
    title: "Finish Guide",
    description: "When you're done, click the Done button to permanently dismiss this guide.",
    completed: false
  }
];

const AIGuidePopup: React.FC<AIGuidePopupProps> = ({
  steps = defaultSteps,
  title = "AI Guide",
  onComplete,
  onDismiss,
  autoStart = true,
  position = { x: 20, y: 100 }
}) => {
  const [guideState, setGuideState] = useState<GuideState>(() => {
    // Check if guide was previously dismissed
    const status = localStorage.getItem(STATUS_KEY);
    if (status === 'done') {
      return {
        isVisible: false,
        currentStep: 0,
        isMinimized: false,
        isPlaying: false,
        position,
        completedSteps: [],
        status: 'dismissed'
      };
    }

    // Load saved state or use defaults
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isVisible: true,
          isPlaying: false // Don't auto-resume playing
        };
      } catch (e) {
        console.warn('Failed to parse saved guide state');
      }
    }

    return {
      isVisible: autoStart,
      currentStep: 0,
      isMinimized: false,
      isPlaying: false,
      position,
      completedSteps: [],
      status: 'active'
    };
  });

  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Create portal container on mount
  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'ai-guide-portal';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (guideState.status !== 'dismissed') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guideState));
    }
  }, [guideState]);

  // Auto-play functionality
  useEffect(() => {
    if (guideState.isPlaying && guideState.isVisible && !guideState.isMinimized) {
      autoPlayIntervalRef.current = setInterval(() => {
        setGuideState(prev => {
          if (prev.currentStep < steps.length - 1) {
            return { ...prev, currentStep: prev.currentStep + 1 };
          } else {
            return { ...prev, isPlaying: false };
          }
        });
      }, 10000); // 10 seconds per step

      return () => {
        if (autoPlayIntervalRef.current) {
          clearInterval(autoPlayIntervalRef.current);
        }
      };
    }
  }, [guideState.isPlaying, guideState.isVisible, guideState.isMinimized, steps.length]);

  // Cleanup auto-play on unmount
  useEffect(() => {
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, []);

  const currentStep = steps[guideState.currentStep];
  const progress = ((guideState.currentStep + 1) / steps.length) * 100;
  const completedCount = guideState.completedSteps.length;

  const handlePrevious = () => {
    if (guideState.currentStep > 0) {
      setGuideState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
        isPlaying: false
      }));
    }
  };

  const handleNext = () => {
    if (guideState.currentStep < steps.length - 1) {
      setGuideState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        isPlaying: false
      }));
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setGuideState(prev => ({
      ...prev,
      currentStep: stepIndex,
      isPlaying: false
    }));
  };

  const handleComplete = () => {
    const stepId = currentStep.id;
    setGuideState(prev => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(stepId) 
        ? prev.completedSteps 
        : [...prev.completedSteps, stepId]
    }));
  };

  const handlePlayPause = () => {
    setGuideState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const handleMinimize = () => {
    setGuideState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized,
      isPlaying: false
    }));
  };

  const handleRestart = () => {
    setGuideState(prev => ({
      ...prev,
      currentStep: 0,
      completedSteps: [],
      isPlaying: false,
      status: 'active'
    }));
  };

  const handleDone = () => {
    localStorage.setItem(STATUS_KEY, 'done');
    localStorage.removeItem(STORAGE_KEY);
    setGuideState(prev => ({
      ...prev,
      isVisible: false,
      status: 'dismissed'
    }));
    onComplete?.();
    onDismiss?.();
  };

  const handleDragStop = (e: any, data: any) => {
    setGuideState(prev => ({
      ...prev,
      position: { x: data.x, y: data.y }
    }));
  };

  // Don't render if not visible or dismissed
  if (!guideState.isVisible || guideState.status === 'dismissed' || !portalContainer) {
    return null;
  }

  const popupContent = (
    <Draggable
      handle=".drag-handle"
      position={guideState.position}
      onStop={handleDragStop}
      bounds="parent"
    >
      <motion.div
        ref={dragRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
        style={{ 
          width: guideState.isMinimized ? '280px' : '380px',
          pointerEvents: 'auto',
          zIndex: 10000
        }}
      >
        {/* Header */}
        <div className="drag-handle bg-gradient-to-r from-blue-500 to-purple-500 p-4 cursor-move">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-white" />
                <GripHorizontal className="w-4 h-4 text-white/70" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-xs text-blue-100">
                  Step {guideState.currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {guideState.isPlaying && !guideState.isMinimized && (
                <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-white">AUTO</span>
                </div>
              )}
              
              <button
                onClick={handleMinimize}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
                title={guideState.isMinimized ? "Maximize" : "Minimize"}
              >
                {guideState.isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              
              <button
                onClick={handleDone}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
                title="Close Guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          {!guideState.isMinimized && (
            <div className="mt-3">
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {!guideState.isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Current Step Content */}
              <div className="p-6 text-gray-900">
                <div className="mb-6">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      guideState.completedSteps.includes(currentStep.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {guideState.completedSteps.includes(currentStep.id) ? '✓' : guideState.currentStep + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">{currentStep.title}</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {currentStep.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 mb-6">
                  <motion.button
                    onClick={handleComplete}
                    disabled={guideState.completedSteps.includes(currentStep.id)}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed"
                    whileHover={{ scale: guideState.completedSteps.includes(currentStep.id) ? 1 : 1.05 }}
                    whileTap={{ scale: guideState.completedSteps.includes(currentStep.id) ? 1 : 0.95 }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{guideState.completedSteps.includes(currentStep.id) ? 'Completed' : 'Complete'}</span>
                  </motion.button>

                  <button
                    onClick={handlePlayPause}
                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    {guideState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{guideState.isPlaying ? 'Pause' : 'Auto'}</span>
                  </button>

                  <button
                    onClick={handleRestart}
                    className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    title="Restart Guide"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrevious}
                    disabled={guideState.currentStep === 0}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <SkipBack className="w-4 h-4" />
                    <span className="text-sm">Previous</span>
                  </button>

                  <div className="text-xs text-gray-500">
                    {completedCount} of {steps.length} completed
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={guideState.currentStep === steps.length - 1}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="text-sm">Next</span>
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Step Indicators */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {steps.map((step, index) => (
                      <button
                        key={step.id}
                        onClick={() => handleStepClick(index)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                          guideState.completedSteps.includes(step.id)
                            ? 'bg-green-500 text-white'
                            : index === guideState.currentStep
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                        }`}
                        title={step.title}
                      >
                        {guideState.completedSteps.includes(step.id) ? '✓' : index + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Done Button */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleDone}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    Done - Close Guide
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Draggable>
  );

  return createPortal(popupContent, portalContainer);
};

export default AIGuidePopup;