'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [image, setImage] = useState<File | null>(null);
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

        // 🔐 Get user role
        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (userData.role !== 'author' && userData.role !== 'admin') {
            alert("Access denied");
            setLoading(false);
            return;
        }

        try {
            // 🖼️ Upload Image
            let imageUrl = null;

            if (image) {
                // ✅ Clean filename (fix 400 error)
                const cleanName = image.name
                    .replace(/\s+/g, '-')
                    .replace(/[()]/g, '');

                const fileName = `${Date.now()}-${cleanName}`;

                const { error } = await supabase.storage
                    .from('blog-images')
                    .upload(fileName, image, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (error) {
                    console.error(error);
                    alert(error.message);
                    setLoading(false);
                    return;
                }

                const { data } = supabase.storage
                    .from('blog-images')
                    .getPublicUrl(fileName);

                imageUrl = data.publicUrl;
            }

            // 🤖 Generate AI summary
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
                image_url: imageUrl,
            });

            if (error) throw error;

            alert("Post created successfully ✅");

            // 🔄 Reset form
            setTitle('');
            setBody('');
            setImage(null);

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

            {/* 🖼️ Image Upload */}
            <input
                type="file"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
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