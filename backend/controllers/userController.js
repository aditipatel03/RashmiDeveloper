const { supabase, supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { email, password, username, name } = req.body;
    try {
        // 1. Create User in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;

        // 2. Create Profile using supabaseAdmin (bypasses RLS)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert([{
                id: authData.user.id,
                username: username || name || email.split('@')[0],
                role: 'user'
            }], { onConflict: 'id' });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Profile failed, but auth user is created. We return success but log error.
            // Or we could delete the auth user here if we want strict atomicity.
        }

        res.status(201).json({ msg: 'User registered successfully', user: authData.user });
    } catch (err) {
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
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${req.protocol}://${req.get('host')}/reset-password.html`,
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
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        res.json({ msg: 'Password updated successfully.' });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};
