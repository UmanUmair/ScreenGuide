import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Type, Upload, Mic, Monitor, ArrowRight, Brain } from 'lucide-react';
import TextInput from './input/TextInput';
import ImageInput from './input/ImageInput';
import VoiceInput from './input/VoiceInput';
import ScreenSelector from './input/ScreenSelector';
import ScreenShareViewer from './ScreenShareViewer';
import InstructionProcessor from './InstructionProcessor';
import FloatingInstructionGuide from './FloatingInstructionGuide';
import AIAnalysisPanel from './AIAnalysisPanel';
import { useTask } from '../contexts/TaskContext';
import { aiVisionService, ScreenAnalysis } from '../services/aiVisionService';

interface TaskInputPanelProps {
  onTaskCreated: () => void;
}

type InputMode = 'text' | 'image' | 'voice' | 'screen';
type AppPhase = 'input' | 'processing' | 'guidance';

interface Instruction {
  id: number;
  text: string;
  completed: boolean;
  current: boolean;
}

const TaskInputPanel: React.FC<TaskInputPanelProps> = ({ onTaskCreated }) => {
  const [activeMode, setActiveMode] = useState<InputMode>('text');
  const [currentPhase, setCurrentPhase] = useState<AppPhase>('input');
  const [rawInstructions, setRawInstructions] = useState('');
  const [processedInstructions, setProcessedInstructions] = useState<Instruction[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<ScreenAnalysis | null>(null);
  const [isAiAnalysisEnabled, setIsAiAnalysisEnabled] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastScreenCapture, setLastScreenCapture] = useState<string | null>(null);
  const { setCurrentTask } = useTask();

  const inputModes = [
    { id: 'text', label: 'Text Instructions', icon: Type, color: 'from-blue-500 to-cyan-500' },
    { id: 'image', label: 'Upload Screenshot', icon: Upload, color: 'from-green-500 to-emerald-500' },
    { id: 'voice', label: 'Voice Input', icon: Mic, color: 'from-red-500 to-pink-500' },
    { id: 'screen', label: 'Select from Screen', icon: Monitor, color: 'from-purple-500 to-violet-500' },
  ] as const;

  const handleInstructionSubmit = (instructions: string) => {
    setRawInstructions(instructions);
    setCurrentPhase('processing');
  };

  const handleTaskSubmit = (task: any) => {
    // Convert task to instructions format
    const instructionText = task.steps.map((step: any) => step.description).join('\n');
    handleInstructionSubmit(instructionText);
  };

  const handleInstructionsProcessed = (instructions: Instruction[]) => {
    setProcessedInstructions(instructions);
    setCurrentPhase('guidance');
    
    // Create task for context
    const task = {
      id: Date.now().toString(),
      title: 'AI Guided Task',
      description: 'Task with live AI guidance',
      steps: instructions.map(inst => ({
        id: inst.id,
        title: `Step ${inst.id}`,
        description: inst.text,
        completed: inst.completed,
        type: 'action' as const
      })),
      mode: activeMode,
      createdAt: new Date().toISOString()
    };
    
    setCurrentTask(task);
  };

  const handleStepComplete = (stepId: number) => {
    setProcessedInstructions(prev => 
      prev.map(inst => 
        inst.id === stepId 
          ? { ...inst, completed: true, current: false }
          : inst
      )
    );
    
    // Auto-advance to next step
    if (currentStep < processedInstructions.length - 1) {
      setTimeout(() => {
        handleNextStep();
      }, 1000);
    }
  };

  const handleNextStep = () => {
    if (currentStep < processedInstructions.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setProcessedInstructions(prev => 
        prev.map((inst, index) => ({
          ...inst,
          current: index === nextStep
        }))
      );
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setProcessedInstructions(prev => 
        prev.map((inst, index) => ({
          ...inst,
          current: index === prevStep
        }))
      );
    }
  };

  const handleStartScreenShare = () => {
    setIsScreenSharing(true);
  };

  const handleStopScreenShare = () => {
    setIsScreenSharing(false);
    aiVisionService.stopContinuousAnalysis();
  };

  const handleScreenCapture = async (imageData: string) => {
    setLastScreenCapture(imageData);
    
    if (isAiAnalysisEnabled && processedInstructions.length > 0) {
      setIsAnalyzing(true);
      
      try {
        const instructions = processedInstructions.map(inst => inst.text);
        const analysis = await aiVisionService.analyzeScreen(
          imageData,
          instructions,
          currentStep
        );
        
        setAiAnalysis(analysis);
        
        // Auto-complete step if AI detects completion
        if (analysis.status === 'completed' && !processedInstructions[currentStep]?.completed) {
          setTimeout(() => {
            handleStepComplete(processedInstructions[currentStep].id);
          }, 2000);
        }
      } catch (error) {
        console.error('AI analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleToggleAiAnalysis = () => {
    setIsAiAnalysisEnabled(!isAiAnalysisEnabled);
    if (!isAiAnalysisEnabled) {
      setAiAnalysis(null);
    }
  };

  const handleBackToInput = () => {
    setCurrentPhase('input');
    setRawInstructions('');
    setProcessedInstructions([]);
    setCurrentStep(0);
    setIsScreenSharing(false);
    setAiAnalysis(null);
    aiVisionService.stopContinuousAnalysis();
  };

  // Start continuous analysis when screen sharing begins
  useEffect(() => {
    if (isScreenSharing && isAiAnalysisEnabled && processedInstructions.length > 0) {
      aiVisionService.startContinuousAnalysis(
        async () => lastScreenCapture || '',
        () => processedInstructions.map(inst => inst.text),
        () => currentStep,
        (analysis) => setAiAnalysis(analysis),
        8000 // Analyze every 8 seconds
      );
    } else {
      aiVisionService.stopContinuousAnalysis();
    }

    return () => {
      aiVisionService.stopContinuousAnalysis();
    };
  }, [isScreenSharing, isAiAnalysisEnabled, processedInstructions, currentStep, lastScreenCapture]);

  // Phase 1: Input Selection
  if (currentPhase === 'input') {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            How would you like to provide your task instructions?
          </h2>
          <p className="text-gray-400 text-lg">
            Choose your preferred method to get started with intelligent visual guidance
          </p>
        </motion.div>

        {/* Input Mode Selector */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {inputModes.map((mode, index) => (
            <motion.button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                activeMode === mode.id
                  ? 'bg-white/20 border-white/30 shadow-lg'
                  : 'bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20'
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-r ${mode.color}`}>
                <mode.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">{mode.label}</span>
              {activeMode === mode.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-2 h-2 bg-white rounded-full"
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Input Content Area */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {activeMode === 'text' && <TextInput onSubmit={handleInstructionSubmit} />}
          {activeMode === 'image' && <ImageInput onSubmit={handleTaskSubmit} />}
          {activeMode === 'voice' && <VoiceInput onSubmit={handleTaskSubmit} />}
          {activeMode === 'screen' && <ScreenSelector onSubmit={handleTaskSubmit} />}
        </motion.div>
      </div>
    );
  }

  // Phase 2: Processing Instructions
  if (currentPhase === 'processing') {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Processing Your Instructions
          </h2>
          <p className="text-gray-400 text-lg">
            Converting your input into actionable, step-by-step guidance
          </p>
        </motion.div>

        <InstructionProcessor 
          rawInstructions={rawInstructions}
          onInstructionsProcessed={handleInstructionsProcessed}
        />

        <div className="text-center mt-6">
          <button
            onClick={handleBackToInput}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            ← Back to input
          </button>
        </div>
      </div>
    );
  }

  // Phase 3: Live Guidance with AI Vision
  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI-Enhanced Live Guidance
        </h2>
        <p className="text-gray-400 text-lg">
          Real-time screen analysis with intelligent visual cues and step tracking
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Screen Share Section */}
        <div className="lg:col-span-2">
          {!isScreenSharing ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl text-center"
            >
              <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold mb-4">Enable AI-Enhanced Screen Sharing</h3>
              <p className="text-gray-400 mb-6">
                Share your screen to activate real-time AI analysis, visual guidance, and automatic progress tracking
              </p>
              <motion.button
                onClick={handleStartScreenShare}
                className="flex items-center space-x-3 mx-auto bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 px-8 py-4 rounded-xl font-medium transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Monitor className="w-6 h-6" />
                <span>Start AI-Enhanced Sharing</span>
              </motion.button>
            </motion.div>
          ) : (
            <ScreenShareViewer 
              isActive={isScreenSharing}
              onStop={handleStopScreenShare}
              visualCues={aiAnalysis?.visualCues || []}
              onScreenCapture={handleScreenCapture}
            />
          )}
        </div>

        {/* AI Analysis & Instructions Panel */}
        <div className="space-y-6">
          {/* AI Analysis Panel */}
          <AIAnalysisPanel
            analysis={aiAnalysis}
            isAnalyzing={isAnalyzing}
            isEnabled={isAiAnalysisEnabled}
            onToggle={handleToggleAiAnalysis}
          />

          {/* Instructions Overview */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold">Task Overview</h3>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {processedInstructions.map((instruction, index) => (
                <motion.div
                  key={instruction.id}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    instruction.current
                      ? 'bg-blue-500/20 border-blue-500/30'
                      : instruction.completed
                        ? 'bg-green-500/20 border-green-500/30'
                        : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      instruction.completed 
                        ? 'bg-green-500 text-white'
                        : instruction.current
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-600 text-gray-300'
                    }`}>
                      {instruction.completed ? '✓' : instruction.id}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{instruction.text}</p>
                      {instruction.current && (
                        <div className="flex items-center space-x-1 mt-2">
                          <ArrowRight className="w-4 h-4 text-blue-400" />
                          <span className="text-xs text-blue-400 font-medium">Current Step</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Instruction Guide */}
      <FloatingInstructionGuide
        instructions={processedInstructions}
        currentStep={currentStep}
        onStepComplete={handleStepComplete}
        onNextStep={handleNextStep}
        onPreviousStep={handlePreviousStep}
        isScreenSharing={isScreenSharing}
      />

      <div className="text-center mt-8">
        <button
          onClick={handleBackToInput}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          ← Start New Task
        </button>
      </div>
    </div>
  );
};

export default TaskInputPanel;