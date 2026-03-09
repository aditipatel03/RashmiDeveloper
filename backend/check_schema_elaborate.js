const { supabaseAdmin } = require('./config/supabase');

async function checkSchema() {
    try {
        // Query pg_attribute to get column details
        const { data, error } = await supabaseAdmin.rpc('get_table_columns_info', { table_name: 'appointments' });

        if (error) {
            console.log('RPC failed, trying information_schema...');
            const { data: info, error: iError } = await supabaseAdmin
                .from('appointments')
                .select('*')
                .limit(1);

            if (info && info.length > 0) {
                console.log('Sample record details:', Object.keys(info[0]));
            } else {
                console.log('Table is empty. Testing insert capability...');
                const testData = {
                    name: 'Schema Test',
                    phone: '0000000000',
                    type: 'Test',
                    message: 'Checking column defaults'
                };
                const { error: tError } = await supabaseAdmin.from('appointments').insert([testData]);
                console.log('Test insert (minimal fields):', tError ? `FAILED: ${tError.message}` : 'SUCCESS');
            }
        } else {
            console.log('Detailed Schema:', data);
        }
    } catch (err) {
        console.error('Schema check failed:', err);
    }
    process.exit();
}

checkSchema();
