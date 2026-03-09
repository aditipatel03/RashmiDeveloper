const { supabaseAdmin } = require('./config/supabase');
const fs = require('fs');

async function checkPropSchema() {
    try {
        const { data, error } = await supabaseAdmin.from('properties').select('*').limit(1);
        if (error) throw error;

        const schema = {
            columns: data.length > 0 ? Object.keys(data[0]) : 'No data to infer columns',
            sample: data[0] || 'Empty table'
        };

        fs.writeFileSync('prop_schema.json', JSON.stringify(schema, null, 2));
        console.log('Schema saved to prop_schema.json');
    } catch (err) {
        console.error('Error checking schema:', err);
    }
}

checkPropSchema();
