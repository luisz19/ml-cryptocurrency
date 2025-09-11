import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Login from './pages/login';
import Register from './pages/register';
import FormProfileRisk from './pages/form-profile-risk';
import Profile from './pages/profile';
import Recommendations from './pages/recommendations';
import Statistics from './pages/statistics';

function App() {

  return (
    <>
      <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/form-profile-risk" element={<FormProfileRisk />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/statistics" element={<Statistics />} />

      </Routes>
    </div>
      
    </>
  )
}

export default App
