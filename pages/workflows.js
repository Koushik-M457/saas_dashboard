import Layout from '../components/Layout'
// import { supabase } from '../lib/supabaseClient' // Uncomment when ready to connect workflows to Supabase

export default function WorkflowsPage() {
  // Dummy data for workflows
  const workflows = [
    {
      id: 1,
      name: 'Email Marketing Campaign',
      description: 'Automated email sequence for new user onboarding',
      status: 'Active',
      lastRun: '2 hours ago',
      executions: 156,
      successRate: 98.5,
      icon: '📧'
    },
    {
      id: 2,
      name: 'Data Backup Process',
      description: 'Daily automated backup of user data and configurations',
      status: 'Active',
      lastRun: '1 day ago',
      executions: 89,
      successRate: 100,
      icon: '💾'
    },
    {
      id: 3,
      name: 'Payment Processing',
      description: 'Handle payment transactions and invoice generation',
      status: 'Active',
      lastRun: '30 minutes ago',
      executions: 234,
      successRate: 99.2,
      icon: '💳'
    },
    {
      id: 4,
      name: 'User Analytics',
      description: 'Generate weekly user behavior reports',
      status: 'Paused',
      lastRun: '1 week ago',
      executions: 45,
      successRate: 95.8,
      icon: '📊'
    },
    {
      id: 5,
      name: 'Notification System',
      description: 'Send push notifications and SMS alerts',
      status: 'Active',
      lastRun: '5 minutes ago',
      executions: 567,
      successRate: 97.3,
      icon: '🔔'
    },
    {
      id: 6,
      name: 'Content Sync',
      description: 'Synchronize content across multiple platforms',
      status: 'Active',
      lastRun: '3 hours ago',
      executions: 123,
      successRate: 99.7,
      icon: '🔄'
    }
  ]

  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Create Workflow
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{workflow.icon}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
                    {workflow.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{workflow.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Run:</span>
                    <span className="text-gray-900">{workflow.lastRun}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Executions:</span>
                    <span className="text-gray-900">{workflow.executions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Success Rate:</span>
                    <span className="text-gray-900">{workflow.successRate}%</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                      Run Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Workflow Statistics</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{workflows.length}</div>
              <div className="text-sm text-gray-600">Total Workflows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{workflows.filter(w => w.status === 'Active').length}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{workflows.filter(w => w.status === 'Paused').length}</div>
              <div className="text-sm text-gray-600">Paused</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">1,214</div>
              <div className="text-sm text-gray-600">Total Executions</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
