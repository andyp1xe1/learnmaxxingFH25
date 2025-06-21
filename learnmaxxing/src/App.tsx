import './App.css'
import QuizGenerator from './components/QuizGenerator'
import PDFUploader from './components/PDFUploader'

import { BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import LandingPage from './LandingPage';
function App() {
  return (
    <>
      <div className="rounded-xl max-w-350 mx-auto px-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />}/>
        </Routes>
      </Router>
      </div>
    </>
  )
}

export default App