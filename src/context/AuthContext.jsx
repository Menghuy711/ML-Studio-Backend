import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from './AuthContextValues';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch the profile row to determine admin status
  const fetchProfile = async (userId) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    setIsAdmin(data?.is_admin === true);
  };

  useEffect(() => {
    // Get any existing session on first load
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        const u = session?.user ?? null;
        setUser(u);
        await fetchProfile(u?.id);
      })
      .catch((err) => {
        console.error('Auth session error:', err);
        setUser(null);
        setIsAdmin(false);
      })
      .finally(() => setLoading(false));

    // Keep state in sync whenever auth state changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      await fetchProfile(u?.id);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // username is stored in user_metadata since Supabase auth itself is email-based
  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setIsAdmin(false);
    return { error };
  };

  const resetPasswordForEmail = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    return { data, error };
  };

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, loading, signUp, signIn, signOut, resetPasswordForEmail, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}
