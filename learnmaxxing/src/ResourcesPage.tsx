import React, { useState } from 'react';
import FileUploadModal from './FileUploadModal';

interface Resource {
  id: string;
  name: string;
  topicsCount: number;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  completionPercentage: number;
  category: string;
}

const ResourcesPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Sample data - replace with actual data from your backend
  const resources: Resource[] = [
    { id: '1', name: 'Mathematics', topicsCount: 12 },
    { id: '2', name: 'Computer Science', topicsCount: 8 },
    { id: '3', name: 'Physics', topicsCount: 15 },
    { id: '4', name: 'Literature', topicsCount: 6 },
    { id: '5', name: 'History', topicsCount: 10 },
  ];

  const topics: Topic[] = [
    { id: '1', title: 'Calculus Fundamentals', description: 'Learn the basics of differential and integral calculus', completionPercentage: 85, category: '1' },
    { id: '2', title: 'Linear Algebra', description: 'Vectors, matrices, and linear transformations', completionPercentage: 60, category: '1' },
    { id: '3', title: 'Probability Theory', description: 'Understanding probability distributions and statistics', completionPercentage: 30, category: '1' },
    { id: '4', title: 'Data Structures', description: 'Arrays, linked lists, trees, and graphs', completionPercentage: 90, category: '2' },
    { id: '5', title: 'Algorithms', description: 'Sorting, searching, and optimization algorithms', completionPercentage: 45, category: '2' },
    { id: '6', title: 'Database Design', description: 'Relational databases and SQL fundamentals', completionPercentage: 70, category: '2' },
  ];

  const filteredTopics = selectedResource 
    ? topics.filter(topic => topic.category === selectedResource)
    : [];

  const handleUpload = async (files: File[]) => {
    console.log('Files to upload:', files);
    // Handle file upload logic here
  };

  const RoundPlusButton = () => (
    <button
      onClick={() => setIsUploadModalOpen(true)}
      className="fixed bottom-6 right-6 w-16 h-16 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-purple-600 group z-10"
    >
      <span className="text-3xl text-gray-400 group-hover:text-purple-600 transition-colors duration-200">
        +
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'w-80' : 'w-16'} transition-all duration-300 bg-white shadow-lg h-screen sticky top-0`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {isSidebarOpen && (
              <h2 className="text-xl font-bold gradient-text font-playfair">Resources</h2>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${!isSidebarOpen ? 'mx-auto' : ''}`}
            >
              <span className="text-xl">
                {isSidebarOpen ? '◀' : '▶'}
              </span>
            </button>
          </div>

          {/* Resources List */}
          <div className="p-2">
            {resources.map((resource) => (
              <button
                key={resource.id}
                onClick={() => setSelectedResource(resource.id)}
                className={`
                  w-full p-3 rounded-lg mb-2 text-left transition-all duration-200 group relative
                  ${selectedResource === resource.id 
                    ? 'bg-blue-100 border-2 border-blue-600' 
                    : 'hover:bg-gray-50 border-2 border-transparent'
                  }
                `}
                title={!isSidebarOpen ? resource.name : undefined}
              >
                <div className={`flex items-center ${!isSidebarOpen ? 'justify-center' : ''}`}>
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  {isSidebarOpen && (
                    <div className="flex-1 min-w-0 ml-3">
                      <h3 className="font-semibold text-gray-800 truncate font-inter">
                        {resource.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-inter">
                        {resource.topicsCount} topics
                      </p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4 font-playfair">
              {selectedResource 
                ? resources.find(r => r.id === selectedResource)?.name 
                : 'Select a Resource'
              }
            </h1>
            {!selectedResource && (
              <p className="text-gray-600 text-lg font-inter">
                Choose a resource from the sidebar to view topics
              </p>
            )}
          </div>

          {/* Topics List */}
          <div className="space-y-4">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors duration-200 font-inter">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 text-sm font-inter">
                    {topic.description}
                  </p>
                </div>

                {/* Percentage */}
                <div className="ml-6">
                  <span className={`
                    text-lg font-bold px-4 py-2 rounded-full font-inter
                    ${topic.completionPercentage >= 80 
                      ? 'bg-green-100 text-green-800' 
                      : topic.completionPercentage >= 50
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {topic.completionPercentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTopics.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 font-playfair">
                {selectedResource ? 'No topics available' : 'Select a resource'}
              </h3>
              <p className="text-gray-600 font-inter">
                {selectedResource 
                  ? 'This resource doesn\'t have any topics yet.'
                  : 'Choose a resource from the sidebar to view its topics.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Round Plus Button */}
      <RoundPlusButton />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default ResourcesPage;
