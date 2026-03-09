const { supabase } = require('./config/supabase');

async function detailedDiagnostic() {
    console.log('--- Supabase Diagnostic Start ---');
    try {
        // 1. Check if we can connect at all
        const { data: props, error: propError } = await supabase.from('properties').select('id').limit(1);
        if (propError) {
            console.error('Connection Check Failed:', propError.message);
            return;
        }
        console.log('Connection OK. Sample Property ID:', props[0]?.id);

        // 2. Check if appointments table exists
        const { error: tableError } = await supabase.from('appointments').select('id').limit(1);
        if (tableError) {
            console.error('Appointments Table Check:', tableError.message);
            if (tableError.code === '42P01') {
                console.error('CRITICAL: Table "appointments" DOES NOT EXIST.');
            }
        } else {
            console.log('Appointments Table: EXISTS');
        }

        // 3. Check schema of properties table (to verify UUID vs String)
        console.log('Checking first property structure...');
        const { data: fullProp } = await supabase.from('properties').select('*').limit(1);
        console.log('Property ID Type:', typeof fullProp[0]?.id);
        console.log('Property Keys:', Object.keys(fullProp[0] || {}).join(', '));

        // 4. Test insert with exact data structure used by frontend
        console.log('Testing dummy insert...');
        const dummy = {
            name: 'Diagnostic Test',
            phone: '0000000000',
            property_id: props[0]?.id,
            type: 'Enquiry',
            message: 'Diagnostic test message'
        };
        const { data: insertData, error: insertError } = await supabase
            .from('appointments')
            .insert([dummy])
            .select();

        if (insertError) {
            console.error('Insert Test Failed:', insertError.message);
            console.error('Code:', insertError.code);
            console.error('Details:', insertError.details);
            console.error('Hint:', insertError.hint);
        } else {
            console.log('Insert Test: SUCCESS');
            console.log('Inserted ID:', insertData[0]?.id);
        }
    } catch (err) {
        console.error('Unexpected crash:', err.stack);
    }
    console.log('--- Supabase Diagnostic End ---');
}

detailedDiagnostic();
