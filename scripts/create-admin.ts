import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('Creating admin user with Supabase...');
    
    // Check if any users exist
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (fetchError) {
      throw fetchError;
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log('Users already exist in the database. Skipping admin creation.');
      return;
    }

    // Create admin user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@winston-ai.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Winston AI Admin',
        role: 'admin'
      }
    });

    if (authError) {
      throw authError;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@winston-ai.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 