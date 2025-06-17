import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  ArrowRight, 
  CheckCircle, 
  SkipForward, 
  SkipBack, 
  Play, 
  Pause,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface Instruction {
  id: number;
  text: string;
  completed: boolean;
  current: boolean;
}

interface FloatingInstructionGuideProps {
  instructions: Instruction[];
  currentStep: number;
  onStepComplete: (stepId: number) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  isScreenSharing: boolean;
}

const FloatingInstructionGuide: React.FC<FloatingInstructionGuideProps> = ({
  instructions,
  currentStep,
  onStepComplete,
  onNextStep,
  onPreviousStep,
  isScreenSharing
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const currentInstruction = instructions[currentStep];
  const progress = ((currentStep + 1) / instructions.length) * 100;

  if (!currentInstruction) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-20 right-6 z-40 w-80"
      drag
      dragMomentum={false}
      dragElastic={0.1}
    >
      <motion.div
        layout
        className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-semibold text-white">AI Guide</h3>
                <p className="text-xs text-blue-100">
                  Step {currentStep + 1} of {instructions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isScreenSharing && (
                <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-white">LIVE</span>
                </div>
              )}
              
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
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
        </div>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Current Instruction */}
              <div className="p-4 text-gray-900">
                <div className="mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {currentStep + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-relaxed">
                        {currentInstruction.text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mb-4">
                  <motion.button
                    onClick={() => onStepComplete(currentInstruction.id)}
                    disabled={currentInstruction.completed}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed"
                    whileHover={{ scale: currentInstruction.completed ? 1 : 1.05 }}
                    whileTap={{ scale: currentInstruction.completed ? 1 : 0.95 }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{currentInstruction.completed ? 'Done' : 'Complete'}</span>
                  </motion.button>

                  <button
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-all duration-200"
                  >
                    {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isAutoPlay ? 'Pause' : 'Auto'}</span>
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={onPreviousStep}
                    disabled={currentStep === 0}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <SkipBack className="w-4 h-4" />
                    <span className="text-sm">Previous</span>
                  </button>

                  <div className="text-xs text-gray-500">
                    {instructions.filter(i => i.completed).length} completed
                  </div>

                  <button
                    onClick={onNextStep}
                    disabled={currentStep === instructions.length - 1}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="text-sm">Next</span>
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mini Steps Overview */}
              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <div className="flex space-x-1 overflow-x-auto">
                  {instructions.map((instruction, index) => (
                    <button
                      key={instruction.id}
                      onClick={() => {
                        // Navigate to specific step (you can implement this)
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 flex-shrink-0 ${
                        instruction.completed
                          ? 'bg-green-500 text-white'
                          : index === currentStep
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                      }`}
                    >
                      {instruction.completed ? '✓' : index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default FloatingInstructionGuide;