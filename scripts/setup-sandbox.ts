import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables for sandbox setup:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSampleUser(email: string, password: string, role: string = 'user') {
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role
    }
  });

  if (authError && !authError.message.includes('already registered')) {
    throw authError;
  }

  return authData.user;
}

async function createSampleCampaigns(userId: string) {
  const campaigns = [
    {
      user_id: userId,
      name: 'Welcome Series',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      user_id: userId,
      name: 'Product Demo Follow-up',
      status: 'draft',
      created_at: new Date().toISOString()
    },
    {
      user_id: userId,
      name: 'Customer Feedback',
      status: 'paused',
      created_at: new Date().toISOString()
    }
  ];

  const { error } = await supabase
    .from('campaigns')
    .upsert(campaigns, { onConflict: 'name,user_id' });

  if (error) {
    console.warn('Warning: Could not create sample campaigns:', error.message);
  }

  return campaigns;
}

async function createSampleLeads(campaignIds: string[] = []) {
  const leads = [
    { email: 'john.doe@example.com', status: 'new', campaign_id: campaignIds[0] || null },
    { email: 'jane.smith@example.com', status: 'contacted', campaign_id: campaignIds[0] || null },
    { email: 'bob.johnson@example.com', status: 'replied', campaign_id: campaignIds[1] || null },
    { email: 'alice.brown@example.com', status: 'bounced', campaign_id: campaignIds[1] || null },
    { email: 'charlie.wilson@example.com', status: 'unsubscribed', campaign_id: campaignIds[2] || null },
  ];

  const { error } = await supabase
    .from('leads')
    .upsert(leads, { onConflict: 'email' });

  if (error) {
    console.warn('Warning: Could not create sample leads:', error.message);
  }

  return leads;
}

async function setupSandboxEnvironment() {
  try {
    console.log('🏗️  Setting up Winston AI sandbox environment...');

    // Create demo users
    console.log('👥 Creating demo users...');
    const adminUser = await createSampleUser('admin@winston-ai.com', 'demo123', 'admin');
    const demoUser = await createSampleUser('demo@winston-ai.com', 'demo123', 'user');
    const testUser = await createSampleUser('test@winston-ai.com', 'demo123', 'user');

    // Create sample campaigns
    console.log('📧 Creating sample campaigns...');
    const campaigns = await createSampleCampaigns(demoUser?.id || '');

    // Create sample leads
    console.log('👤 Creating sample leads...');
    const leads = await createSampleLeads();

    // Get statistics
    const { data: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' });

    const { data: totalCampaigns } = await supabase
      .from('campaigns')
      .select('id', { count: 'exact' });

    const { data: totalLeads } = await supabase
      .from('leads')
      .select('id', { count: 'exact' });

    console.log('\n✅ Sandbox environment setup complete!');
    console.log('📊 Statistics:');
    console.log(`   Users: ${totalUsers?.length || 0}`);
    console.log(`   Campaigns: ${totalCampaigns?.length || 0}`);
    console.log(`   Leads: ${totalLeads?.length || 0}`);
    console.log('\n🔐 Demo Accounts:');
    console.log('   Admin: admin@winston-ai.com / demo123');
    console.log('   Demo:  demo@winston-ai.com / demo123');
    console.log('   Test:  test@winston-ai.com / demo123');
    console.log('\n🚀 Ready to launch!');

  } catch (error) {
    console.error('❌ Error setting up sandbox environment:', error);
    process.exit(1);
  }
}

setupSandboxEnvironment()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 