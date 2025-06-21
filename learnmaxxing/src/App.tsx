import './App.css'
import QuizGenerator from './components/QuizGenerator'
import PDFUploader from './components/PDFUploader'

import { BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import LandingPage from './LandingPage';
import LogIn from './LogIn';
import SignUp from './SignUp';
import FileUploadDemo from './FileUploadDemo';
import ResourcesPage from './ResourcesPage';

type Credentials = {
  username: string;
  password: string;
};
function App() {
  const handleLogin = (credentials:Credentials) => {
    console.log('Logging in:', credentials);
  };

  const handleSignup = (credentials:Credentials) => {
    console.log('Signing up:', credentials);
  };

  return (
    <>
      <div className="rounded-xl max-w-350 mx-auto px-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Router>
          <Routes>
          <Route path="/login" element={<LogIn onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUp onSignup={handleSignup} />} />
          <Route path="/" element={<LandingPage />}/>
          <Route path="/upload-demo" element={<FileUploadDemo />} />
          <Route path="/resources" element={<ResourcesPage />} />
        </Routes>
      </Router>
      </div>
    </>
  )
}

export default App