import { 
  BellIcon, 
  PlusIcon, 
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const Topbar = () => {
  return (
    <header className="topbar-container">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="relative max-w-md w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              className="input pl-10" 
              placeholder="Search..." 
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="btn-primary py-2 px-4 flex items-center">
            <PlusIcon className="w-4 h-4 mr-2" />
            <span>New Campaign</span>
          </button>
          
          <button className="p-2 relative rounded-full border-2 border-dark bg-white hover:bg-light shadow-neo hover:shadow-neo-hover transition-all">
            <BellIcon className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-primary text-xs w-4 h-4 flex items-center justify-center rounded-full border border-dark">3</span>
          </button>
          
          <div className="relative">
            <button className="user-avatar">
              <span className="text-sm font-medium">JD</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar; 