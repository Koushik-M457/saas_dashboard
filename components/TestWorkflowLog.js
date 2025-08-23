import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TestWorkflowLog() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const insertTestLog = async (status) => {
    try {
      setLoading(true)
      
      const testLog = {
        workflow_name: 'Test Workflow',
        message: message || `Test ${status} log - ${new Date().toLocaleTimeString()}`,
        status: status,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('workflow_logs')
        .insert([testLog])
        .select()

      if (error) {
        console.error('Error inserting test log:', error)
        alert('Error inserting test log: ' + error.message)
      } else {
        console.log('Test log inserted successfully:', data)
        setMessage('')
        alert(`${status} test log inserted successfully!`)
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Workflow Logs</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Message (optional):
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter custom message or leave empty for default"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => insertTestLog('Success')}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Inserting...' : 'Insert Success Log'}
          </button>
          
          <button
            onClick={() => insertTestLog('Error')}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Inserting...' : 'Insert Error Log'}
          </button>
          
          <button
            onClick={() => insertTestLog('Warning')}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? 'Inserting...' : 'Insert Warning Log'}
          </button>
          
          <button
            onClick={() => insertTestLog('Info')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Inserting...' : 'Insert Info Log'}
          </button>
        </div>
        
        <p className="text-sm text-gray-600">
          Click any button to insert a test workflow log. The new log should appear instantly in the table above thanks to Supabase Realtime!
        </p>
      </div>
    </div>
  )
}
