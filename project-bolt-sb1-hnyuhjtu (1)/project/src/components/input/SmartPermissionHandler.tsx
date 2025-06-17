import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Shield, RefreshCw, X, CheckCircle, Upload, Type } from 'lucide-react';

interface SmartPermissionHandlerProps {
  permissionType: 'screen' | 'microphone' | 'camera';
  isRequired: boolean;
  onPermissionGranted: () => void;
  onFallback: () => void;
  requestPermission: () => Promise<boolean>;
  error?: string;
  isSupported: boolean;
  fallbackText: string;
  children: React.ReactNode;
}

const SmartPermissionHandler: React.FC<SmartPermissionHandlerProps> = ({
  permissionType,
  isRequired,
  onPermissionGranted,
  onFallback,
  requestPermission,
  error,
  isSupported,
  fallbackText,
  children
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [showError, setShowError] = useState(!!error);
  const [hasAttempted, setHasAttempted] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    setShowError(false);
    setHasAttempted(true);
    
    try {
      const granted = await requestPermission();
      if (granted) {
        onPermissionGranted();
      } else {
        setShowError(true);
      }
    } catch (err) {
      setShowError(true);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleUseFallback = () => {
    setShowError(false);
    onFallback();
  };

  const handleDismissError = () => {
    setShowError(false);
  };

  // Show error state
  if (showError && error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-500/10 border border-red-500/20 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-red-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-400 mb-2">Permission Required</h3>
            <p className="text-sm text-red-300 mb-4">{error}</p>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {isRequesting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                <span>{isRequesting ? 'Requesting...' : 'Try Again'}</span>
              </button>
              
              <button
                onClick={handleUseFallback}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {permissionType === 'screen' ? <Upload className="w-4 h-4" /> : <Type className="w-4 h-4" />}
                <span>{fallbackText}</span>
              </button>
              
              {!isRequired && (
                <button
                  onClick={handleDismissError}
                  className="text-gray-400 hover:text-gray-300 px-2 py-2 text-sm transition-colors"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={handleDismissError}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Show unsupported state
  if (!isSupported) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-400 mb-2">Feature Not Supported</h3>
            <p className="text-sm text-amber-300 mb-4">
              {permissionType === 'screen' ? 'Screen sharing' : 
               permissionType === 'microphone' ? 'Microphone access' : 'Camera access'} 
              is not supported in this browser. Please use Chrome, Edge, or Firefox.
            </p>
            
            <button
              onClick={handleUseFallback}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              {permissionType === 'screen' ? <Upload className="w-4 h-4" /> : <Type className="w-4 h-4" />}
              <span>{fallbackText}</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show HTTPS warning
  if (!window.isSecureContext) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-500/10 border border-red-500/20 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-red-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-400 mb-2">Secure Connection Required</h3>
            <p className="text-sm text-red-300 mb-4">
              {permissionType === 'screen' ? 'Screen sharing' : 
               permissionType === 'microphone' ? 'Microphone access' : 'Camera access'} 
              requires HTTPS. Please access this site over a secure connection.
            </p>
            
            <button
              onClick={handleUseFallback}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              {permissionType === 'screen' ? <Upload className="w-4 h-4" /> : <Type className="w-4 h-4" />}
              <span>{fallbackText}</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show normal content
  return <>{children}</>;
};

export default SmartPermissionHandler;