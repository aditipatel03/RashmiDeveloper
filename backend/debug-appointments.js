const { supabase } = require('./config/supabase');

async function debugAppointments() {
    console.log('Checking appointments table...');
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error selecting from appointments:', error.message);
            console.log('Detailed error:', JSON.stringify(error, null, 2));
        } else {
            console.log('Successfully selected from appointments. Data:', data);
        }

        // Try to insert a dummy record to check schema
        console.log('Testing insert...');
        const dummy = {
            name: 'Test',
            phone: '1234567890',
            email: 'test@example.com',
            property_id: null,
            message: 'Test message',
            status: 'pending',
            type: 'Enquiry'
        };
        const { error: insertError } = await supabase
            .from('appointments')
            .insert([dummy]);

        if (insertError) {
            console.error('Insert failed:', insertError.message);
            console.log('Detailed insert error:', JSON.stringify(insertError, null, 2));
        } else {
            console.log('Insert successful!');
        }
    } catch (err) {
        console.error('Unexpected error:', err.message);
    }
}

debugAppointments();
