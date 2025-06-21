import './App.css'
import QuizGenerator from './components/QuizGenerator'
import PDFUploader from './components/PDFUploader'

import { BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import LandingPage from './LandingPage';
function App() {
  return (
    <>

      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />}/>
        </Routes>
      </Router>
    </>
  )
}

export default App