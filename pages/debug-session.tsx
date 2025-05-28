import { useSession } from '@supabase/auth-helpers-react';
import { useEffect } from 'react';

export default function DebugSessionPage() {
  const session = useSession();

  useEffect(() => {
    console.log('[DEBUG] Current Supabase session:', session);
  }, [session]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🧪 Supabase Session Debug</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <p>
        If the session is <code>null</code>, it means you're not signed in. Try signing in first and return to this page.
      </p>
    </div>
  );
} 