import { 
  UsersIcon, 
  EnvelopeIcon, 
  DocumentTextIcon, 
  CheckCircleIcon,
  PlusCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactsAPI, templatesAPI, campaignsAPI } from '../lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { 
      title: "Total Contacts", 
      value: "0", 
      icon: UsersIcon,
      color: "bg-blue-100",
      isLoading: true
    },
    { 
      title: "Sent Campaigns", 
      value: "0", 
      icon: EnvelopeIcon,
      color: "bg-green-100",
      isLoading: true
    },
    { 
      title: "Saved Templates", 
      value: "0", 
      icon: DocumentTextIcon,
      color: "bg-purple-100",
      isLoading: true
    },
    { 
      title: "Last Campaign Status", 
      value: "N/A", 
      status: "pending", 
      icon: CheckCircleIcon,
      color: "bg-gray-100",
      isLoading: true
    },
  ]);
  
  const recentActivities = [
    "Campaign 'Spring Sale' was sent",
    "12 contacts added to 'Newsletter Group'",
    "Template 'Promo A' was edited",
    "Campaign 'New Product Launch' was drafted",
    "5 contacts unsubscribed",
  ];

  // Fetch data from API with improved error handling
  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Starting dashboard data fetch...');
      
      // Helper function to retry API calls with better error info
      const fetchWithRetry = async (apiCall: () => Promise<any>, name: string, maxRetries = 2) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`📊 Fetching ${name}... (attempt ${attempt}/${maxRetries})`);
            const result = await apiCall();
            
            // Extract the data more safely
            const data = result?.data?.data?.data || result?.data?.data || result?.data || [];
            const count = Array.isArray(data) ? data.length : 0;
            
            console.log(`✅ ${name} fetched successfully:`, {
              count,
              dataStructure: typeof result?.data,
              hasData: !!result?.data,
              actualData: data
            });
            
            return { data, count };
          } catch (error: any) {
            console.log(`❌ ${name} fetch failed (attempt ${attempt}/${maxRetries}):`, {
              error: error.message,
              status: error.response?.status,
              data: error.response?.data
            });
            
            if (attempt === maxRetries) {
              throw error;
            }
            
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      };

      // Fetch data with delays between calls
      console.log('📞 Fetching contacts...');
      const contactsResult = await fetchWithRetry(() => contactsAPI.getAll(), 'contacts');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('📞 Fetching templates...');
      const templatesResult = await fetchWithRetry(() => templatesAPI.getAll(), 'templates');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('📞 Fetching campaigns...');
      const campaignsResult = await fetchWithRetry(() => campaignsAPI.getAll(), 'campaigns');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('📞 Fetching sent campaigns...');
      const sentCampaignsResult = await fetchWithRetry(() => campaignsAPI.getAll({ status: 'sent' }), 'sent campaigns');
      
      // Update stats with actual data
      const updatedStats = [...stats];
      
             console.log('📊 Processing results...', {
         contacts: contactsResult?.count || 0,
         templates: templatesResult?.count || 0,
         campaigns: campaignsResult?.count || 0,
         sentCampaigns: sentCampaignsResult?.count || 0
       });
       
       // Update contacts count
       const contactsCount = contactsResult?.count || 0;
       updatedStats[0] = {
         ...updatedStats[0],
         value: contactsCount.toLocaleString(),
         isLoading: false,
         color: contactsCount > 0 ? "bg-blue-100" : "bg-gray-100"
       };
       
       // Update sent campaigns count
       const sentCampaignsCount = sentCampaignsResult?.count || 0;
       updatedStats[1] = {
         ...updatedStats[1],
         value: sentCampaignsCount.toLocaleString(),
         isLoading: false,
         color: sentCampaignsCount > 0 ? "bg-green-100" : "bg-gray-100"
       };
       
       // Update templates count
       const templatesCount = templatesResult?.count || 0;
       updatedStats[2] = {
         ...updatedStats[2],
         value: templatesCount.toLocaleString(),
         isLoading: false,
         color: templatesCount > 0 ? "bg-purple-100" : "bg-gray-100"
       };
       
       // Update last campaign status
       const campaignsCount = campaignsResult?.count || 0;
       if (campaignsCount > 0 && campaignsResult?.data) {
         // Sort campaigns by date and get the most recent one
         const sortedCampaigns = [...campaignsResult.data].sort((a, b) => 
           new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
         );
        
        const lastCampaign = sortedCampaigns[0];
        updatedStats[3] = {
          ...updatedStats[3],
          value: lastCampaign.status.charAt(0).toUpperCase() + lastCampaign.status.slice(1),
          status: lastCampaign.status === 'sent' ? 'success' : 'pending',
          color: lastCampaign.status === 'sent' ? 'bg-green-100' : 'bg-yellow-100',
          isLoading: false
        };
      } else {
        updatedStats[3] = {
          ...updatedStats[3],
          value: "No Campaigns",
          status: "pending",
          color: "bg-gray-100",
          isLoading: false
        };
      }
      
      setStats(updatedStats);
      console.log('✅ Dashboard data updated successfully!');
      
    } catch (error: any) {
      console.error('❌ Critical error fetching dashboard data:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      
      // Show detailed error state in stats
      const errorStats = [...stats];
      errorStats.forEach((stat, index) => {
        stat.value = `Error ${error.response?.status || 500}`;
        stat.isLoading = false;
        stat.color = "bg-red-100";
      });
      setStats(errorStats);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
    
    // Try to get user name from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.fullName) {
          setUserName(userData.fullName.split(' ')[0]);
        }
      } catch (e) {
        console.error('Error parsing user data from localStorage');
      }
    }
  }, []);
  
  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
          <p className="text-gray-500 mt-2">Here's what's happening with your emails today.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            className="btn-secondary py-1.5 px-3 flex items-center text-sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
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
            <p className={`text-2xl font-bold mt-2 ${
              stat.status === 'success' ? 'text-green-500' : 
              stat.status === 'pending' ? 'text-yellow-500' : ''
            }`}>
              {stat.isLoading ? (
                <span className="inline-block w-12 h-6 bg-gray-200 animate-pulse rounded"></span>
              ) : (
                stat.value
              )}
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
        <button 
          className="btn-primary flex items-center"
          onClick={() => navigate('/campaigns/new')}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Create Campaign
        </button>
        <button 
          className="btn-secondary flex items-center"
          onClick={() => navigate('/contacts')}
        >
          <UsersIcon className="w-5 h-5 mr-2" />
          Import Contacts
        </button>
      </div>
    </div>
  );
};

export default Dashboard; 