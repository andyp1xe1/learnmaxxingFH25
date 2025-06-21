import React, { useState } from 'react';
import FileUploadModal from './FileUploadModal';

interface Resource {
  id: string;
  name: string;
  icon: string;
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
    { id: '1', name: 'Mathematics', icon: '📐', topicsCount: 12 },
    { id: '2', name: 'Computer Science', icon: '💻', topicsCount: 8 },
    { id: '3', name: 'Physics', icon: '⚛️', topicsCount: 15 },
    { id: '4', name: 'Literature', icon: '📚', topicsCount: 6 },
    { id: '5', name: 'History', icon: '🏛️', topicsCount: 10 },
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
    : topics;

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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
              <h2 className="text-xl font-bold gradient-text">Resources</h2>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
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
                  w-full p-3 rounded-lg mb-2 text-left transition-all duration-200 group
                  ${selectedResource === resource.id 
                    ? 'bg-purple-100 border-2 border-purple-600' 
                    : 'hover:bg-gray-50 border-2 border-transparent'
                  }
                `}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3 flex-shrink-0">
                    {resource.icon}
                  </span>
                  {isSidebarOpen && (
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {resource.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {resource.topicsCount} topics
                      </p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* All Topics Button */}
          <div className="p-2 border-t border-gray-200 mt-4">
            <button
              onClick={() => setSelectedResource(null)}
              className={`
                w-full p-3 rounded-lg text-left transition-all duration-200
                ${selectedResource === null 
                  ? 'bg-blue-100 border-2 border-blue-600' 
                  : 'hover:bg-gray-50 border-2 border-transparent'
                }
              `}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3 flex-shrink-0">📋</span>
                {isSidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">All Topics</h3>
                    <p className="text-sm text-gray-500">
                      View all available topics
                    </p>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              {selectedResource 
                ? resources.find(r => r.id === selectedResource)?.name 
                : 'All Topics'
              }
            </h1>
            <p className="text-gray-600 text-lg">
              {selectedResource 
                ? `Explore topics in ${resources.find(r => r.id === selectedResource)?.name}`
                : 'Browse all available learning topics'
              }
            </p>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-200">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {topic.description}
                  </p>
                </div>

                {/* Progress Bar and Percentage */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 mr-4">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getCompletionColor(topic.completionPercentage)} transition-all duration-300`}
                        style={{ width: `${topic.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                  <span className={`
                    text-sm font-semibold px-2 py-1 rounded-full
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

                {/* Status Badge */}
                <div className="flex justify-between items-center">
                  <span className={`
                    text-xs px-2 py-1 rounded-full font-medium
                    ${topic.completionPercentage === 100 
                      ? 'bg-green-100 text-green-800' 
                      : topic.completionPercentage > 0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {topic.completionPercentage === 100 
                      ? 'Completed' 
                      : topic.completionPercentage > 0
                        ? 'In Progress'
                        : 'Not Started'
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTopics.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No topics available
              </h3>
              <p className="text-gray-600">
                {selectedResource 
                  ? 'This resource doesn\'t have any topics yet.'
                  : 'Start by adding some learning resources.'
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
