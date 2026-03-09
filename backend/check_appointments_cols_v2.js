const { supabaseAdmin } = require('./config/supabase');

async function check() {
    try {
        const { data, error } = await supabaseAdmin
            .from('appointments')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error fetching appointments:', error);
            if (error.message.includes('column "email" does not exist')) {
                console.log('CONFIRMED: Column "email" is missing.');
            }
        } else if (data && data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]));
        } else {
            console.log('Table is empty, checking columns via RPC or metadata...');
            // Fallback: try to select just the new columns to see if they exist
            const { error: eError } = await supabaseAdmin.from('appointments').select('email').limit(0);
            const { error: sError } = await supabaseAdmin.from('appointments').select('subject').limit(0);

            console.log('Check email column:', eError ? 'MISSING' : 'EXISTS');
            console.log('Check subject column:', sError ? 'MISSING' : 'EXISTS');
        }
    } catch (err) {
        console.error('Check failed:', err);
    }
    process.exit();
}

check();
