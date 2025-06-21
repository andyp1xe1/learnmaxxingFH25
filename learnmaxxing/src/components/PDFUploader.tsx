import React, { useState } from 'react'
import extractTextFromPDF from 'pdf-parser-client-side'

export default function PDFUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [variant, setVariant] = useState<string>('clean')

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
    }    setIsProcessing(true)
    try {
      console.log('Starting PDF text extraction...')
      const extractedText = await extractTextFromPDF(selectedFile, variant as any)
      console.log('Extracted Text:', extractedText)
      if (typeof extractedText === 'string') {
        console.log('Text length:', extractedText.length, 'characters')
      }
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      alert('Error processing PDF. Please check the console for details.')
    } finally {
      setIsProcessing(false)
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