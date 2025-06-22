import React from 'react';
import { X, BookOpen, Target, TrendingDown } from 'lucide-react';
import type { FailedQuiz } from '../services/failedQuizzesService';

interface FailedAssessmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  failedTopics: FailedQuiz[];
  onStudyTopic: (topicId: number | string) => void;
}

const FailedAssessmentsModal: React.FC<FailedAssessmentsModalProps> = ({
  isOpen,
  onClose,
  failedTopics,
  onStudyTopic
}) => {
  if (!isOpen) return null;

  const getPerformanceColor = (score: number) => {
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceText = (score: number) => {
    if (score >= 60) return 'Needs Improvement';
    if (score >= 40) return 'Weak';
    return 'Very Weak';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 font-playfair">Failed Assessments</h2>
              <p className="text-gray-600 text-sm font-inter">Topics that need your attention</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {failedTopics.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Great Job!</h3>
              <p className="text-gray-600">No failed topics to study. Keep up the good work!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Focus Areas
                </h3>
                <p className="text-red-700 text-sm">
                  You struggled with {failedTopics.length} topic{failedTopics.length !== 1 ? 's' : ''}. 
                  Click on any topic below to study it and improve your performance.
                </p>
              </div>

              {failedTopics.map((topic, index) => (
                <div
                  key={topic.quizId}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 text-lg font-inter">
                      {topic.quizName}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(topic.score)}`}>
                      {topic.score}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getPerformanceColor(topic.score).replace('text-', 'bg-').replace(' bg-', ' bg-')}`}></span>
                      {getPerformanceText(topic.score)}
                    </div>
                    
                    <button
                      onClick={() => onStudyTopic(topic.quizId)}
                      className="bg-gradient-to-r from-purple-600 to-orange-400 hover:from-purple-700 hover:to-orange-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Study
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 font-inter">
              {failedTopics.length > 0 
                ? `${failedTopics.length} topic${failedTopics.length !== 1 ? 's' : ''} to improve`
                : 'All caught up!'
              }
            </p>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailedAssessmentsModal; 