'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

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

  useEffect(() => {
    fetchPosts();
  }, [query, page]);

  // 💬 Add Comment


  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">All Posts</h1>

      {/* 🔍 Search */}
      <input
        placeholder="Search posts..."
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0); // reset page on search
        }}
        className="border p-2 mb-4 w-full"
      />

      {/* 📄 Posts */}
      {posts.map((post) => (
        <div key={post.id} className="border p-4 mb-4">
          <h2 className="text-lg font-bold">{post.title}</h2>
          <p className="text-gray-500 mt-2">{post.summary}</p>

          {/* 💬 Comment Button */}
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

      {/* Input */}
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

      {/* Comments list */}
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