const { supabaseAdmin } = require('./config/supabase');

async function testJoin() {
    try {
        const { data, error } = await supabaseAdmin
            .from('properties')
            .select('id, title, user_id, profile:user_id (username, role)')
            .limit(5);

        if (error) throw error;
        console.log('Join results:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Join test failed:', err);
    }
}

testJoin();
