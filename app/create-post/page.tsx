'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !body) {
            alert("Please fill all fields");
            return;
        }

        setLoading(true);

        // 🔐 Get logged in user
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (!user) {
            alert("Login required");
            setLoading(false);
            return;
        }

        // 🔐 Get user role from DB
        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (userData.role !== 'author' && userData.role !== 'admin') {
            alert("Access denied: Only authors/admins can create posts");
            setLoading(false);
            return;
        }

        try {
            // 🤖 Generate AI summary (server API)
            const res = await fetch('/api/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: body }),
            });

            const data = await res.json();

            if (!data.summary) {
                throw new Error("AI summary failed");
            }

            // 📝 Insert into DB
            const { error } = await supabase.from('posts').insert({
                title,
                body,
                summary: data.summary,
                author_id: user.id,
            });

            if (error) throw error;

            alert("Post created successfully ✅");

            // 🔄 Reset form
            setTitle('');
            setBody('');
        } catch (err: any) {
            alert(err.message || "Something went wrong");
        }

        setLoading(false);
    };

    return (
        <div className="p-10 max-w-xl mx-auto">
            <h1 className="text-2xl mb-4">Create Post</h1>

            <input
                value={title}
                placeholder="Title"
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 mb-3 w-full"
            />

            <textarea
                value={body}
                placeholder="Content"
                onChange={(e) => setBody(e.target.value)}
                className="border p-2 mb-3 w-full"
                rows={5}
            />

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-500 text-white p-2 w-full"
            >
                {loading ? "Creating..." : "Submit"}
            </button>
        </div>
    );
}