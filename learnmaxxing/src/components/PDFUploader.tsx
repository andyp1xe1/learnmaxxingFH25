import React, { useState } from 'react'
import extractTextFromPDF from 'pdf-parser-client-side'
import { apiService } from '../services/api'
import TopicSelectionModal from './TopicSelectionModal'

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

export default function PDFUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [variant, setVariant] = useState<string>('clean')
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [suggestedGroups, setSuggestedGroups] = useState<Group[]>([])
  const [isGeneratingQuizzes, setIsGeneratingQuizzes] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Please select a valid PDF file')
      setSelectedFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      alert('Please select a PDF file first')
      return
    }

    setIsProcessing(true)
    try {
      console.log('Starting PDF text extraction...')
      const extractedText = await extractTextFromPDF(selectedFile, variant as any)
      console.log('Extracted Text:', extractedText)
      
      if (typeof extractedText === 'string') {
        console.log('Text length:', extractedText.length, 'characters')
        
        // Send extracted text to the backend for analysis
        console.log('Analyzing content and suggesting topics...')
        const response = await apiService.analyzeContentAndSuggest([extractedText])
        
        console.log('API response:', response)
        setSuggestedGroups(response.groups || [])
        setShowTopicModal(true)
      }
    } catch (error) {
      console.error('Error processing PDF:', error)
      alert('Error processing PDF. Please check the console for details.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTopicsSelected = async (selectedTopics: Topic[]) => {
    if (selectedTopics.length === 0) {
      alert('Please select at least one topic')
      return
    }

    setIsGeneratingQuizzes(true)
    try {
      console.log('Generating quizzes for selected topics:', selectedTopics)
      
      // Prepare selections for the generate-questions endpoint
      const selections = selectedTopics.map(topic => ({
        topicId: topic.topicId,
        topicName: topic.topicName,
        contentIds: topic.contentIds
      }))
      
      const response = await apiService.generateQuestions(selections)
      console.log('Quiz generation response:', response)
      
      alert(`Successfully generated quizzes for ${selectedTopics.length} topic(s)! Check the Groups page to view them.`)
      
      // Reset the form
      setSelectedFile(null)
      setSuggestedGroups([])
      
    } catch (error) {
      console.error('Error generating quizzes:', error)
      alert('Error generating quizzes. Please try again.')
    } finally {
      setIsGeneratingQuizzes(false)
    }
  }

  return (
    <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>PDF Text Extractor</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="pdf-file" style={{ display: 'block', marginBottom: '5px' }}>
            Select PDF File:
          </label>
          <input
            type="file"
            id="pdf-file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ marginBottom: '10px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="variant-select" style={{ display: 'block', marginBottom: '5px' }}>
            Text Processing Variant:
          </label>
          <select
            id="variant-select"
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            style={{ padding: '5px', minWidth: '200px' }}
          >
            <option value="clean">Clean (removes non-ASCII)</option>
            <option value="alphanumeric">Alphanumeric only</option>
            <option value="alphanumericwithspace">Alphanumeric + spaces</option>
            <option value="alphanumericwithspaceandpunctuation">Alphanumeric + spaces + punctuation</option>
            <option value="alphanumericwithspaceandpunctuationandnewline">Alphanumeric + spaces + punctuation + newlines</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!selectedFile || isProcessing}
          style={{
            padding: '10px 20px',
            backgroundColor: selectedFile && !isProcessing ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedFile && !isProcessing ? 'pointer' : 'not-allowed'
          }}
        >
          {isProcessing ? 'Processing...' : 'Extract Text'}
        </button>
      </form>
      
      {selectedFile && (
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}
    </div>
  )
}