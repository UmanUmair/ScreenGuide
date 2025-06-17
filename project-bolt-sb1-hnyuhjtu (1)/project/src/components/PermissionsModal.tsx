import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Monitor, Mic, Camera, X, CheckCircle } from 'lucide-react';

interface PermissionsModalProps {
  onPermissionsGranted?: () => void;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({ onPermissionsGranted }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleContinue = async () => {
    setIsRequesting(true);
    
    try {
      // Optional: Try screen & mic access
      await navigator.mediaDevices.getDisplayMedia({ video: true });
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Call parent callback
      if (onPermissionsGranted) onPermissionsGranted();
      console.log('Permissions granted successfully');
    } catch (error) {
      console.warn('Permissions not granted, continuing anyway.', error);
    } finally {
      setIsOpen(false); // Close modal regardless
      setIsRequesting(false);
    }
  };

  const handleClose = () => {
    console.warn('User closed modal without permissions');
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 w-full max-w-md text-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Permissions</h2>
                  <p className="text-sm text-gray-600">Enable features for better experience</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                aria-label="Close dialog"
                disabled={isRequesting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Permissions List */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Monitor className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-green-800">Screen Sharing</h3>
                  <p className="text-sm text-green-600">For visual guidance and step detection</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Mic className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-800">Microphone Access</h3>
                  <p className="text-sm text-blue-600">For voice commands and input</p>
                </div>
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Camera className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">Camera Access</h3>
                  <p className="text-sm text-gray-600">Optional - for future gesture features</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  Optional
                </span>
              </div>
            </div>

            {/* Info Message */}
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Note:</strong> If you deny permissions, the app will continue with alternative input methods like text and image upload.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={isRequesting}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
              >
                Skip
              </button>
              <button
                onClick={handleContinue}
                disabled={isRequesting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isRequesting ? 'Requesting...' : 'Continue'}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Permissions can be changed anytime in your browser settings
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PermissionsModal;