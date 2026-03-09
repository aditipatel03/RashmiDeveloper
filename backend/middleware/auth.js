const { supabase, supabaseAdmin } = require('../config/supabase');

module.exports = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ msg: 'Token is not valid' });
        }

        const { data: profile, error: pError } = await supabaseAdmin
            .from('profiles')
            .select('role, username')
            .eq('id', user.id)
            .single();

        let role = profile ? (profile.role || 'user').toLowerCase() : 'user';

        req.user = {
            ...user,
            role,
            username: profile ? profile.username : (user.email.split('@')[0])
        };

        // Temporary verbose debugging for the user to see in their browser console
        if (req.user.role !== 'admin' && req.originalUrl.includes('/appointments')) {
            console.error(`Auth Debug: User ${user.email} (ID: ${user.id}) has role: ${req.user.role}. Profile Error:`, pError);
        }

        next();
    } catch (err) {
        console.error('Server Auth Error:', err);
        res.status(401).json({ msg: 'Server Error in Auth' });
    }
};
