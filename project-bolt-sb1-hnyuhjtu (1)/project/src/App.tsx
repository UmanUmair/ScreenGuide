import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import TaskInputPanel from './components/TaskInputPanel';
import TaskViewer from './components/TaskViewer';
import FloatingAssistant from './components/FloatingAssistant';
import PermissionsModal from './components/PermissionsModal';
import AIGuidePopup from './components/AIGuidePopup';
import { TaskProvider } from './contexts/TaskContext';
import { PermissionProvider } from './contexts/PermissionContext';

function App() {
  const [currentView, setCurrentView] = useState<'input' | 'viewer'>('input');
  const [showPermissionsModal, setShowPermissionsModal] = useState(true);

  const handlePermissionsGranted = () => {
    console.log('Permissions granted or skipped - continuing with app');
    setShowPermissionsModal(false);
  };

  // Auto-hide permissions modal after 30 seconds as fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showPermissionsModal) {
        console.log('Auto-hiding permissions modal after timeout');
        setShowPermissionsModal(false);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [showPermissionsModal]);

  return (
    <PermissionProvider>
      <TaskProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 transform rotate-12 scale-150"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-violet-500/20 to-pink-500/20 transform -rotate-12 scale-150"></div>
          </div>
          
          {/* Permissions Modal - Shows only once on app load */}
          {showPermissionsModal && (
            <PermissionsModal onPermissionsGranted={handlePermissionsGranted} />
          )}
          
          {/* Main Content */}
          <div className="relative z-10">
            <Header />
            
            <main className="container mx-auto px-4 py-8">
              <AnimatePresence mode="wait">
                {currentView === 'input' ? (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TaskInputPanel onTaskCreated={() => setCurrentView('viewer')} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="viewer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TaskViewer onBack={() => setCurrentView('input')} />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
            
            <FloatingAssistant />
          </div>

          {/* AI Guide Popup - Persistent across all views */}
          <AIGuidePopup
            title="AI Task Guide"
            autoStart={true}
            position={{ x: 20, y: 100 }}
            onComplete={() => console.log('Guide completed!')}
            onDismiss={() => console.log('Guide dismissed!')}
          />
        </div>
      </TaskProvider>
    </PermissionProvider>
  );
}

export default App;