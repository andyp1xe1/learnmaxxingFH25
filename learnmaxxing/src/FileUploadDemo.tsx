import React, { useState } from 'react';
import FileUploadModal from './FileUploadModal';

const FileUploadDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpload = async (files: File[]) => {
    console.log('Files to upload:', files);
    
    // Placeholder code for actual file upload
    // This is where you would integrate with your worker
    for (const file of files) {
      console.log(`Uploading ${file.name} (${file.size} bytes)`);
      
      // Simulate API call to worker
      // const formData = new FormData();
      // formData.append('file', file);
      // 
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData
      // });
      // 
      // if (!response.ok) {
      //   throw new Error(`Failed to upload ${file.name}`);
      // }
    }
    
    console.log('All files uploaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4 font-playfair">
            File Upload Demo
          </h1>
          <p className="text-gray-600 text-lg font-inter">
            Click the plus button below to open the file upload modal
          </p>
        </div>

        {/* Plus Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-16 h-16 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-purple-600 group"
          >
            <span className="text-3xl text-gray-400 group-hover:text-purple-600 transition-colors duration-200">
              +
            </span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 font-inter">
              How to use:
            </h3>
            <ul className="text-gray-600 space-y-2 text-left font-inter">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Click the plus button to open the upload modal
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Drag and drop PDF or TXT files into the upload area
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Or click the upload area to browse files
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Review your files and click "Upload Files"
              </li>
            </ul>
          </div>
        </div>

        {/* File Upload Modal */}
        <FileUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpload={handleUpload}
        />
      </div>
    </div>
  );
};

export default FileUploadDemo; 