const { supabase, supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { email, password, username, name, phone } = req.body;
    try {
        // 1. Create User using Admin API (Bypasses rate limits and email confirmation)
        // This requires SUPABASE_SERVICE_ROLE_KEY to be set
        let authUser;
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (authError) {
            if (authError.message.includes('already registered') || authError.status === 422) {
                // If user exists, try to get their ID to ensure profile exists
                const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
                authUser = userData.users.find(u => u.email === email);
                if (!authUser) throw authError;
            } else {
                throw authError;
            }
        } else {
            authUser = authData.user;
        }

        // 2. Create/Sync Profile (Bypasses RLS)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert([{
                id: authUser.id,
                username: username || name || email.split('@')[0],
                email: email,
                phone: phone || '',
                role: 'user'
            }], { onConflict: 'id' });

        if (profileError) {
            console.error('Profile sync error:', profileError);
            // We don't throw here to avoid "already registered" confusion if auth worked
        }

        res.status(201).json({ msg: 'User registered successfully', user: authUser });
    } catch (err) {
        console.error('Registration error details:', err);
        res.status(500).json({ msg: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Fetch user profile for role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        res.json({
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                role: profile ? profile.role : 'user'
            }
        });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        // Use the origin from where the request came (Frontend URL)
        const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/reset-password.html`,
        });
        if (error) throw error;
        res.json({ msg: 'Password reset instructions sent to your email.' });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { password } = req.body;
    try {
        // Use the authenticated user's ID from the middleware
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
            req.user.id,
            { password: password }
        );
        if (error) throw error;
        res.json({ msg: 'Password updated successfully.' });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const { data: userCount, error: userError } = await supabaseAdmin
            .from('profiles')
            .select('id', { count: 'exact', head: true });

        const { data: propStats, error: propError } = await supabaseAdmin
            .from('properties')
            .select('verified, status');

        const { data: visitData, error: visitError } = await supabaseAdmin
            .from('site_visits')
            .select('count')
            .eq('visit_date', new Date().toISOString().split('T')[0])
            .single();

        if (userError || propError) throw userError || propError;

        const totalProperties = propStats.length;
        const pendingProperties = propStats.filter(p => !p.verified).length;
        const activeProperties = propStats.filter(p => p.verified).length;
        const soldProperties = propStats.filter(p => p.status?.toLowerCase().includes('sold')).length;

        res.json({
            totalUsers: userCount?.count || 0,
            totalProperties,
            pendingProperties,
            activeProperties,
            soldProperties,
            visitsToday: visitData?.count || 0
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.trackVisit = async (req, res) => {
    try {
        const { error } = await supabaseAdmin.rpc('increment_visit_count');
        if (error) throw error;
        res.json({ msg: 'Visit tracked' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Delete from profiles (auth user will remain but profile gone, or use admin auth delete)
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (error) throw error;
        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
