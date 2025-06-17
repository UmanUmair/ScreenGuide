import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Lightbulb,
  Activity,
  Zap
} from 'lucide-react';
import { ScreenAnalysis } from '../services/aiVisionService';

interface AIAnalysisPanelProps {
  analysis: ScreenAnalysis | null;
  isAnalyzing: boolean;
  isEnabled: boolean;
  onToggle: () => void;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  analysis,
  isAnalyzing,
  isEnabled,
  onToggle
}) => {
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);

  useEffect(() => {
    if (analysis) {
      setLastAnalysisTime(new Date());
    }
  }, [analysis]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track': return CheckCircle;
      case 'completed': return CheckCircle;
      case 'off_track': return AlertTriangle;
      case 'error': return XCircle;
      default: return Eye;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-400';
      case 'completed': return 'text-green-400';
      case 'off_track': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-500/10 border-green-500/20';
      case 'completed': return 'bg-green-500/10 border-green-500/20';
      case 'off_track': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'error': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Vision Analysis</h3>
            <p className="text-sm text-gray-400">
              Real-time screen understanding
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {isAnalyzing && (
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"
              />
              <span className="text-sm text-purple-400">Analyzing...</span>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
              isEnabled
                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{isEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      <AnimatePresence mode="wait">
        {!isEnabled ? (
          <motion.div
            key="disabled"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <Eye className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <h4 className="font-medium text-gray-400 mb-2">AI Analysis Disabled</h4>
            <p className="text-sm text-gray-500">
              Enable AI analysis to get real-time guidance and visual cues
            </p>
          </motion.div>
        ) : !analysis ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            </motion.div>
            <h4 className="font-medium text-purple-400 mb-2">Initializing AI Vision</h4>
            <p className="text-sm text-gray-400">
              Preparing to analyze your screen for intelligent guidance
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Status */}
            <div className={`p-4 rounded-xl border ${getStatusBg(analysis.status)}`}>
              <div className="flex items-start space-x-3">
                {React.createElement(getStatusIcon(analysis.status), {
                  className: `w-6 h-6 ${getStatusColor(analysis.status)} mt-0.5`
                })}
                <div className="flex-1">
                  <h4 className={`font-medium ${getStatusColor(analysis.status)} mb-1`}>
                    {analysis.status === 'on_track' && 'On Track'}
                    {analysis.status === 'completed' && 'Step Completed'}
                    {analysis.status === 'off_track' && 'Needs Attention'}
                    {analysis.status === 'error' && 'Analysis Error'}
                  </h4>
                  <p className="text-sm text-gray-300">{analysis.message}</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getStatusColor(analysis.status)}`}>
                    {Math.round(analysis.confidence * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">confidence</div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium text-yellow-400">AI Suggestions</span>
                </div>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-2 p-3 bg-white/5 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-gray-300">{suggestion}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Cues Info */}
            {analysis.visualCues.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-blue-400">Visual Guidance Active</span>
                </div>
                <p className="text-sm text-blue-300">
                  {analysis.visualCues.length} visual cue{analysis.visualCues.length !== 1 ? 's' : ''} 
                  {' '}displayed on your screen to guide you through the current step.
                </p>
              </div>
            )}

            {/* Last Analysis Time */}
            {lastAnalysisTime && (
              <div className="text-center pt-2 border-t border-white/10">
                <p className="text-xs text-gray-500">
                  Last analyzed: {lastAnalysisTime.toLocaleTimeString()}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIAnalysisPanel;