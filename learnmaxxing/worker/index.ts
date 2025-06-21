import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Define environment variables
interface Env {
  // Add your environment variables here
  // Example: R2_BUCKET: R2Bucket;
}

// Define upload result types
interface UploadSuccess {
  filename: string;
  success: true;
  size: number;
  type: string;
}

interface UploadError {
  filename: string;
  success: false;
  error: string;
}

type UploadResult = UploadSuccess | UploadError;

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// Add CORS middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'], // Add your frontend URLs
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'Worker is running' });
});

// File upload endpoint
app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const files = formData.getAll('file') as File[];
    
    if (!files || files.length === 0) {
      return c.json({ error: 'No files provided' }, 400);
    }

    const uploadResults: UploadResult[] = [];

    for (const file of files) {
      // Validate file type
      const validTypes = ['text/plain', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        uploadResults.push({
          filename: file.name,
          success: false,
          error: 'Invalid file type. Only PDF and TXT files are allowed.'
        });
        continue;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        uploadResults.push({
          filename: file.name,
          success: false,
          error: 'File too large. Maximum size is 10MB.'
        });
        continue;
      }

      try {
        // Here you would typically:
        // 1. Upload to R2 bucket
        // 2. Store metadata in D1 database
        // 3. Process the file content
        
        // Placeholder implementation
        const fileContent = await file.text();
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        uploadResults.push({
          filename: file.name,
          success: true,
          size: file.size,
          type: file.type,
          // Add any additional metadata you want to return
        });
        
      } catch (error) {
        uploadResults.push({
          filename: file.name,
          success: false,
          error: 'Failed to process file'
        });
      }
    }

    const successCount = uploadResults.filter(r => r.success).length;
    const failureCount = uploadResults.filter(r => !r.success).length;

    return c.json({
      message: `Upload completed. ${successCount} successful, ${failureCount} failed.`,
      results: uploadResults
    });

  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get uploaded files endpoint
app.get('/api/files', async (c) => {
  try {
    // Placeholder implementation
    // In a real app, you would fetch from your database
    const files = [
      {
        id: '1',
        filename: 'example.pdf',
        size: 1024000,
        type: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        status: 'processed'
      }
    ];

    return c.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete file endpoint
app.delete('/api/files/:id', async (c) => {
  try {
    const fileId = c.req.param('id');
    
    // Placeholder implementation
    // In a real app, you would delete from your database and storage
    
    return c.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Export the app as default handler
export default app;

// Export the router type for client usage
export type AppRouter = typeof app;
