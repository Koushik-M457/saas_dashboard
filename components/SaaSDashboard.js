import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts'

export default function SaaSDashboard() {
  // State for all dashboard data
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    totalExecutions: 0,
    successRate: 0,
    avgResponseTime: 0,
    googleSheetCount: 0
  })
  
  const [chartData, setChartData] = useState({
    executionsPerDay: [],
    successVsFailed: [],
    googleSheetData: []
  })
  
  const [recentActivity, setRecentActivity] = useState({
    workflowLogs: [],
    googleSheetEntries: []
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchAllData()
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...')
      fetchAllData()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Fetch all dashboard data
  async function fetchAllData() {
    try {
      setLoading(true)
      setError(null)

      await Promise.all([
        fetchStatsData(),
        fetchChartData(),
        fetchRecentActivity()
      ])

      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats card data
  async function fetchStatsData() {
    try {
      // Fetch from Supabase
      const { data: workflowLogs, error: supabaseError } = await supabase
        .from('workflow_logs')
        .select('*')

      if (supabaseError) throw supabaseError

      // Fetch from N8N API
      const n8nResponse = await fetch('/api/executions')
      const n8nData = await n8nResponse.json()

      // Fetch from Google Sheets API
      const sheetsResponse = await fetch('/api/sheet')
      const sheetsData = await sheetsResponse.json()

      // Calculate stats
      const totalExecutions = workflowLogs?.length || 0
      const successfulExecutions = workflowLogs?.filter(log => 
        log.status?.toLowerCase() === 'success'
      ).length || 0
      
      const successRate = totalExecutions > 0 ? 
        Math.round((successfulExecutions / totalExecutions) * 100) : 0
      
      const avgResponseTime = workflowLogs?.length > 0 ?
        Math.round(workflowLogs.reduce((sum, log) => 
          sum + (log.execution_time || 0), 0) / workflowLogs.length) : 0

      const googleSheetCount = sheetsData.success ? sheetsData.totalRows : 0
      const totalWorkflows = n8nData.success ? n8nData.data?.length : 0

      setStats({
        totalWorkflows,
        totalExecutions,
        successRate,
        avgResponseTime,
        googleSheetCount
      })

    } catch (err) {
      console.error('❌ Error fetching stats:', err)
    }
  }

  // Fetch chart data
  async function fetchChartData() {
    try {
      // Fetch workflow logs for charts
      const { data: workflowLogs, error } = await supabase
        .from('workflow_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) throw error

      // Process executions per day
      const executionsPerDay = processExecutionsPerDay(workflowLogs || [])
      
      // Process success vs failed
      const successVsFailed = processSuccessVsFailed(workflowLogs || [])
      
      // Fetch Google Sheets data for bar chart
      const sheetsResponse = await fetch('/api/sheet')
      const sheetsData = await sheetsResponse.json()
      const googleSheetData = processGoogleSheetData(sheetsData)

      setChartData({
        executionsPerDay,
        successVsFailed,
        googleSheetData
      })

    } catch (err) {
      console.error('❌ Error fetching chart data:', err)
    }
  }

  // Fetch recent activity
  async function fetchRecentActivity() {
    try {
      // Recent workflow logs
      const { data: workflowLogs, error: logsError } = await supabase
        .from('workflow_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (logsError) throw logsError

      // Recent Google Sheet entries
      const sheetsResponse = await fetch('/api/sheet')
      const sheetsData = await sheetsResponse.json()
      const recentSheetEntries = sheetsData.success ? 
        sheetsData.rows?.slice(0, 5) || [] : []

      setRecentActivity({
        workflowLogs: workflowLogs || [],
        googleSheetEntries: recentSheetEntries
      })

    } catch (err) {
      console.error('❌ Error fetching recent activity:', err)
    }
  }

  // Helper functions for data processing
  function processExecutionsPerDay(logs) {
    const dayGroups = {}
    
    logs.forEach(log => {
      const date = new Date(log.created_at).toLocaleDateString()
      dayGroups[date] = (dayGroups[date] || 0) + 1
    })

    return Object.entries(dayGroups)
      .slice(-7) // Last 7 days
      .map(([date, count]) => ({ date, executions: count }))
  }

  function processSuccessVsFailed(logs) {
    const successful = logs.filter(log => log.status?.toLowerCase() === 'success').length
    const failed = logs.filter(log => log.status?.toLowerCase() !== 'success').length
    
    return [
      { name: 'Success', value: successful, color: '#10B981' },
      { name: 'Failed', value: failed, color: '#EF4444' }
    ]
  }

  function processGoogleSheetData(sheetsData) {
    if (!sheetsData.success || !sheetsData.rows) return []
    
    // Example: Count entries by status if your sheet has a status column
    const statusCount = {}
    sheetsData.rows.forEach(row => {
      const status = row[3] || 'Unknown' // Assuming status is in 4th column
      statusCount[status] = (statusCount[status] || 0) + 1
    })

    return Object.entries(statusCount).map(([status, count]) => ({
      status,
      count
    }))
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString()
  }

  function getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'failed':
      case 'error': return 'bg-red-100 text-red-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && !stats.totalExecutions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SaaS Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring and analytics • Auto-refresh every 5 seconds
          </p>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">⚠️ {error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWorkflows}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalExecutions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}ms</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sheet Rows</p>
                <p className="text-2xl font-bold text-gray-900">{stats.googleSheetCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Executions per Day Line Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Executions per Day</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.executionsPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="executions" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Success vs Failed Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Success vs Failed</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.successVsFailed}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.successVsFailed.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Google Sheets Data Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sheet Data by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.googleSheetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Workflow Executions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Workflow Executions</h3>
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Workflow</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentActivity.workflowLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{log.workflow_name || 'Unknown'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                          {log.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(log.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentActivity.workflowLogs.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recent executions</p>
              )}
            </div>
          </div>

          {/* Recent Google Sheet Entries */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Google Sheet Entries</h3>
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentActivity.googleSheetEntries.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{entry[1] || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry[3])}`}>
                          {entry[3] || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{entry[4] || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentActivity.googleSheetEntries.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recent sheet entries</p>
              )}
            </div>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        {loading && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-sm">Refreshing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
