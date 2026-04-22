'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';

export default function EditPost() {
    const { id } = useParams();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            const { data } = await supabase
                .from('posts')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setTitle(data.title);
                setBody(data.body);
            }
        };

        fetchPost();
    }, [id]);

    const handleUpdate = async () => {
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;

        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        const { data: post } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        // 🔐 Role check
        if (
            userData.role !== 'admin' &&
            post.author_id !== userId
        ) {
            alert("Access denied");
            return;
        }

        await supabase
            .from('posts')
            .update({ title, body })
            .eq('id', id);

        alert("Post updated");
        router.push('/');
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl mb-4">Edit Post</h1>

            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 mb-3 w-full"
                placeholder="Title"
            />

            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="border p-2 mb-3 w-full"
                placeholder="Content"
            />

            <button
                onClick={handleUpdate}
                className="bg-blue-500 text-white px-4 py-2"
            >
                Update
            </button>
        </div>
    );
}