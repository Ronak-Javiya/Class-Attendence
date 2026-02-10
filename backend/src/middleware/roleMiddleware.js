/**
 * Role-Based Access Control Middleware — requireRole
 *
 * Must be used AFTER requireAuth middleware.
 * Accepts an array of allowed roles.
 * Blocks by default — no role match means no access.
 *
 * Usage:
 *   router.get('/admin-only', requireAuth, requireRole(['ADMIN', 'HOD']), handler);
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        // Defensive: requireAuth must have run first
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required before role check.',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
            });
        }

        next();
    };
};

module.exports = requireRole;
