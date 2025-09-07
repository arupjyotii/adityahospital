import path from 'path';
import express from 'express';
/**
 * Sets up static file serving for the Express app
 * @param app Express application instance
 */
export function setupStaticServing(app) {
    // Serve static files from the dist/public directory
    app.use(express.static(path.join(process.cwd(), 'dist', 'public')));
    // For any other routes, serve the index.html file
    app.use((req, res, next) => {
        // Skip API routes
        if (req.path.startsWith('/api/')) {
            return next();
        }
        res.sendFile(path.join(process.cwd(), 'dist', 'public', 'index.html'));
    });
}
