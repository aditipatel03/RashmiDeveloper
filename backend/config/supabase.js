const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env file');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

let supabaseAdmin;
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('✅ Supabase Admin (Service Role) client enabled');
} else {
    supabaseAdmin = supabase;
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is missing from .env - Admin features will not work');
}

module.exports = { supabase, supabaseAdmin };
