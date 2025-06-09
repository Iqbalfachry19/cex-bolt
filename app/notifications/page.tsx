export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Settings</h2>
            <p className="text-gray-600 mb-4">Manage your notification preferences and alerts.</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Price Alerts</span>
                <span className="text-sm text-gray-500">Configure price movement notifications</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Trade Confirmations</span>
                <span className="text-sm text-gray-500">Get notified about trade executions</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Security Alerts</span>
                <span className="text-sm text-gray-500">Important security notifications</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Notifications</h2>
            <p className="text-gray-600">No recent notifications to display.</p>
          </div>
        </div>
      </div>
    </div>
  );
}