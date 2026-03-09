const { supabase } = require('./config/supabase');

async function check() {
    const { data: colsData, error } = await supabase.from('appointments').select('*').limit(1);
    if (error) {
        console.error('Error fetching appointments:', error);
    } else {
        console.log('Columns in appointments table:', Object.keys(colsData[0] || {}));
    }
    process.exit();
}

check();
