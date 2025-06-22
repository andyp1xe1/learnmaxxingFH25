import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FileUploadModal from './FileUploadModal';
import FailedAssessmentsModal from './components/FailedAssessmentsModal';
import { apiService } from './services/api';
import type { Quiz, Group } from './services/api';
import { Target } from 'lucide-react';
import { failedQuizzesService, type FailedQuiz } from './services/failedQuizzesService';

interface GroupWithQuizzes extends Group {
  quizzes?: Quiz[];
  topicsCount: number;
}

const GroupsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFailedAssessmentsModalOpen, setIsFailedAssessmentsModalOpen] = useState(false);
  const [failedTopics, setFailedTopics] = useState<FailedQuiz[]>([]);
  const [groups, setGroups] = useState<GroupWithQuizzes[]>([]);
  const [selectedGroupQuizzes, setSelectedGroupQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load failed quizzes from localStorage on component mount
  useEffect(() => {
    const loadFailedQuizzes = () => {
      console.log('🔍 GroupsPage: Loading failed quizzes from localStorage');
      const failedQuizzes = failedQuizzesService.getFailedQuizzes();
      console.log('📦 GroupsPage: Failed quizzes loaded:', failedQuizzes);
      setFailedTopics(failedQuizzes);
    };

    loadFailedQuizzes();
  }, []);

  // Check for failed assessments from navigation state
  useEffect(() => {
    if (location.state?.showFailedAssessments && location.state?.failedTopics) {
      console.log('🔍 GroupsPage: Received failed topics from navigation:', location.state.failedTopics);
      
      // Store the new failed topics in localStorage
      failedQuizzesService.addFailedQuizzes(location.state.failedTopics);
      
      // Reload failed quizzes from localStorage
      const failedQuizzes = failedQuizzesService.getFailedQuizzes();
      console.log('📦 GroupsPage: Updated failed quizzes from localStorage:', failedQuizzes);
      setFailedTopics(failedQuizzes);
      
      setIsFailedAssessmentsModalOpen(true);
      // Clear the state to prevent showing modal on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const groupsData = await apiService.getGroups();
        
        // Get quiz counts for each group
        const groupsWithCounts: GroupWithQuizzes[] = await Promise.all(
          groupsData.map(async (group) => {
            try {
              const quizzes = await apiService.getGroupQuizzes(group.id);
              return {
                ...group,
                topicsCount: quizzes.length,
                quizzes
              };
            } catch (err) {
              console.warn(`Failed to fetch quizzes for group ${group.id}:`, err);
              return {
                ...group,
                topicsCount: 0,
                quizzes: []
              };
            }
          })
        );
        
        setGroups(groupsWithCounts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch quizzes when a group is selected
  useEffect(() => {
    const fetchGroupQuizzes = async () => {
      if (selectedGroup) {
        try {
          const quizzes = await apiService.getGroupQuizzes(selectedGroup);
          setSelectedGroupQuizzes(quizzes);
        } catch (err) {
          console.error('Failed to fetch group quizzes:', err);
          setSelectedGroupQuizzes([]);
        }
      } else {
        setSelectedGroupQuizzes([]);
      }
    };

    fetchGroupQuizzes();
  }, [selectedGroup]);

  const filteredTopics = selectedGroup 
    ? selectedGroupQuizzes
    : [];

  const handleUpload = async (files: File[]) => {
    console.log('Files to upload:', files);
    // This is now handled by the FileUploadModal component
    // The modal will show the topic selection after processing
  };

  const handleTopicClick = (topicId: number) => {
    const selectedTopic = selectedGroupQuizzes.find((quiz: Quiz) => quiz.id === topicId);
    // Always navigate to modeselection from GroupsPage
    navigate('/modeselection', { 
      state: { 
        topic: selectedTopic 
      } 
    });
  };

  const handleStudyFailedTopic = (quizId: number | string) => {
    console.log('🔍 GroupsPage: Study failed topic called with quizId:', quizId);
    console.log('🔍 GroupsPage: quizId type:', typeof quizId);
    
    // For all failed quizzes, try to find them in the database
    // If it's a string ID, convert it to number or handle appropriately
    const numericQuizId = typeof quizId === 'string' ? parseInt(quizId) : quizId;
    console.log('🔍 GroupsPage: Converted numeric quiz ID:', numericQuizId);
    
    if (isNaN(numericQuizId)) {
      console.error('❌ GroupsPage: Invalid quiz ID:', quizId);
      alert('Invalid quiz ID. Please try again.');
      return;
    }

    // Find the quiz in all groups
    let foundQuiz: Quiz | undefined;
    console.log('🔍 GroupsPage: Searching for quiz in groups:', groups);
    
    for (const group of groups) {
      if (group.quizzes) {
        foundQuiz = group.quizzes.find(quiz => quiz.id === numericQuizId);
        if (foundQuiz) {
          console.log('✅ GroupsPage: Found quiz in group:', foundQuiz);
          break;
        }
      }
    }

    if (foundQuiz) {
      // Navigate to modeselection with the found quiz
      console.log('🚀 GroupsPage: Navigating to modeselection with found quiz:', foundQuiz);
      navigate('/modeselection', { 
        state: { 
          topic: foundQuiz 
        } 
      });
      setIsFailedAssessmentsModalOpen(false);
    } else {
      // If quiz not found in groups, try to fetch it directly from the API
      console.log('⚠️ GroupsPage: Quiz not found in groups, creating mock quiz for ID:', numericQuizId);
      
      // Create a mock quiz object with the ID and navigate
      const mockQuiz: Quiz = {
        id: numericQuizId,
        title: `Quiz ${numericQuizId}`,
        description: 'Generated quiz from failed assessment',
        created_at: new Date().toISOString()
      };
      
      console.log('🚀 GroupsPage: Navigating to modeselection with mock quiz:', mockQuiz);
      navigate('/modeselection', { 
        state: { 
          topic: mockQuiz 
        } 
      });
      setIsFailedAssessmentsModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading groups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              <h2 className="text-xl font-bold gradient-text font-playfair">Groups</h2>
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

          {/* Groups List */}
          <div className="p-2">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`
                  w-full p-3 rounded-lg mb-2 text-left transition-all duration-200 group relative
                  ${selectedGroup === group.id 
                    ? 'bg-blue-100 border-2 border-blue-600' 
                    : 'hover:bg-gray-50 border-2 border-transparent'
                  }
                `}
                title={!isSidebarOpen ? group.name : undefined}
              >
                <div className={`flex items-center ${!isSidebarOpen ? 'justify-center' : ''}`}>
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                    </svg>
                  </div>
                  {isSidebarOpen && (
                    <div className="flex-1 min-w-0 ml-3">
                      <h3 className="font-semibold text-gray-800 truncate font-inter">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-inter">
                        {group.topicsCount} topics
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
            {selectedGroup && (
              <h1 className="text-4xl font-bold gradient-text mb-4 font-playfair">
                {groups.find(g => g.id === selectedGroup)?.name}
              </h1>
            )}
            <div className="flex justify-between items-center">
              <div></div>
              <button
                onClick={() => setIsFailedAssessmentsModalOpen(true)}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center"
              >
                <Target className="w-4 h-4 mr-2" />
                Failed Assessments
              </button>
            </div>
          </div>

          {/* Topics List */}
          <div className="space-y-4">
            {filteredTopics.map((topic: Quiz) => (
              <div
                key={topic.id}
                onClick={() => handleTopicClick(topic.id)}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors duration-200 font-inter">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 text-sm font-inter">
                    {topic.description || 'No description available'}
                  </p>
                </div>

                {/* Date */}
                <div className="ml-6">
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-inter">
                    {new Date(topic.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTopics.length === 0 && (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 font-playfair">
                  {groups.length === 0 
                    ? 'Add a group' 
                    : selectedGroup 
                      ? 'No topics available' 
                      : 'Select a group'
                  }
                </h3>
                <p className="text-gray-600 font-inter">
                  {groups.length === 0
                    ? 'Create your first group to start organizing topics.'
                    : selectedGroup 
                      ? 'This group doesn\'t have any topics yet.'
                      : 'Choose a group from the sidebar to view its topics.'
                  }
                </p>
              </div>
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

      {/* Failed Assessments Modal */}
      <FailedAssessmentsModal
        isOpen={isFailedAssessmentsModalOpen}
        onClose={() => setIsFailedAssessmentsModalOpen(false)}
        failedTopics={failedTopics}
        onStudyTopic={handleStudyFailedTopic}
      />
    </div>
  );
};

export default GroupsPage;
