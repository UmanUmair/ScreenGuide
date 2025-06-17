import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, Eye } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <motion.header 
      className="backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Visual Task Guide
              </h1>
              <p className="text-xs text-gray-400">Intelligent Step-by-Step Assistance</p>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <motion.div 
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1"
              whileHover={{ scale: 1.05 }}
            >
              <Eye className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Live</span>
            </motion.div>
            
            <motion.button
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-4 py-2 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Quick Start</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;