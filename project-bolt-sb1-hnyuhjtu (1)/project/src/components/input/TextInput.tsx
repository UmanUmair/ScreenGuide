import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';

interface TextInputProps {
  onSubmit: (instructions: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    
    // Simulate brief processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSubmit(text.trim());
    setIsProcessing(false);
  };

  const handleExampleClick = (example: string) => {
    setText(example);
  };

  const examples = [
    "1. Open Chrome browser\n2. Navigate to Gmail.com\n3. Click Sign In\n4. Enter your email address\n5. Enter your password\n6. Click Sign In button",
    "1. Open Microsoft Word\n2. Click File menu\n3. Select New Document\n4. Choose Blank Document\n5. Start typing your content",
    "1. Open File Explorer\n2. Navigate to Downloads folder\n3. Right-click on the file\n4. Select Copy\n5. Navigate to Desktop\n6. Right-click and Paste"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3 text-gray-300">
          Paste your step-by-step instructions
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste instructions from ChatGPT, documentation, or type your own step-by-step guide...

Example:
1. Open Chrome browser
2. Navigate to Gmail.com  
3. Click Sign In
4. Enter your email address
5. Enter your password
6. Click Sign In button"
          className="w-full h-48 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isProcessing}
        />
      </div>

      {/* Quick Examples */}
      <div className="space-y-3">
        <p className="text-sm text-gray-400">Quick examples to try:</p>
        <div className="grid gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <p className="text-sm text-gray-300 truncate">{example.split('\n')[0]}...</p>
            </button>
          ))}
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={!text.trim() || isProcessing}
        className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 px-6 py-4 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
        whileHover={{ scale: !text.trim() || isProcessing ? 1 : 1.02 }}
        whileTap={{ scale: !text.trim() || isProcessing ? 1 : 0.98 }}
      >
        {isProcessing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Start AI Guidance</span>
          </>
        )}
      </motion.button>
    </form>
  );
};

export default TextInput;