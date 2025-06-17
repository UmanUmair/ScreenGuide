import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface PermissionContextType {
  hasScreenPermission: boolean;
  hasMicPermission: boolean;
  hasCameraPermission: boolean;
  showPermissionDialog: boolean;
  pendingPermission: string | null;
  permissionErrors: Record<string, string>;
  isSupported: {
    screen: boolean;
    microphone: boolean;
    camera: boolean;
  };
  requestScreenPermission: () => Promise<boolean>;
  requestMicPermission: () => Promise<boolean>;
  requestCameraPermission: () => Promise<boolean>;
  showPermissionDialog: () => void;
  hidePermissionDialog: () => void;
  clearPermissionError: (type: string) => void;
  retryPermission: (type: string) => Promise<boolean>;
  checkExistingPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [hasScreenPermission, setHasScreenPermission] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingPermission, setPendingPermission] = useState<string | null>(null);
  const [permissionErrors, setPermissionErrors] = useState<Record<string, string>>({});

  // Check API support
  const isSupported = {
    screen: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
    microphone: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
  };

  // Check existing permissions on mount
  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    // Check if we're in a secure context
    if (!window.isSecureContext) return;

    try {
      // Check microphone permission
      if (navigator.permissions && isSupported.microphone) {
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setHasMicPermission(micPermission.state === 'granted');
        
        // Listen for permission changes
        micPermission.onchange = () => {
          setHasMicPermission(micPermission.state === 'granted');
        };
      }

      // Check camera permission
      if (navigator.permissions && isSupported.camera) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setHasCameraPermission(cameraPermission.state === 'granted');
        
        // Listen for permission changes
        cameraPermission.onchange = () => {
          setHasCameraPermission(cameraPermission.state === 'granted');
        };
      }
    } catch (error) {
      // Permissions API not fully supported, will check on demand
      console.log('Permissions API not fully supported, will check on demand');
    }
  };

  const clearPermissionError = (type: string) => {
    setPermissionErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[type];
      return newErrors;
    });
  };

  const setPermissionError = (type: string, message: string) => {
    setPermissionErrors(prev => ({ ...prev, [type]: message }));
  };

  const requestScreenPermission = async (): Promise<boolean> => {
    if (!isSupported.screen) {
      setPermissionError('screen', 'Screen sharing is not supported in this browser. Please use Chrome, Edge, or Firefox.');
      return false;
    }

    // Check if we're on HTTPS or localhost
    if (!window.isSecureContext) {
      setPermissionError('screen', 'Screen sharing requires HTTPS. Please access this site over a secure connection.');
      return false;
    }

    setPendingPermission('screen');
    clearPermissionError('screen');

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false // Don't request audio to avoid additional permissions
      });
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasScreenPermission(true);
      setPendingPermission(null);
      return true;
    } catch (error: any) {
      setPendingPermission(null);
      
      if (error.name === 'NotAllowedError') {
        setPermissionError('screen', 'Screen sharing was denied. Click "Retry" to try again, or use the image upload option instead.');
      } else if (error.name === 'NotSupportedError') {
        setPermissionError('screen', 'Screen sharing is not supported in this browser. Please try Chrome, Edge, or Firefox.');
      } else if (error.name === 'NotFoundError') {
        setPermissionError('screen', 'No screen available for sharing. Please try again.');
      } else if (error.name === 'AbortError') {
        setPermissionError('screen', 'Screen sharing was cancelled. You can try again or upload an image instead.');
      } else {
        setPermissionError('screen', 'Unable to access screen sharing. Please try uploading an image instead.');
      }
      
      console.error('Screen permission error:', error);
      return false;
    }
  };

  const requestMicPermission = async (): Promise<boolean> => {
    if (!isSupported.microphone) {
      setPermissionError('microphone', 'Microphone access is not supported in this browser. Please use Chrome, Edge, or Firefox.');
      return false;
    }

    // Check if we're on HTTPS or localhost
    if (!window.isSecureContext) {
      setPermissionError('microphone', 'Microphone access requires HTTPS. Please access this site over a secure connection.');
      return false;
    }

    setPendingPermission('microphone');
    clearPermissionError('microphone');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      });
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasMicPermission(true);
      setPendingPermission(null);
      return true;
    } catch (error: any) {
      setPendingPermission(null);
      
      if (error.name === 'NotAllowedError') {
        setPermissionError('microphone', 'Microphone access was denied. Click "Retry" to try again, or use text input instead.');
      } else if (error.name === 'NotSupportedError') {
        setPermissionError('microphone', 'Microphone access is not supported in this browser. Please try Chrome, Edge, or Firefox.');
      } else if (error.name === 'NotFoundError') {
        setPermissionError('microphone', 'No microphone found. Please connect a microphone and try again.');
      } else {
        setPermissionError('microphone', 'Unable to access microphone. Please try using text input instead.');
      }
      
      console.error('Microphone permission error:', error);
      return false;
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (!isSupported.camera) {
      setPermissionError('camera', 'Camera access is not supported in this browser. Please use Chrome, Edge, or Firefox.');
      return false;
    }

    // Check if we're on HTTPS or localhost
    if (!window.isSecureContext) {
      setPermissionError('camera', 'Camera access requires HTTPS. Please access this site over a secure connection.');
      return false;
    }

    setPendingPermission('camera');
    clearPermissionError('camera');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasCameraPermission(true);
      setPendingPermission(null);
      return true;
    } catch (error: any) {
      setPendingPermission(null);
      
      if (error.name === 'NotAllowedError') {
        setPermissionError('camera', 'Camera access was denied. This feature is optional and not required.');
      } else if (error.name === 'NotSupportedError') {
        setPermissionError('camera', 'Camera access is not supported in this browser.');
      } else if (error.name === 'NotFoundError') {
        setPermissionError('camera', 'No camera found. Please connect a camera and try again.');
      } else {
        setPermissionError('camera', 'Unable to access camera. This feature is optional.');
      }
      
      console.error('Camera permission error:', error);
      return false;
    }
  };

  const retryPermission = async (type: string): Promise<boolean> => {
    clearPermissionError(type);
    
    switch (type) {
      case 'screen':
        return await requestScreenPermission();
      case 'microphone':
        return await requestMicPermission();
      case 'camera':
        return await requestCameraPermission();
      default:
        return false;
    }
  };

  const showPermissionDialog = () => {
    setShowDialog(true);
  };
  
  const hidePermissionDialog = () => {
    setShowDialog(false);
    setPendingPermission(null);
    // Don't clear errors when dialog is manually closed - let users see them
  };

  return (
    <PermissionContext.Provider
      value={{
        hasScreenPermission,
        hasMicPermission,
        hasCameraPermission,
        showPermissionDialog: showDialog,
        pendingPermission,
        permissionErrors,
        isSupported,
        requestScreenPermission,
        requestMicPermission,
        requestCameraPermission,
        showPermissionDialog,
        hidePermissionDialog,
        clearPermissionError,
        retryPermission,
        checkExistingPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};