import { 
  UsersIcon, 
  EnvelopeIcon, 
  DocumentTextIcon, 
  CheckCircleIcon,
  PlusCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  // Mock data
  const userName = "John";
  const stats = [
    { 
      title: "Total Contacts", 
      value: "1,234", 
      icon: UsersIcon,
      color: "bg-blue-100"
    },
    { 
      title: "Sent Campaigns", 
      value: "24", 
      icon: EnvelopeIcon,
      color: "bg-green-100"
    },
    { 
      title: "Saved Templates", 
      value: "8", 
      icon: DocumentTextIcon,
      color: "bg-purple-100"
    },
    { 
      title: "Last Campaign Status", 
      value: "Sent", 
      status: "success", 
      icon: CheckCircleIcon,
      color: "bg-green-100"
    },
  ];
  
  const recentActivities = [
    "Campaign 'Spring Sale' was sent",
    "12 contacts added to 'Newsletter Group'",
    "Template 'Promo A' was edited",
    "Campaign 'New Product Launch' was drafted",
    "5 contacts unsubscribed",
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
          <p className="text-gray-500 mt-2">Here's what's happening with your emails today.</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary py-1.5 px-3 flex items-center text-sm">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className={`text-2xl font-bold mt-2 ${stat.status === 'success' ? 'text-green-500' : ''}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      
      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <button className="text-sm text-accent font-medium hover:underline">View all</button>
        </div>
        <div className="card">
          <ul className="divide-y-2 divide-dark/10">
            {recentActivities.map((activity, index) => (
              <li key={index} className="activity-item">
                <div className="flex items-center">
                  <span className="activity-dot"></span>
                  <p>{activity}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button className="btn-primary flex items-center">
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Create Campaign
        </button>
        <button className="btn-secondary flex items-center">
          <UsersIcon className="w-5 h-5 mr-2" />
          Import Contacts
        </button>
      </div>
    </div>
  );
};

export default Dashboard; 