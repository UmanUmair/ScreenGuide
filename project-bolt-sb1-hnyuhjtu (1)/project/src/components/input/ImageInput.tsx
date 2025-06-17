import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, FileText, Sparkles } from 'lucide-react';
import Tesseract from 'tesseract.js';

interface ImageInputProps {
  onSubmit: (task: any) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ onSubmit }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const extractTextFromImage = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    
    try {
      const { data: { text } } = await Tesseract.recognize(uploadedImage, 'eng', {
        logger: m => console.log(m)
      });
      
      setExtractedText(text);
      
      // Parse extracted text into steps
      const steps = text.split('\n')
        .filter(line => line.trim())
        .slice(0, 10) // Limit to 10 steps
        .map((step, index) => ({
          id: index + 1,
          title: `Step ${index + 1}`,
          description: step.trim(),
          completed: false,
          type: 'action' as const
        }));

      const task = {
        id: Date.now().toString(),
        title: 'Task from Screenshot',
        description: 'Task created from uploaded image',
        steps,
        mode: 'image' as const,
        originalImage: uploadedImage,
        createdAt: new Date().toISOString()
      };

      onSubmit(task);
    } catch (error) {
      console.error('OCR Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!uploadedImage ? (
        <motion.div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-white/30 hover:border-white/50 hover:bg-white/5'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">
            {isDragActive ? 'Drop your screenshot here' : 'Upload a screenshot'}
          </h3>
          <p className="text-gray-400">
            Drag & drop or click to select an image with instructions
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supports PNG, JPG, GIF, BMP, WebP
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={uploadedImage} 
              alt="Uploaded screenshot" 
              className="w-full max-h-64 object-contain rounded-xl border border-white/20"
            />
            <button
              onClick={() => {
                setUploadedImage(null);
                setExtractedText('');
              }}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>

          {extractedText && (
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-green-400" />
                <span className="font-medium text-green-400">Extracted Text</span>
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {extractedText}
              </p>
            </div>
          )}

          <motion.button
            onClick={extractTextFromImage}
            disabled={isProcessing}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 px-6 py-4 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
            whileHover={{ scale: isProcessing ? 1 : 1.02 }}
            whileTap={{ scale: isProcessing ? 1 : 0.98 }}
          >
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <span>Extracting text & creating guide...</span>
              </>
            ) : (
              <>
                <Image className="w-5 h-5" />
                <span>Extract Text & Create Guide</span>
              </>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default ImageInput;