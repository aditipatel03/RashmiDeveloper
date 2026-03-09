const { supabase, supabaseAdmin } = require('../config/supabase');

module.exports = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ msg: 'Token is not valid' });
        }

        // Fetch profile to get role and username using supabaseAdmin to bypass RLS
        const { data: profile, error: pError } = await supabaseAdmin
            .from('profiles')
            .select('role, username')
            .eq('id', user.id)
            .single();

        if (pError) {
            console.error('Auth Middleware Profile Fetch Error:', pError);
        }

        req.user = {
            ...user,
            role: profile ? (profile.role || 'user').toLowerCase() : 'user',
            username: profile ? profile.username : (user.email.split('@')[0])
        };

        // Debug log for admin access issues
        console.log(`Auth Middleware: User ${user.email} Role: ${req.user.role}`);

        next();
    } catch (err) {
        console.error('Server Auth Error:', err);
        res.status(401).json({ msg: 'Server Error in Auth' });
    }
};
