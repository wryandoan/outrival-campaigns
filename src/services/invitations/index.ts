import { supabase } from '../supabase';
import { customAlphabet } from 'nanoid';

const generateToken = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 32);

export function generateInviteToken(): string {
  return generateToken();
}

export async function acceptInvitation(token: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('accept_invitation', { invite_token: token });

  if (error) {
    console.error('Error accepting invitation:', error);
    return false;
  }

  return data || false;
}