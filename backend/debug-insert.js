const { supabase } = require('./config/supabase');

async function debugInsert() {
    console.log('Testing insert into appointments...');
    try {
        const dummy = {
            name: 'Test User',
            phone: '1234567890',
            email: 'test@example.com',
            property_id: null,
            message: 'Test message',
            status: 'pending',
            type: 'Enquiry'
        };
        const { error: insertError } = await supabase
            .from('appointments')
            .insert([dummy])
            .select();

        if (insertError) {
            console.log('INSERT_ERROR_CODE:' + insertError.code);
            console.log('INSERT_ERROR_MESSAGE:' + insertError.message);
        } else {
            console.log('INSERT_SUCCESS');
        }
    } catch (err) {
        console.log('UNEXPECTED_ERROR:' + err.message);
    }
}

debugInsert();
