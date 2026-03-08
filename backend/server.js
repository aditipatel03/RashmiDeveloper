const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { supabase } = require('./config/supabase');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('RLD API (Supabase) is running...');
});

// Check Supabase connection
const checkConnection = async () => {
    try {
        const { data: table1, error: err1 } = await supabase.from('properties').select('id').limit(1);
        if (err1) throw err1;

        const { data: table2, error: err2 } = await supabase.from('profiles').select('id').limit(1);
        if (err2) {
            console.warn('Profiles table check failed. RLS might be blocking or table missing.');
        } else {
            console.log('Supabase tables verified successfully!');
        }

        console.log('Supabase connected successfully!');
    } catch (err) {
        console.error('Supabase connection error:', err.message);
        console.log('Ensure you have run the SQL script in Supabase SQL Editor.');
    }
};

checkConnection();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
