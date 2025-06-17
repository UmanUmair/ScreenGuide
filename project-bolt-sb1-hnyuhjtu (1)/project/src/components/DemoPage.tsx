import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw, Settings, Home, User, Bell } from 'lucide-react';
import AIGuidePopup from './AIGuidePopup';

const DemoPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [showCustomGuide, setShowCustomGuide] = useState(false);

  const customSteps = [
    {
      id: 1,
      title: "Custom Guide Demo",
      description: "This is a custom guide with different steps to demonstrate the flexibility of the AI Guide component.",
      completed: false
    },
    {
      id: 2,
      title: "Navigate Tabs",
      description: "Try clicking on different tabs (Home, Profile, Settings) to see how the guide persists across navigation.",
      completed: false
    },
    {
      id: 3,
      title: "Refresh Test",
      description: "Refresh this page to see how the guide remembers your progress and position.",
      completed: false
    },
    {
      id: 4,
      title: "Multiple Guides",
      description: "You can have multiple guide instances running simultaneously with different content.",
      completed: false
    }
  ];

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const handleStartCustomGuide = () => {
    // Clear any existing guide state for demo
    localStorage.removeItem('aiGuideState');
    localStorage.removeItem('aiGuideStatus');
    setShowCustomGuide(true);
  };

  const handleResetGuides = () => {
    localStorage.removeItem('aiGuideState');
    localStorage.removeItem('aiGuideStatus');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Guide Popup Demo
          </h1>
          <p className="text-xl text-gray-300">
            Persistent, draggable, and intelligent step-by-step guidance
          </p>
        </motion.div>

        {/* Demo Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Demo Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleStartCustomGuide}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              <ArrowRight className="w-5 h-5" />
              <span>Start Custom Guide</span>
            </button>
            
            <button
              onClick={handleResetGuides}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Reset All Guides</span>
            </button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
          <div className="flex space-x-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-2">
              {tabs.find(t => t.id === currentTab)?.label} Content
            </h3>
            <p className="text-gray-300">
              This is the {currentTab} page content. Notice how the AI Guide popup 
              persists when you switch between tabs. The guide maintains its position, 
              state, and progress across all navigation.
            </p>
          </div>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Features Demonstrated</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "✅ Persistent across page reloads",
              "✅ Draggable positioning",
              "✅ localStorage state management",
              "✅ Step navigation controls",
              "✅ Auto-play functionality",
              "✅ Minimize/maximize",
              "✅ Progress tracking",
              "✅ React Portal rendering",
              "✅ Responsive design",
              "✅ Smooth animations",
              "✅ Custom step content",
              "✅ Completion tracking"
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-green-400">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Custom Guide Instance */}
      {showCustomGuide && (
        <AIGuidePopup
          steps={customSteps}
          title="Custom Demo Guide"
          position={{ x: window.innerWidth - 400, y: 150 }}
          onComplete={() => {
            console.log('Custom guide completed!');
            setShowCustomGuide(false);
          }}
          onDismiss={() => {
            console.log('Custom guide dismissed!');
            setShowCustomGuide(false);
          }}
        />
      )}
    </div>
  );
};

export default DemoPage;