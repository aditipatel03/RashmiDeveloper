const { supabase } = require('./config/supabase');
const fs = require('fs');

async function detailedDiagnostic() {
    const results = {
        timestamp: new Date().toISOString(),
        steps: []
    };

    function logStep(name, details) {
        results.steps.push({ name, details });
    }

    try {
        // 1. Connection Check
        const { data: props, error: propError } = await supabase.from('properties').select('id').limit(1);
        if (propError) {
            logStep('Connection Check', { status: 'FAILED', error: propError });
        } else {
            logStep('Connection Check', { status: 'OK', sampleId: props[0]?.id });

            // 2. Table Existence
            const { error: tableError } = await supabase.from('appointments').select('id').limit(1);
            if (tableError) {
                logStep('Table Check', { status: 'ERROR', error: tableError });
            } else {
                logStep('Table Check', { status: 'EXISTS' });
            }

            // 3. Property Schema
            const { data: fullProp } = await supabase.from('properties').select('*').limit(1);
            logStep('Property Schema', {
                idType: typeof fullProp[0]?.id,
                keys: Object.keys(fullProp[0] || {})
            });

            // 4. Test Insert
            const dummy = {
                name: 'Diagnostic Test',
                phone: '0000000000',
                property_id: props[0]?.id, // Using existing ID
                type: 'Enquiry',
                message: 'Diagnostic test message'
            };
            const { data: insertData, error: insertError } = await supabase
                .from('appointments')
                .insert([dummy])
                .select();

            if (insertError) {
                logStep('Insert Test', { status: 'FAILED', error: insertError });
            } else {
                logStep('Insert Test', { status: 'SUCCESS', insertedId: insertData[0]?.id });
            }
        }
    } catch (err) {
        logStep('Unexpected Crash', { error: err.message, stack: err.stack });
    }

    fs.writeFileSync('diag_results.json', JSON.stringify(results, null, 2));
    console.log('Diagnostic results written to diag_results.json');
}

detailedDiagnostic();
