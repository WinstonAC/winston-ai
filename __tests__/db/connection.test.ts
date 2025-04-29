import { supabase } from '@/lib/supabaseClient';

describe('Database Connection', () => {
  it('should connect to Supabase', async () => {
    const { data, error } = await supabase.from('users').select('count').single();
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should be able to query users', async () => {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should be able to query campaigns', async () => {
    const { data, error } = await supabase.from('campaigns').select('*').limit(1);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should handle RLS policies', async () => {
    // Test that unauthenticated requests are blocked
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    // Should get a permission denied error due to RLS
    expect(error?.message).toContain('permission denied');
    expect(data).toBeNull();
  });
}); 