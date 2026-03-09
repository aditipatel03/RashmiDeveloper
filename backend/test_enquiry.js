const { supabaseAdmin } = require('./config/supabase');

async function testEnquiry() {
    const testData = {
        name: 'Test General Enquiry',
        phone: '9988776655',
        type: 'Enquiry',
        subject: 'General Enquiry',
        message: 'This is a test message from the contact form',
        status: 'Pending'
    };

    console.log('Sending test enquiry...');
    const { data, error } = await supabaseAdmin
        .from('appointments')
        .insert([testData])
        .select();

    if (error) {
        console.error('Insert failed:', error);
    } else {
        console.log('Insert success:', data);
        console.log('Now checking if it shows up with the join query...');

        const { data: list, error: lError } = await supabaseAdmin
            .from('appointments')
            .select('*, property_id(*)')
            .eq('id', data[0].id);

        if (lError) {
            console.error('Join query failed:', lError);
        } else {
            console.log('Join query result:', list);
        }
    }
    process.exit();
}

testEnquiry();
