import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import TestWorkflowLog from './TestWorkflowLog'
import GoogleSheetLogs from './GoogleSheetLogs'

export default function WorkflowLogs() {
  const [logs, setLogs] = useState([])
  const [n8nLogs, setN8nLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [n8nLoading, setN8nLoading] = useState(true)
  const [error, setError] = useState(null)
  const [n8nError, setN8nError] = useState(null)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)
  const [isN8nConnected, setIsN8nConnected] = useState(false)
  const [isSheetsConnected, setIsSheetsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('supabase') // 'supabase', 'n8n', or 'sheets'

  // Initial fetch effect for Supabase
  useEffect(() => {
    fetchWorkflowLogs()
  }, [])

  // Initial fetch effect for N8N
  useEffect(() => {
    console.log('🚀 Initializing N8N fetch...')
    fetchN8nExecutions()
  }, [])

  // Realtime subscription effect for Supabase
  useEffect(() => {
    const channel = supabase
      .channel("realtime:workflow_logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "workflow_logs" },
        (payload) => {
          console.log('New workflow log received:', payload.new)
          setLogs((prev) => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchWorkflowLogs() {
    try {
      setLoading(true)
      setError(null)
      
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Environment variables check:', {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing',
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
        })
        throw new Error('Supabase environment variables not configured. Check your .env.local file.')
      }

      const { data, error } = await supabase
        .from('workflow_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      setLogs(data || [])
      setIsSupabaseConnected(true)
    } catch (err) {
      console.error('Error fetching workflow logs:', err)
      setError(err.message)
      setIsSupabaseConnected(false)
      
      // Fallback to dummy data if Supabase fails
      setLogs([
        { id: 1, workflow_name: 'Email Campaign', status: 'Success', message: 'Workflow execution completed', created_at: new Date().toISOString() },
        { id: 2, workflow_name: 'Data Backup', status: 'Error', message: 'Database connection failed', created_at: new Date().toISOString() },
        { id: 3, workflow_name: 'Payment Processing', status: 'Success', message: 'Payment processed successfully', created_at: new Date().toISOString() },
        { id: 4, workflow_name: 'User Analytics', status: 'Warning', message: 'High memory usage detected', created_at: new Date().toISOString() },
        { id: 5, workflow_name: 'Notification System', status: 'Success', message: 'Notifications sent to 1000 users', created_at: new Date().toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function fetchN8nExecutions() {
    try {
      console.log('🔄 Fetching N8N executions...')
      setN8nLoading(true)
      setN8nError(null)

      const response = await fetch('/api/executions')
      console.log('📡 N8N API Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch N8N executions')
      }

      const result = await response.json()
      console.log('📊 N8N API Result:', result)
      
      if (result.success) {
        console.log('✅ N8N data loaded successfully:', result.data?.length, 'executions')
        setN8nLogs(result.data || [])
        setIsN8nConnected(true)
      } else {
        throw new Error(result.error || 'Failed to fetch N8N executions')
      }
    } catch (err) {
      console.error('❌ Error fetching N8N executions:', err)
      setN8nError(err.message)
      setIsN8nConnected(false)
      
      // Fallback to dummy data if N8N fails
      console.log('🔄 Using fallback N8N data')
      setN8nLogs([
        { id: 'n8n-1', status: 'success', startedAt: new Date().toISOString(), stoppedAt: new Date().toISOString(), mode: 'manual', workflow_name: 'Email Automation', duration: 45, error_message: null },
        { id: 'n8n-2', status: 'failed', startedAt: new Date().toISOString(), stoppedAt: new Date().toISOString(), mode: 'trigger', workflow_name: 'Data Sync', duration: 120, error_message: 'Connection timeout' },
        { id: 'n8n-3', status: 'success', startedAt: new Date().toISOString(), stoppedAt: new Date().toISOString(), mode: 'manual', workflow_name: 'Payment Processing', duration: 30, error_message: null },
      ])
    } finally {
      setN8nLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'running':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  // Debug logging
  console.log('🎯 Component State:', {
    activeTab,
    n8nLogs: n8nLogs.length,
    n8nLoading,
    n8nError,
    isN8nConnected
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Workflow Logs</h1>
        <div className="flex space-x-2">
          {/* Only show refresh button for Supabase and N8N tabs, not for sheets */}
          {activeTab !== 'sheets' && (
            <button 
              onClick={
                activeTab === 'supabase' ? fetchWorkflowLogs : 
                activeTab === 'n8n' ? fetchN8nExecutions : 
                null
              }
              disabled={
                activeTab === 'supabase' ? loading : 
                activeTab === 'n8n' ? n8nLoading : 
                false
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeTab === 'supabase' ? (loading ? 'Refreshing...' : 'Refresh Supabase') : 
               activeTab === 'n8n' ? (n8nLoading ? 'Refreshing...' : 'Refresh N8N') : 
               'Refresh'}
            </button>
          )}
        </div>
      </div>

      {/* Test Component */}
      <TestWorkflowLog />

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('supabase')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'supabase'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Supabase Logs
              {isSupabaseConnected && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('n8n')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'n8n'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              N8N Executions
              {isN8nConnected && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sheets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sheets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Google Sheets
              {isSheetsConnected && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Supabase Tab Content */}
      {activeTab === 'supabase' && (
        <div>
          {/* Realtime Status Indicator */}
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Realtime Active</h3>
                <div className="mt-1 text-sm text-green-700">
                  New workflow logs will appear instantly without refreshing
                </div>
              </div>
            </div>
          </div>

          {!isSupabaseConnected && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Using Demo Data</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    Supabase connection not configured. Showing sample data. Check your environment variables.
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading workflow logs</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Workflow
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading workflow logs...
                        </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No workflow logs found
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{log.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.workflow_name || 'Unknown Workflow'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                          {log.message || 'No message'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                            {log.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(log.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {logs.length} of {logs.length} workflow logs
            {!isSupabaseConnected && ' (Demo Data)'}
          </div>
        </div>
      )}

      {/* N8N Tab Content */}
      {activeTab === 'n8n' && (
        <div>
          {!isN8nConnected && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Using Demo Data</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    N8N API connection not configured. Showing sample data. Check your N8N_API_KEY environment variable.
                  </div>
                </div>
              </div>
            </div>
          )}

          {n8nError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading N8N executions</h3>
                  <div className="mt-2 text-sm text-red-700">{n8nError}</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Workflow
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Started At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stopped At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Error Message
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {n8nLoading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading N8N executions...
                        </div>
                      </td>
                    </tr>
                  ) : n8nLogs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        No N8N executions found
                      </td>
                    </tr>
                  ) : (
                    n8nLogs.map((execution) => (
                      <tr key={execution.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {execution.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {execution.workflow_name || 'Unknown Workflow'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(execution.status)}`}>
                            {execution.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {execution.duration ? `${execution.duration}s` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {execution.mode || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(execution.startedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(execution.stoppedAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {execution.error_message || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {n8nLogs.length} of {n8nLogs.length} N8N executions
            {!isN8nConnected && ' (Demo Data)'}
                     </div>
         </div>
       )}

       {/* Google Sheets Tab Content */}
       {activeTab === 'sheets' && (
         <GoogleSheetLogs onConnectionChange={setIsSheetsConnected} />
       )}
     </div>
   )
 }
