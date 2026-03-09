const { supabaseAdmin } = require('./config/supabase');
async function check() {
    const { data } = await supabaseAdmin.from('appointments').select('*').limit(1);
    console.log('---COLS_START---');
    if (data && data.length > 0) {
        console.log(Object.keys(data[0]).join(','));
    } else {
        console.log('EMPTY_TABLE_OR_ERROR');
    }
    console.log('---COLS_END---');
    process.exit();
}
check();
