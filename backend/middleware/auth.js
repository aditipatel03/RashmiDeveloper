const { supabase } = require('../config/supabase');

module.exports = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ msg: 'Token is not valid' });
        }

        // Fetch profile to get role and username
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, username')
            .eq('id', user.id)
            .single();

        req.user = {
            ...user,
            role: profile ? profile.role : 'user',
            username: profile ? profile.username : (user.email.split('@')[0])
        };
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Server Error in Auth' });
    }
};
