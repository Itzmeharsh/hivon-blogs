'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // insert into users table
    await supabase.from('users').insert({
      id: data.user?.id,
      email,
      role: 'viewer',
    });

    alert('Signup successful');
  };

  return (
    <div className="p-10">
      <h1>Signup</h1>
      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 m-2"
      />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 m-2"
      />
      <button onClick={handleSignup} className="bg-blue-500 text-white p-2">
        Signup
      </button>
    </div>
  );
}