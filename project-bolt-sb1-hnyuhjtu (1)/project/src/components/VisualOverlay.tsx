import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUp, ArrowLeft, Target, MessageCircle } from 'lucide-react';
import { VisualCue } from '../services/aiVisionService';

interface VisualOverlayProps {
  visualCues: VisualCue[];
  isActive: boolean;
  screenDimensions: { width: number; height: number };
}

const VisualOverlay: React.FC<VisualOverlayProps> = ({ 
  visualCues, 
  isActive, 
  screenDimensions 
}) => {
  if (!isActive || visualCues.length === 0) return null;

  const getArrowIcon = (direction: string) => {
    switch (direction) {
      case 'up': return ArrowUp;
      case 'down': return ArrowDown;
      case 'left': return ArrowLeft;
      case 'right': return ArrowRight;
      default: return ArrowDown;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {visualCues.map((cue, index) => {
          const x = (cue.x / 1920) * screenDimensions.width;
          const y = (cue.y / 1080) * screenDimensions.height;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                delay: index * 0.2,
                type: "spring", 
                stiffness: 260, 
                damping: 20 
              }}
              className="absolute"
              style={{ 
                left: x, 
                top: y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {cue.type === 'arrow' && (
                <div className="relative">
                  {/* Pulsing background */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.5, 1], 
                      opacity: [0.7, 0.3, 0.7] 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity 
                    }}
                    className="w-12 h-12 rounded-full absolute -inset-2"
                    style={{ backgroundColor: `${cue.color}50` }}
                  />
                  
                  {/* Arrow */}
                  <div 
                    className="p-3 rounded-full shadow-lg"
                    style={{ backgroundColor: cue.color || '#3B82F6' }}
                  >
                    <ArrowDown className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Tooltip */}
                  {cue.text && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap text-sm font-medium"
                    >
                      {cue.text}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900/90" />
                    </motion.div>
                  )}
                </div>
              )}

              {cue.type === 'highlight' && (
                <motion.div
                  animate={{ 
                    opacity: [0.3, 0.7, 0.3] 
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity 
                  }}
                  className="border-4 border-dashed rounded-lg"
                  style={{ 
                    borderColor: cue.color || '#F59E0B',
                    width: cue.width || 100,
                    height: cue.height || 40,
                    backgroundColor: `${cue.color || '#F59E0B'}20`
                  }}
                >
                  {cue.text && (
                    <div 
                      className="absolute -top-8 left-0 px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: cue.color || '#F59E0B' }}
                    >
                      {cue.text}
                    </div>
                  )}
                </motion.div>
              )}

              {cue.type === 'circle' && (
                <div className="relative">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity 
                    }}
                    className="w-16 h-16 rounded-full border-4 border-dashed flex items-center justify-center"
                    style={{ borderColor: cue.color || '#10B981' }}
                  >
                    <Target 
                      className="w-8 h-8"
                      style={{ color: cue.color || '#10B981' }}
                    />
                  </motion.div>
                  
                  {cue.text && (
                    <div 
                      className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
                      style={{ backgroundColor: cue.color || '#10B981' }}
                    >
                      {cue.text}
                    </div>
                  )}
                </div>
              )}

              {cue.type === 'tooltip' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-2xl max-w-xs"
                >
                  <div className="flex items-start space-x-2">
                    <MessageCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{cue.text}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default VisualOverlay;