# 🔗 N8N Webhook Setup for File Upload Processing

## Overview

This guide shows how to set up an n8n workflow to receive and process uploaded files from your SaaS Dashboard.

## 📋 N8N Workflow Setup

### 1. Create New Workflow

1. Go to your n8n instance
2. Create a new workflow
3. Add a **Webhook** node as the trigger

### 2. Webhook Configuration

**Webhook Node Settings:**
- **HTTP Method**: POST
- **Path**: `/webhook/upload-data`
- **Authentication**: None (or add API key if desired)
- **Response Mode**: Respond Immediately

### 3. Sample Workflow Nodes

```
Webhook Trigger → Process Data → Update Supabase → Send Response
```

### 4. Node Details

#### A. Webhook Trigger Node
- Receives the file data payload
- Input format:
```json
{
  "file_id": "uuid-string",
  "file_name": "customers.csv",
  "client_id": "demo-client-123",
  "file_type": "csv",
  "data": [
    {"name": "John Doe", "email": "john@example.com"},
    {"name": "Jane Smith", "email": "jane@example.com"}
  ],
  "upload_time": "2024-01-15T10:30:00Z"
}
```

#### B. Process Data Node (Function Node)
```javascript
// Process the uploaded data
const inputData = $json;
const processedData = [];

// Example: Transform and validate data
for (const row of inputData.data) {
  if (row.email && row.name) {
    processedData.push({
      ...row,
      processed_at: new Date().toISOString(),
      status: 'validated'
    });
  }
}

return {
  file_id: inputData.file_id,
  client_id: inputData.client_id,
  original_count: inputData.data.length,
  processed_count: processedData.length,
  processed_data: processedData,
  processing_status: 'success'
};
```

#### C. Update Supabase Node (HTTP Request Node)
**Settings:**
- **Method**: POST
- **URL**: `https://your-project.supabase.co/rest/v1/workflow_logs`
- **Headers**:
  ```
  Authorization: Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY
  apikey: YOUR_SUPABASE_ANON_KEY
  Content-Type: application/json
  ```
- **Body**:
```json
{
  "workflow_name": "File Upload Processing",
  "status": "success",
  "execution_time": 1500,
  "message": "Processed {{ $json.processed_count }} records from {{ $json.file_id }}"
}
```

#### D. Update File Status Node (HTTP Request Node)
**Settings:**
- **Method**: POST
- **URL**: `https://your-dashboard-domain.com/api/upload-file`
- **Body**:
```json
{
  "file_id": "{{ $('Webhook').first().json.file_id }}",
  "status": "processed",
  "n8n_response": {
    "processed_count": "{{ $json.processed_count }}",
    "processing_time": "{{ new Date().toISOString() }}"
  }
}
```

## 🔧 Environment Variables

Add these to your `.env.local`:

```env
# N8N Webhook Configuration
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/upload-data
N8N_API_KEY=your-n8n-api-key (optional)
```

## 🧪 Testing the Webhook

### 1. Test with cURL
```bash
curl -X POST https://your-n8n-instance.com/webhook/upload-data \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "test-123",
    "file_name": "test.csv",
    "client_id": "demo-client",
    "file_type": "csv",
    "data": [{"name": "Test User", "email": "test@example.com"}],
    "upload_time": "2024-01-15T10:30:00Z"
  }'
```

### 2. Expected Response
```json
{
  "success": true,
  "message": "File processed successfully",
  "processed_count": 1
}
```

## 📊 Advanced Processing Examples

### CSV Processing
```javascript
// Function node for CSV processing
const csvData = $json.data;
const results = [];

csvData.forEach((row, index) => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (emailRegex.test(row.email)) {
    results.push({
      id: index + 1,
      name: row.name?.trim(),
      email: row.email?.toLowerCase(),
      status: 'valid',
      processed_at: new Date().toISOString()
    });
  } else {
    results.push({
      id: index + 1,
      name: row.name?.trim(),
      email: row.email,
      status: 'invalid_email',
      error: 'Invalid email format'
    });
  }
});

return { processed_data: results };
```

### Excel Processing
```javascript
// Function node for Excel processing
const excelData = $json.data;
const aggregated = {};

excelData.forEach(row => {
  const category = row.category || 'Other';
  
  if (!aggregated[category]) {
    aggregated[category] = {
      count: 0,
      total_value: 0,
      items: []
    };
  }
  
  aggregated[category].count++;
  aggregated[category].total_value += parseFloat(row.value || 0);
  aggregated[category].items.push(row);
});

return { aggregated_data: aggregated };
```

### JSON Processing
```javascript
// Function node for JSON processing
const jsonData = $json.data;

// Transform nested JSON structure
const flattened = jsonData.map(item => {
  const flat = {};
  
  function flatten(obj, prefix = '') {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        flatten(obj[key], prefix + key + '_');
      } else {
        flat[prefix + key] = obj[key];
      }
    }
  }
  
  flatten(item);
  return flat;
});

return { flattened_data: flattened };
```

## 🔒 Security Considerations

### 1. Authentication
- Add API key validation in your webhook
- Use Supabase Row Level Security
- Validate client_id matches authenticated user

### 2. Rate Limiting
- Implement rate limiting in n8n
- Add request size limits
- Monitor webhook usage

### 3. Data Validation
- Validate file types and sizes
- Sanitize input data
- Check for malicious content

## 🚀 Production Deployment

### 1. SSL/HTTPS
- Ensure your n8n instance uses HTTPS
- Use valid SSL certificates

### 2. Monitoring
- Set up error notifications in n8n
- Monitor webhook response times
- Log all file processing activities

### 3. Scaling
- Use n8n cloud for automatic scaling
- Implement queue system for large files
- Consider batch processing for multiple files

---

🎉 **Your file upload system is now complete!** 

Files uploaded through your dashboard will be automatically processed by n8n and results will appear in your workflow logs in real-time.


