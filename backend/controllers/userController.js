const supabase = require('../config/supabase');
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

        // 2. Create Profile in Public Profiles Table
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: authData.user.id,
                username: username || name || email.split('@')[0],
                role: 'user'
            }]);

        if (profileError) throw profileError;

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
