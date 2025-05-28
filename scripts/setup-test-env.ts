import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables for test setup:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTestEnvironment() {
  try {
    console.log('Setting up test environment with Supabase...');

    // Create test user via Supabase Auth
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'test_password_123';

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User',
        role: 'user'
      }
    });

    if (authError && !authError.message.includes('already registered')) {
      throw authError;
    }

    // Create test leads
    const testLeads = [
      { email: 'lead1@example.com', status: 'new', campaign_id: null },
      { email: 'lead2@example.com', status: 'contacted', campaign_id: null },
      { email: 'lead3@example.com', status: 'replied', campaign_id: null },
    ];

    const { error: leadsError } = await supabase
      .from('leads')
      .upsert(testLeads, { onConflict: 'email' });

    if (leadsError) {
      console.warn('Warning: Could not create test leads:', leadsError.message);
    }

    console.log('✅ Test environment setup complete!');
    console.log('📧 Test user email:', testEmail);
    console.log('🔑 Test user password:', testPassword);

  } catch (error) {
    console.error('❌ Error setting up test environment:', error);
    process.exit(1);
  }
}

setupTestEnvironment()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 