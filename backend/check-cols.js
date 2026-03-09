const { supabase } = require('./config/supabase');
const fs = require('fs');

async function checkColumns() {
    try {
        // Query PostgreSQL catalog for column names
        const { data, error } = await supabase.rpc('get_table_columns', { t_name: 'appointments' });

        // If RPC doesn't exist, we can try a simple select and check keys
        // But select might fail if columns are missing.
        // Let's try select * but with a limit of 0 to get the structure
        const { data: colsData, error: colsError } = await supabase.from('appointments').select('*').limit(0);

        const results = {
            error: colsError,
            columns: colsData ? Object.keys(colsData[0] || {}) : []
        };

        // If it's empty, we might need to insert a dummy row or use another method.
        // Usually, select * .limit(0) returns empty array but the header might not be visible in JS.

        // Alternative: try to insert and see which columns are rejected

        fs.writeFileSync('col_results.json', JSON.stringify(results, null, 2));
    } catch (err) {
        fs.writeFileSync('col_results.json', JSON.stringify({ crash: err.message }, null, 2));
    }
}

checkColumns();
