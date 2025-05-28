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

async function checkSandboxStatus() {
  try {
    console.log('🔍 Checking Winston AI sandbox status...');

    // Check database connection
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .limit(1);

    if (usersError) {
      throw usersError;
    }

    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id', { count: 'exact' })
      .limit(1);

    if (campaignsError) {
      throw campaignsError;
    }

    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id', { count: 'exact' })
      .limit(1);

    if (leadsError) {
      throw leadsError;
    }

    console.log('✅ Sandbox is running!');
    console.log('📊 Current data:');
    console.log(`   Users: ${users?.length || 0}`);
    console.log(`   Campaigns: ${campaigns?.length || 0}`);
    console.log(`   Leads: ${leads?.length || 0}`);
    console.log('\n🌐 Access your sandbox at: http://localhost:3000');
    console.log('🔐 Demo login: demo@winston-ai.com / demo123');

  } catch (error) {
    console.error('❌ Sandbox check failed:', error);
    console.log('\n💡 Try running: npm run sandbox:setup');
    process.exit(1);
  }
}

checkSandboxStatus()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 