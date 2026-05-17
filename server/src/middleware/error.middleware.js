function formatZodError(err) {
    const first = err.issues?.[0];
    if (!first) return 'Validation failed';
    const field = first.path?.length ? first.path.join('.') : 'input';
    return first.message || `Invalid ${field}`;
}

export const errorHandler = (err, req, res, next) => {
    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            message: formatZodError(err),
            ...(process.env.NODE_ENV === 'development' && { details: err.issues }),
        });
    }

    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};