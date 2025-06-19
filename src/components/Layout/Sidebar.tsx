import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  EnvelopeIcon, 
  Cog6ToothIcon,
  ChartBarIcon,
  StarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { logout } from '../../lib/auth';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Contacts', path: '/contacts', icon: UsersIcon },
    { name: 'Templates', path: '/templates', icon: DocumentTextIcon },
    { name: 'Campaigns', path: '/campaigns', icon: EnvelopeIcon },
  ];

  const secondaryNavItems = [
    { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
    { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="text-xl font-bold">F</span>
        </div>
        <div>
          <h1 className="text-xl font-bold">Fluffly</h1>
          <p className="text-sm text-gray-500">Email Platform</p>
        </div>
      </div>
      
      <div className="sidebar-section">
        <h2 className="sidebar-section-title">Main</h2>
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'} group`
              }
            >
              <item.icon className={`nav-icon ${item.path === location.pathname ? 'nav-icon-active' : ''}`} />
              <span className="nav-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <h2 className="sidebar-section-title">Other</h2>
        <nav className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'} group`
              }
            >
              <item.icon className={`nav-icon ${item.path === location.pathname ? 'nav-icon-active' : ''}`} />
              <span className="nav-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <h2 className="sidebar-section-title">Favorites</h2>
        <div className="bg-light/50 rounded-xl p-3 border border-dark/10">
          <div className="flex items-center mb-3">
            <StarIcon className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium">Saved Templates</span>
          </div>
          <div className="space-y-2">
            {['Welcome Email', 'Newsletter'].map((template, index) => (
              <div key={index} className="text-xs bg-white p-2 rounded-lg border border-dark/10 hover:border-primary cursor-pointer">
                {template}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="w-9 h-9 rounded-full bg-primary border-2 border-dark flex items-center justify-center mr-3">
            <span className="text-xs font-bold">JD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 hover:bg-primary/30 rounded-lg transition-colors"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 