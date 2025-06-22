import './App.css'

import { BrowserRouter as Router,Routes,Route, Navigate} from 'react-router-dom';
import LandingPage from './LandingPage';
import LogIn from './LogIn';
import SignUp from './SignUp';
import GroupsPage from './GroupsPage';
import ModeSelection from './ModeSelection';
import ExamMode from './ExamMode';
import LearnMode from './LearnMode';
import AssessmentResults from './AssestmentResults';
import ProtectedRoute from './components/ProtectedRoute';

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
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<LogIn onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUp onSignup={handleSignup} />} />
          <Route path="/" element={<LandingPage />}/>
          <Route path="/groups" element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          } />
          <Route path="/modeselection" element={
            <ProtectedRoute>
              <ModeSelection/>
            </ProtectedRoute>
          } />
          <Route path="/exammode" element={
            <ProtectedRoute>
              <ExamMode />
            </ProtectedRoute>
          } />
          <Route path="/learnmode" element={
            <ProtectedRoute>
              <LearnMode />
            </ProtectedRoute>
          } />
          <Route path="/assestmentresults" element={
            <ProtectedRoute>
              <AssessmentResults />
            </ProtectedRoute>
          } />
          {/* Catch-all route: redirect any unmatched routes to /groups */}
          <Route path="*" element={<Navigate to="/groups" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App