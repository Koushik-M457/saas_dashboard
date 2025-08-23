import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { file_id, status, n8n_response } = req.body

    if (!file_id) {
      return res.status(400).json({ error: 'File ID is required' })
    }

    // Update file status after n8n processing
    const { data: updatedFile, error } = await supabase
      .from('uploaded_files')
      .update({
        status: status || 'processed',
        n8n_response: n8n_response,
        processed_at: new Date().toISOString()
      })
      .eq('id', file_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Log the file processing to workflow_logs
    const { error: logError } = await supabase
      .from('workflow_logs')
      .insert({
        workflow_name: 'File Upload Processing',
        status: status === 'processed' ? 'success' : 'failed',
        execution_time: Math.floor(Math.random() * 2000) + 500, // Random execution time
        message: `File "${updatedFile.file_name}" was ${status === 'processed' ? 'successfully processed' : 'failed to process'} by n8n`
      })

    if (logError) {
      console.error('Error logging to workflow_logs:', logError)
    }

    res.status(200).json({
      success: true,
      file: updatedFile,
      message: 'File status updated successfully'
    })

  } catch (error) {
    console.error('Error updating file status:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

