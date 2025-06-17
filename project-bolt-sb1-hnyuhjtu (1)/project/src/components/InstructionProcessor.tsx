import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

interface Instruction {
  id: number;
  text: string;
  completed: boolean;
  current: boolean;
}

interface InstructionProcessorProps {
  rawInstructions: string;
  onInstructionsProcessed: (instructions: Instruction[]) => void;
}

const InstructionProcessor: React.FC<InstructionProcessorProps> = ({ 
  rawInstructions, 
  onInstructionsProcessed 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedInstructions, setProcessedInstructions] = useState<Instruction[]>([]);

  const processInstructions = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Parse instructions into steps
    const steps = rawInstructions
      .split(/\n|\.|\d+\./)
      .filter(step => step.trim().length > 10)
      .map((step, index) => ({
        id: index + 1,
        text: step.trim(),
        completed: false,
        current: index === 0
      }))
      .slice(0, 8); // Limit to 8 steps for demo

    setProcessedInstructions(steps);
    onInstructionsProcessed(steps);
    setIsProcessing(false);
  };

  React.useEffect(() => {
    if (rawInstructions && !processedInstructions.length) {
      processInstructions();
    }
  }, [rawInstructions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">AI Instruction Processing</h3>
          <p className="text-sm text-gray-400">
            Converting your instructions into actionable steps
          </p>
        </div>
      </div>

      {/* Raw Instructions Preview */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-300">Original Instructions</span>
        </div>
        <div className="bg-white/5 rounded-xl p-4 max-h-32 overflow-y-auto">
          <p className="text-sm text-gray-300 whitespace-pre-wrap">
            {rawInstructions.substring(0, 300)}
            {rawInstructions.length > 300 && '...'}
          </p>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing ? (
        <div className="text-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <Sparkles className="w-12 h-12 text-blue-400" />
          </motion.div>
          <h4 className="font-medium mb-2">Processing Instructions...</h4>
          <p className="text-sm text-gray-400">
            AI is analyzing and breaking down your instructions into steps
          </p>
        </div>
      ) : processedInstructions.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="font-medium text-green-400">
              Processed into {processedInstructions.length} steps
            </span>
          </div>

          {/* Processed Steps */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {processedInstructions.map((instruction, index) => (
              <motion.div
                key={instruction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
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
      ) : null}
    </motion.div>
  );
};

export default InstructionProcessor;