'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [role, setRole] = useState('');
  const [user, setUser] = useState<any>(null);

  const PAGE_SIZE = 5;

  const fetchPosts = async () => {
    let request = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (query) {
      request = request.ilike('title', `%${query}%`);
    }

    const { data } = await request;
    setPosts(data || []);
  };

  // 🔐 Get user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  // 📄 Fetch posts
  useEffect(() => {
    fetchPosts();
  }, [query, page]);

  // 🔐 Get role
  useEffect(() => {
    const getRole = async () => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;

      if (!userId) return;

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      setRole(data?.role);
    };

    getRole();
  }, []);

  // 🚪 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="p-10">

      {/* 🔐 Auth UI */}
      <div className="flex justify-end gap-3 mb-4">
        {user ? (
          <>
            <span className="text-sm">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/auth/login" className="bg-blue-500 text-white px-3 py-1">
              Login
            </a>
            <a href="/auth/signup" className="bg-green-500 text-white px-3 py-1">
              Signup
            </a>
          </>
        )}
      </div>

      <h1 className="text-2xl mb-4">All Posts</h1>

      {/* ✍️ Create Post */}
      {(role === 'author' || role === 'admin') && (
        <a
          href="/create-post"
          className="bg-blue-500 text-white px-4 py-2 mb-4 inline-block"
        >
          + Create Post
        </a>
      )}

      {/* 🔍 Search */}
      <input
        placeholder="Search posts..."
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
        className="border p-2 mb-4 w-full"
      />

      {/* 📄 Posts */}
      {posts.map((post) => (
        <div key={post.id} className="border p-4 mb-4">

          <h2 className="text-lg font-bold">{post.title}</h2>

          {/* 🖼️ Image */}
          {post.image_url && (
            <img
              src={post.image_url}
              alt="post"
              className="w-full h-48 object-cover mt-2"
            />
          )}

          <p className="text-gray-500 mt-2">{post.summary}</p>

          {/* ✏️ Edit Button */}
          {(role === 'admin' || post.author_id === user?.id) && (
            <a
              href={`/edit-post/${post.id}`}
              className="bg-yellow-500 text-white px-2 py-1 mt-2 inline-block"
            >
              Edit
            </a>
          )}

          <CommentSection postId={post.id} />
        </div>
      ))}

      {/* 📄 Pagination */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          className="bg-gray-300 px-3 py-1"
        >
          Prev
        </button>

        <button
          onClick={() => setPage((p) => p + 1)}
          className="bg-gray-300 px-3 py-1"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    setComments(data || []);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const addComment = async () => {
    const { data: session } = await supabase.auth.getSession();

    if (!session.session) {
      alert("Login required");
      return;
    }

    if (!text) return;

    await supabase.from('comments').insert({
      post_id: postId,
      user_id: session.session.user.id,
      comment_text: text,
    });

    setText('');
    fetchComments();
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold">Comments</h3>

      <div className="flex gap-2 mt-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="border p-1 flex-1"
        />
        <button
          onClick={addComment}
          className="bg-green-500 text-white px-2"
        >
          Post
        </button>
      </div>

      <div className="mt-2">
        {comments.map((c) => (
          <div key={c.id} className="text-sm border-b py-1">
            {c.comment_text}
          </div>
        ))}
      </div>
    </div>
  );
}