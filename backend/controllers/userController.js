const { supabase, supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { email, password, username, name, phone } = req.body;

    // Phone Validation
    if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
        return res.status(400).json({ msg: 'Please provide a valid 10-digit phone number' });
    }

    // Name Validation
    if (name && !/^[a-zA-Z\s]+$/.test(name)) {
        return res.status(400).json({ msg: 'Name should contain only letters and spaces' });
    }

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
                // If user exists, we return an error to prevent "stealth linking" or confusion
                return res.status(400).json({ msg: 'This email is already registered. Please log in instead.' });
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

        // Fetch user profile for role and username
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, username')
            .eq('id', data.user.id)
            .single();

        res.json({
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                username: profile ? profile.username : (data.user.email.split('@')[0]),
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
        const { count: uCount, error: userError } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        const { data: propStats, error: propError } = await supabaseAdmin
            .from('properties')
            .select('verified, status');

        const { data: visitData, error: visitError } = await supabaseAdmin
            .from('site_visits')
            .select('count')
            .eq('visit_date', new Date().toISOString().split('T')[0])
            .single();

        const { data: allUsers, error: allUsersError } = await supabaseAdmin
            .from('profiles')
            .select('created_at, role');

        const { data: appStats, error: appError } = await supabaseAdmin
            .from('appointments')
            .select('type, status');

        if (userError || propError || allUsersError || appError) throw userError || propError || allUsersError || appError;

        const totalProperties = propStats.length;
        const pendingProperties = propStats.filter(p => (p.status || 'Active') === 'Inactive').length;
        const activeProperties = propStats.filter(p => (p.status || 'Active') === 'Active').length;
        const soldProperties = propStats.filter(p => p.status?.toLowerCase().includes('sold')).length;

        const totalEnquiries = appStats.filter(a => a.type === 'Enquiry').length;
        const totalSiteVisits = appStats.filter(a => a.type === 'Site Visit').length;
        const pendingAppointments = appStats.filter(a => (a.status || 'Pending').toLowerCase() === 'pending').length;

        const today = new Date().toISOString().split('T')[0];
        const newUsersToday = allUsers.filter(u => u.created_at.startsWith(today)).length;
        const blockedUsers = 0; // Placeholder until blocked logic is implemented

        res.json({
            totalUsers: uCount || 0,
            newUsersToday,
            blockedUsers,
            totalProperties,
            pendingProperties,
            activeProperties,
            soldProperties,
            totalEnquiries,
            totalSiteVisits,
            pendingAppointments,
            visitsToday: visitData?.count || 0
        });
    } catch (err) {
        console.error('Stats Error:', err);
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

exports.updateProfile = async (req, res) => {
    const { username, email, phone, password } = req.body;
    const userId = req.user.id;

    // Phone Validation (if provided)
    if (phone !== undefined && (phone.length !== 10 || !/^\d+$/.test(phone))) {
        return res.status(400).json({ msg: 'Please provide a valid 10-digit phone number' });
    }

    // Name Validation (username field used for display name)
    if (username && !/^[a-zA-Z\s]+$/.test(username)) {
        return res.status(400).json({ msg: 'Name should contain only letters and spaces' });
    }

    try {
        // 1. Update Auth User if email or password is provided
        const authUpdate = {};
        if (password) authUpdate.password = password;
        if (email) authUpdate.email = email;

        if (Object.keys(authUpdate).length > 0) {
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                authUpdate
            );
            if (authError) throw authError;
        }

        // 2. Update Profile table
        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;

        if (Object.keys(updateData).length > 0) {
            const { data, error: profileError } = await supabaseAdmin
                .from('profiles')
                .update(updateData)
                .eq('id', userId)
                .select()
                .single();

            if (profileError) throw profileError;

            // Update local user object in response
            res.json({
                msg: 'Profile updated successfully',
                user: {
                    id: userId,
                    email: data.email,
                    username: data.username,
                    role: data.role
                }
            });
        } else {
            res.json({ msg: 'Profile updated successfully' });
        }
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(400).json({ msg: err.message });
    }
};
