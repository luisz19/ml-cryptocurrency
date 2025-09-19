import {Routes, Route} from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Login from './pages/login';
import Register from './pages/register';
import FormProfileRisk from './pages/form-profile-risk';
import Profile from './pages/profile';
import Recommendations from './pages/recommendations';
import Statistics from './pages/statistics';
import ComponentsExample from './pages/ComponentsExample';
import AppLayout from './components/AppLayout';

function App() {

  return (
    <>
      <div className="App">
      

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/form-profile-risk" element={<FormProfileRisk />} />
        <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
        <Route path="/recommendations" element={<AppLayout><Recommendations /></AppLayout>} />
        <Route path="/statistics" element={<AppLayout><Statistics /></AppLayout>} />
        <Route path="/ui" element={<AppLayout><ComponentsExample /></AppLayout>} />

      </Routes>
    </div>
      
    </>
  )
}

export default App
