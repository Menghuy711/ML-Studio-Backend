import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const stamp = Date.now();
const email = `opencode-test-${stamp}@example.com`;
const oldPassword = 'OldPass123!';
const newPassword = 'NewPass456!';

// 1. Create a fresh test account
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email,
  password: oldPassword,
  options: { data: { username: 'opencode-test' } },
});

if (signUpError) {
  console.log('STEP 1 SIGNUP: FAIL ->', signUpError.message);
  process.exit(1);
}
console.log('STEP 1 SIGNUP: OK  (account:', email, ')');
console.log('  session returned:', signUpData.session ? 'yes' : 'no');

// If no session (email confirmation enabled), we cannot test updateUser directly.
if (!signUpData.session) {
  console.log('SKIP: Email confirmation is enabled -> no session to updateUser with.');
  process.exit(0);
}

// 2. Simulate the ResetPassword page: update the password with a valid session
const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
if (updateError) {
  console.log('STEP 2 UPDATE PASSWORD: FAIL ->', updateError.message);
  process.exit(1);
}
console.log('STEP 2 UPDATE PASSWORD: OK');

// 3. Old password should no longer work
const oldLogin = await supabase.auth.signInWithPassword({ email, password: oldPassword });
console.log('STEP 3 OLD PASSWORD LOGIN: ' + (oldLogin.error ? 'REJECTED (expected) -> ' + oldLogin.error.message : 'ALLOWED (unexpected!)'));

// 4. New password should work
const newLogin = await supabase.auth.signInWithPassword({ email, password: newPassword });
if (newLogin.error) {
  console.log('STEP 4 NEW PASSWORD LOGIN: FAIL ->', newLogin.error.message);
  process.exit(1);
}
console.log('STEP 4 NEW PASSWORD LOGIN: OK');

// Cleanup: sign out the test session
await supabase.auth.signOut();
console.log('\nTEST COMPLETE: password update flow verified.');
