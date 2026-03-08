const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config(); // Load from current dir
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- Supabase Auth Initialization ---');
console.log('URL:', supabaseUrl ? 'Set' : 'MISSING');
console.log('Anon Key:', supabaseAnonKey ? 'Set' : 'MISSING');
console.log('Service Key:', serviceKey ? `Set (ends with ${serviceKey.slice(-4)})` : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase credentials!');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = serviceKey ? createClient(supabaseUrl, serviceKey) : supabase;

module.exports = { supabase, supabaseAdmin };
