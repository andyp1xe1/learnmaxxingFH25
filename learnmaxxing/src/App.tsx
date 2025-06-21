import './App.css'
import QuizGenerator from './components/QuizGenerator'
import PDFUploader from './components/PDFUploader'

import { BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import LandingPage from './LandingPage';
import LogIn from './LogIn';
import SignUp from './SignUp';
import GroupsPage from './GroupsPage';
import ModeSelection from './ModeSelection';
import ExamMode from './ExamMode';
import LearnMode from './LearnMode';

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
      <div>
      <Router>
          <Routes>
          <Route path="/login" element={<LogIn onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUp onSignup={handleSignup} />} />
          <Route path="/modeselection" element={<ModeSelection/>} />
          <Route path="/exammode" element={<ExamMode />} />
          <Route path="/learnmode" element={<LearnMode />} />
          <Route path="/" element={<LandingPage />}/>
          <Route path="/groups" element={<GroupsPage />} />
        </Routes>
      </Router>
      </div>
    </>
  )
}

export default App