import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Eye, Volume2, CheckCircle } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import StepOverlay from './StepOverlay';

interface TaskViewerProps {
  onBack: () => void;
}

const TaskViewer: React.FC<TaskViewerProps> = ({ onBack }) => {
  const { currentTask } = useTask();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'live' | 'review' | 'auto'>('live');

  if (!currentTask) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium mb-4">No task selected</h2>
        <button
          onClick={onBack}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6 py-3 rounded-lg transition-all duration-200"
        >
          Back to Input
        </button>
      </div>
    );
  }

  const handleNextStep = () => {
    if (currentStep < currentTask.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = () => {
    const updatedSteps = [...currentTask.steps];
    updatedSteps[currentStep].completed = true;
    // Update task context here
    
    if (currentStep < currentTask.steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1000);
    }
  };

  const currentStepData = currentTask.steps[currentStep];
  const completedSteps = currentTask.steps.filter(step => step.completed).length;
  const progress = (completedSteps / currentTask.steps.length) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onBack}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </motion.button>
          
          <div>
            <h1 className="text-2xl font-bold">{currentTask.title}</h1>
            <p className="text-gray-400">{currentTask.description}</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
          {(['live', 'review', 'auto'] as const).map((modeOption) => (
            <button
              key={modeOption}
              onClick={() => setMode(modeOption)}
              className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-all duration-200 ${
                mode === modeOption
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {modeOption}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">
            Step {currentStep + 1} of {currentTask.steps.length}
          </span>
          <span className="text-sm text-gray-400">
            {completedSteps} completed
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Step */}
        <div className="lg:col-span-2">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-2">{currentStepData.title}</h2>
                <p className="text-gray-300 text-lg">{currentStepData.description}</p>
              </div>
              
              {currentStepData.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-400"
                >
                  <CheckCircle className="w-8 h-8" />
                </motion.div>
              )}
            </div>

            {/* Step Actions */}
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={handleStepComplete}
                disabled={currentStepData.completed}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
                whileHover={{ scale: currentStepData.completed ? 1 : 1.05 }}
                whileTap={{ scale: currentStepData.completed ? 1 : 0.95 }}
              >
                <CheckCircle className="w-5 h-5" />
                <span>{currentStepData.completed ? 'Completed' : 'Mark Complete'}</span>
              </motion.button>

              <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg transition-all duration-200">
                <Volume2 className="w-5 h-5" />
                <span>Read Aloud</span>
              </button>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center space-x-4 mt-6"
          >
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
              className="p-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed rounded-full transition-all duration-200"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full transition-all duration-200"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStep === currentTask.steps.length - 1}
              className="p-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed rounded-full transition-all duration-200"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </motion.div>
        </div>

        {/* Steps Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>All Steps</span>
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {currentTask.steps.map((step, index) => (
              <motion.button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-white/20 border border-white/30'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.completed 
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-600 text-gray-300'
                  }`}>
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs text-gray-400 truncate">{step.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Overlay */}
      {mode === 'live' && (
        <StepOverlay 
          step={currentStepData}
          isActive={true}
        />
      )}
    </div>
  );
};

export default TaskViewer;