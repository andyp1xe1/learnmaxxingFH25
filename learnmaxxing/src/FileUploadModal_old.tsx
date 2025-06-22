import React, { useState, useRef, useCallback } from 'react';
import extractTextFromPDF from 'pdf-parser-client-side';
import { apiService } from './services/api';
import TopicSelectionModal from './components/TopicSelectionModal';

interface Topic {
  topicId: number;
  topicName: string;
  isNew: boolean;
  contentIds: number[];
}

interface Group {
  groupId: number;
  groupName: string;
  topics: Topic[];
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (files: File[]) => void;
}

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onTopicsGenerated }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedContents, setExtractedContents] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['text/plain', 'application/pdf'];
      return validTypes.includes(file.type);
    });

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      status: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      // Update status to uploading
      setUploadedFiles(prev => 
        prev.map(file => ({ ...file, status: 'uploading' as const, progress: 0 }))
      );

      const contents: string[] = [];
      
      // Extract text from each PDF file
      for (const uploadedFile of uploadedFiles) {
        try {
          if (uploadedFile.file.type === 'application/pdf') {
            console.log(`Extracting text from: ${uploadedFile.file.name}`);
            const extractedText = await extractTextFromPDF(uploadedFile.file, 'clean');
            if (typeof extractedText === 'string' && extractedText.trim()) {
              contents.push(extractedText);
            }
          } else if (uploadedFile.file.type === 'text/plain') {
            const text = await uploadedFile.file.text();
            if (text.trim()) {
              contents.push(text);
            }
          }
        } catch (error) {
          console.error(`Failed to extract text from ${uploadedFile.file.name}:`, error);
        }
      }

      if (contents.length === 0) {
        throw new Error('No text could be extracted from the uploaded files');
      }

      setExtractedContents(contents);

      // Send extracted content to backend for analysis
      console.log('Sending extracted content to backend for analysis...');
      const analysisResult = await apiService.analyzeContentAndSuggest(contents);
      
      console.log('Analysis result:', analysisResult);

      // Update files to success status
      setUploadedFiles(prev => 
        prev.map(file => ({ 
          ...file, 
          status: 'success' as const, 
          progress: 100 
        }))
      );

      // Call the callback with the analysis result
      if (onTopicsGenerated && analysisResult.groups) {
        onTopicsGenerated(analysisResult.groups);
      }
      
      // Close modal after successful analysis
      setTimeout(() => {
        onClose();
        setUploadedFiles([]);
        setExtractedContents([]);
      }, 1000);
      
    } catch (error) {
      console.error('Upload and analysis failed:', error);
      setUploadedFiles(prev => 
        prev.map(file => ({ 
          ...file, 
          status: 'error' as const, 
          error: error instanceof Error ? error.message : 'Analysis failed' 
        }))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return '📄';
    }
    return '📝';
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'uploading': return '📤';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 font-playfair">Upload Documents</h2>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Drag and Drop Area */}
          <div 
            className={`
              border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 mb-6
              ${isDragOver 
                ? 'border-purple-600 bg-purple-50 scale-[1.02]' 
                : 'border-gray-300 bg-gray-50 hover:border-purple-600 hover:bg-gray-100'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="pointer-events-none">
              <div className="text-5xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2 font-inter">
                Drop files here or click to browse
              </h3>
              <p className="text-gray-500 text-sm font-inter">
                Supports PDF and TXT files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* File List */}
          {uploadedFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 font-inter">
                Files to upload ({uploadedFiles.length})
              </h3>
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 pr-10 mb-2 relative hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {getFileIcon(uploadedFile.file.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate font-inter">
                        {uploadedFile.file.name}
                      </div>
                      <div className="text-xs text-gray-500 font-inter">
                        {(uploadedFile.file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  
                  {uploadedFile.status === 'uploading' && (
                    <div className="w-full h-1 bg-gray-200 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {uploadedFile.status === 'error' && (
                    <div className="text-red-600 text-sm mt-2 font-inter">{uploadedFile.error}</div>
                  )}
                  
                  <button 
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 z-10"
                    onClick={() => removeFile(uploadedFile.id)}
                    disabled={uploadedFile.status === 'uploading'}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button 
              className="brand-btn brand-btn-outline font-inter"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button 
              className="brand-btn brand-btn-filled font-inter"
              onClick={handleUpload}
              disabled={uploadedFiles.length === 0 || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal; 