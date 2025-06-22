import React, { useState } from 'react';

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

interface TopicSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  onTopicsSelected: (selectedTopics: Topic[]) => void;
  isGenerating?: boolean;
}

const TopicSelectionModal: React.FC<TopicSelectionModalProps> = ({
  isOpen,
  onClose,
  groups,
  onTopicsSelected,
  isGenerating = false
}) => {
  const [selectedTopics, setSelectedTopics] = useState<Set<number>>(new Set());

  const handleTopicToggle = (topic: Topic) => {
    setSelectedTopics(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(topic.topicId)) {
        newSelection.delete(topic.topicId);
      } else {
        newSelection.add(topic.topicId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    const allTopicIds = groups.flatMap(group => group.topics.map(topic => topic.topicId));
    setSelectedTopics(new Set(allTopicIds));
  };

  const handleDeselectAll = () => {
    setSelectedTopics(new Set());
  };

  const handleConfirm = () => {
    const selectedTopicObjects = groups
      .flatMap(group => group.topics)
      .filter(topic => selectedTopics.has(topic.topicId));
    
    onTopicsSelected(selectedTopicObjects);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-[90%] max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-playfair">Select Topics for Quiz Generation</h2>
            <p className="text-gray-600 font-inter mt-1">Choose the topics you'd like to generate quizzes for</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            disabled={isGenerating}
          >
            ×
          </button>
        </div>

        {/* Selection Controls */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600 font-inter">
            {selectedTopics.size} of {groups.reduce((acc, group) => acc + group.topics.length, 0)} topics selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-inter"
              disabled={isGenerating}
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-inter"
              disabled={isGenerating}
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Topics List */}
        <div className="overflow-y-auto max-h-96 p-6">
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-gray-600 font-inter">No topics found in the uploaded content.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.groupId} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800 font-inter flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                      {group.groupName}
                      <span className="text-sm text-gray-600 ml-auto">
                        {group.topics.length} topic{group.topics.length !== 1 ? 's' : ''}
                      </span>
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {group.topics.map((topic) => (
                      <div
                        key={topic.topicId}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                          ${selectedTopics.has(topic.topicId)
                            ? 'border-purple-300 bg-purple-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-25'
                          }
                        `}
                        onClick={() => !isGenerating && handleTopicToggle(topic)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTopics.has(topic.topicId)}
                          onChange={() => handleTopicToggle(topic)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          disabled={isGenerating}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 font-inter">
                            {topic.topicName}
                          </div>
                          <div className="text-sm text-gray-500 font-inter flex items-center gap-2">
                            <span className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${topic.isNew
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                              }
                            `}>
                              {topic.isNew ? 'New Topic' : 'Existing Topic'}
                            </span>
                            <span>
                              {topic.contentIds.length} content reference{topic.contentIds.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-inter"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedTopics.size === 0 || isGenerating}
            className={`
              px-6 py-2 rounded-lg font-inter flex items-center gap-2
              ${selectedTopics.size === 0 || isGenerating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              }
            `}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Quizzes...
              </>
            ) : (
              `Generate Quizzes (${selectedTopics.size})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicSelectionModal;