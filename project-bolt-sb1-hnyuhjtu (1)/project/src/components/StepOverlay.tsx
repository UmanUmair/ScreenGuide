import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, MousePointer, Eye } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  type: 'action' | 'info' | 'warning';
}

interface StepOverlayProps {
  step: Step;
  isActive: boolean;
}

const StepOverlay: React.FC<StepOverlayProps> = ({ step, isActive }) => {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-50"
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Example pointer - would be positioned based on screen analysis */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <div className="relative">
          {/* Pulsing circle */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0.3, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 bg-blue-500/50 rounded-full absolute -inset-2"
          />
          
          {/* Arrow pointer */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full shadow-lg">
            <MousePointer className="w-6 h-6 text-white" />
          </div>
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg shadow-lg whitespace-nowrap"
          >
            <div className="text-sm font-medium">{step.title}</div>
            <div className="text-xs text-gray-600">{step.description}</div>
            
            {/* Arrow pointing up */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-white/95" />
          </motion.div>
        </div>
      </motion.div>

      {/* Floating instruction panel */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-900 p-4 rounded-xl shadow-xl max-w-sm pointer-events-auto"
      >
        <div className="flex items-start space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Current Step</h3>
            <p className="text-sm text-gray-600 mb-3">{step.description}</p>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                step.completed ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
              }`} />
              <span className="text-xs text-gray-500">
                {step.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StepOverlay;