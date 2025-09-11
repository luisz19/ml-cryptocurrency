import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Login from './pages/login';
import Register from './pages/register';
import FormProfileRisk from './pages/form-profile-risk';
import Profile from './pages/profile';
import Recommendations from './pages/recommendations';
import Statistics from './pages/statistics';
import ComponentsExample from './pages/ComponentsExample';
import ThemeToggle from './components/ThemeToggle';

function App() {

  return (
    <>
      <div className="App">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
  <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/form-profile-risk" element={<FormProfileRisk />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recommendations" element={<Recommendations />} />
  <Route path="/statistics" element={<Statistics />} />
  <Route path="/ui" element={<ComponentsExample />} />

      </Routes>
    </div>
      
    </>
  )
}

export default App
