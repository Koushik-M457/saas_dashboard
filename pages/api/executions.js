export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Mock data for demo purposes
    const mockExecutions = [
      {
        id: 'exec-001',
        workflow_name: 'Email Campaign Automation',
        status: 'success',
        duration: 45,
        error_message: null,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        stoppedAt: new Date(Date.now() - 1000 * 60 * 29.25).toISOString(),
        mode: 'trigger'
      },
      {
        id: 'exec-002',
        workflow_name: 'Data Backup Process',
        status: 'failed',
        duration: 120,
        error_message: 'Database connection timeout',
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        startedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        stoppedAt: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
        mode: 'manual'
      },
      {
        id: 'exec-003',
        workflow_name: 'Payment Processing',
        status: 'success',
        duration: 15,
        error_message: null,
        created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
        startedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        stoppedAt: new Date(Date.now() - 1000 * 60 * 89.75).toISOString(),
        mode: 'trigger'
      },
      {
        id: 'exec-004',
        workflow_name: 'User Analytics Report',
        status: 'success',
        duration: 180,
        error_message: null,
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        startedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        stoppedAt: new Date(Date.now() - 1000 * 60 * 117).toISOString(),
        mode: 'manual'
      },
      {
        id: 'exec-005',
        workflow_name: 'Notification System',
        status: 'failed',
        duration: 30,
        error_message: 'SMTP server unavailable',
        created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
        startedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        stoppedAt: new Date(Date.now() - 1000 * 60 * 179.5).toISOString(),
        mode: 'trigger'
      },
      {
        id: 'exec-006',
        workflow_name: 'Inventory Sync',
        status: 'success',
        duration: 75,
        error_message: null,
        created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
        startedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        stoppedAt: new Date(Date.now() - 1000 * 60 * 238.75).toISOString(),
        mode: 'manual'
      },
      {
        id: 'exec-007',
        workflow_name: 'Customer Support Ticket',
        status: 'success',
        duration: 25,
        error_message: null,
        created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
        startedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        stoppedAt: new Date(Date.now() - 1000 * 60 * 299.58).toISOString(),
        mode: 'trigger'
      },
      {
        id: 'exec-008',
        workflow_name: 'System Health Check',
        status: 'failed',
        duration: 10,
        error_message: 'Memory usage exceeded threshold',
        created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
        startedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        stoppedAt: new Date(Date.now() - 1000 * 60 * 359.83).toISOString(),
        mode: 'manual'
      }
    ]

    // Simulate a small delay to mimic real API call
    await new Promise(resolve => setTimeout(resolve, 500))

    res.status(200).json({
      success: true,
      data: mockExecutions,
      total: mockExecutions.length,
      message: 'Mock data for demo purposes'
    })

  } catch (error) {
    console.error('Error in mock executions API:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}
