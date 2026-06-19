import { z } from 'zod';

export const errorHandler = (err, req, res, next) => {
    let status = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle Zod validation errors
    if (err instanceof z.ZodError) {
        status = 400;
        message = err.errors.map(e => e.message).join(', ');
    }

    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}