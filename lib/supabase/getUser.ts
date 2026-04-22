import { supabase } from './client';

export async function getCurrentUser() {
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return null;

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  return userData;
}