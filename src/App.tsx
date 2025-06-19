import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/Layout';
import { ProtectedRoute } from './components';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Templates from './pages/Templates';
import TemplateEditor from './pages/TemplateEditor';
import Campaigns from './pages/Campaigns';
import CampaignEditor from './pages/CampaignEditor';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes - Standalone */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/templates/create" element={<TemplateEditor />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/new" element={<CampaignEditor />} />
          <Route path="/campaigns/edit/:id" element={<CampaignEditor />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
