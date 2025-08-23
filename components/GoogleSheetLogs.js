import { useEffect, useState } from 'react'

export default function GoogleSheetLogs({ onConnectionChange }) {
  const [sheetData, setSheetData] = useState([])
  const [headers, setHeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [updateCount, setUpdateCount] = useState(0)
  const [isPolling, setIsPolling] = useState(false)
  const [showUpdateFlash, setShowUpdateFlash] = useState(false)

  useEffect(() => {
    fetchSheetData()
  }, [])

  // Fast polling for instant updates (every 3 seconds when connected)
  useEffect(() => {
    let interval
    if (isConnected) {
      console.log('⚡ Starting instant Google Sheets polling (3s interval)')
      setIsPolling(true)
      
      interval = setInterval(() => {
        console.log('⚡ Instant update check triggered')
        fetchSheetData(true) // Silent fetch for instant updates
      }, 3000) // Poll every 3 seconds for instant updates
    } else {
      setIsPolling(false)
    }

    return () => {
      if (interval) {
        console.log('🛑 Stopping instant Google Sheets polling')
        clearInterval(interval)
        setIsPolling(false)
      }
    }
  }, [isConnected])

  async function fetchSheetData(silent = false) {
    try {
      if (!silent) {
        console.log('🔄 Fetching Google Sheets data...')
        setLoading(true)
      }
      setError(null)

      const response = await fetch('/api/sheet')
      console.log('📡 Google Sheets API Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('📊 Google Sheets API Error Details:', errorData)
        
        // Create a detailed error message with suggestions
        let errorMessage = errorData.message || 'Failed to fetch Google Sheets data'
        if (errorData.suggestions && errorData.suggestions.length > 0) {
          errorMessage += '\n\nSuggestions:\n' + errorData.suggestions.map(s => `• ${s}`).join('\n')
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('📊 Google Sheets API Result:', result)
      
      if (result.success) {
        const newRows = result.rows || []
        const newHeaders = result.headers || []
        
        // Check for changes to avoid unnecessary re-renders
        const dataChanged = JSON.stringify(newRows) !== JSON.stringify(sheetData) || 
                           JSON.stringify(newHeaders) !== JSON.stringify(headers)
        
        if (dataChanged || !isConnected) {
          if (silent && dataChanged) {
            console.log('⚡ Google Sheets data changed - instant update applied!')
            setUpdateCount(prev => prev + 1)
            setLastUpdate(new Date())
            
            // Trigger flash effect for visual feedback
            setShowUpdateFlash(true)
            setTimeout(() => setShowUpdateFlash(false), 1000)
          } else if (!silent) {
            console.log('✅ Google Sheets data loaded successfully:', result.totalRows, 'rows')
            setLastUpdate(new Date())
          }
          
          setSheetData(newRows)
          setHeaders(newHeaders)
          setIsConnected(true)
          
          // Notify parent component about connection status
          if (onConnectionChange) {
            onConnectionChange(true)
          }
        } else if (silent) {
          // No changes detected during polling
          console.log('📊 No changes detected in Google Sheets')
        }
      } else {
        throw new Error(result.error || 'Failed to fetch Google Sheets data')
      }
    } catch (err) {
      console.error('❌ Error fetching Google Sheets data:', err)
      setError(err.message)
      setIsConnected(false)
      // Notify parent component about connection status
      if (onConnectionChange) {
        onConnectionChange(false)
      }
      
      // Fallback to dummy data if API fails
      console.log('🔄 Using fallback Google Sheets data')
      setHeaders(['ID', 'Name', 'Email', 'Status', 'Last Updated'])
      setSheetData([
        ['1', 'Demo User 1', 'demo1@example.com', 'Active', '2024-01-15'],
        ['2', 'Demo User 2', 'demo2@example.com', 'Inactive', '2024-01-14'],
        ['3', 'Demo User 3', 'demo3@example.com', 'Active', '2024-01-13'],
      ])
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Google Sheet Logs</h1>
      </div>

      {/* Instant Updates Status Indicator */}
      {isConnected && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">⚡ Instant Updates Active</h3>
                <div className="mt-1 text-sm text-green-700">
                  Google Sheets changes appear within 3 seconds • No page refresh needed
                </div>
                {lastUpdate && (
                  <div className="mt-1 text-xs text-green-600">
                    Last update: {lastUpdate.toLocaleTimeString()} • Changes detected: {updateCount}
                  </div>
                )}
              </div>
            </div>
            {isPolling && (
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
                <div className="w-1 h-1 bg-green-500 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1 h-1 bg-green-500 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
              </div>
            )}
          </div>
        </div>
      )}

      {!isConnected && (
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
                Google Sheets API connection not configured. Showing sample data. Add GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID to .env.local to use real data.
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
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Error loading Google Sheets data</h3>
              <div className="mt-2 text-sm text-red-700 whitespace-pre-line">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${
        showUpdateFlash ? 'ring-2 ring-green-400 ring-opacity-50 shadow-lg' : ''
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={headers.length} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading Google Sheets data...
                    </div>
                  </td>
                </tr>
              ) : sheetData.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="px-6 py-4 text-center text-gray-500">
                    No Google Sheets data found
                  </td>
                </tr>
              ) : (
                sheetData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {headers[cellIndex]?.toLowerCase().includes('status') ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(cell)}`}>
                            {cell}
                          </span>
                        ) : headers[cellIndex]?.toLowerCase().includes('email') ? (
                          <a href={`mailto:${cell}`} className="text-blue-600 hover:text-blue-800">
                            {cell}
                          </a>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {sheetData.length} of {sheetData.length} Google Sheets rows
        {!isConnected && ' (Demo Data)'}
      </div>
    </div>
  )
}
