"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // AUTH SESSION
  // ===============================
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        fetchBookmarks(data.session.user.id);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);

        if (session) {
          fetchBookmarks(session.user.id);
        } else {
          setBookmarks([]);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ===============================
  // FETCH BOOKMARKS
  // ===============================
  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      setBookmarks(data || []);
    } else {
      console.error(error);
    }
  };

  // ===============================
  // ADD BOOKMARK (INSTANT UPDATE)
  // ===============================
  const addBookmark = async () => {
    if (!session) return;

    if (!title.trim() || !url.trim()) {
      alert("Please enter both title and URL.");
      return;
    }

    let formattedUrl = url.trim();

    if (!formattedUrl.startsWith("http")) {
      formattedUrl = "https://" + formattedUrl;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("bookmarks")
      .insert([
        {
          user_id: session.user.id,
          title: title.trim(),
          url: formattedUrl,
        },
      ])
      .select()
      .single(); // 🔥 returns inserted row

    if (error) {
      console.error(error);
      alert("Failed to add bookmark.");
    } else if (data) {
      // 🔥 INSTANT UI UPDATE
      setBookmarks((prev) => [data, ...prev]);
      setTitle("");
      setUrl("");
    }

    setLoading(false);
  };

  // ===============================
  // DELETE BOOKMARK (INSTANT UPDATE)
  // ===============================
  const deleteBookmark = async (id: string) => {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Delete failed.");
    } else {
      // 🔥 INSTANT REMOVE FROM UI
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // ===============================
  // AUTH
  // ===============================
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // ===============================
  // LOGIN SCREEN
  // ===============================
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-3xl mb-6 font-bold">
            Smart Bookmark App 🚀
          </h1>
          <button
            onClick={signIn}
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // ===============================
  // MAIN APP
  // ===============================
  return (
    <div className="min-h-screen bg-black text-white p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        Smart Bookmark App 🚀
      </h1>

      <p className="text-gray-400 mb-2">
        Logged in as: {session.user.email}
      </p>

      <button
        onClick={signOut}
        className="text-red-400 mb-6 hover:text-red-300"
      >
        Logout
      </button>

      {/* ADD FORM */}
      <div className="mb-8 space-y-3">
        <input
          type="text"
          placeholder="Bookmark Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded bg-gray-800 text-white outline-none"
        />

        <input
          type="text"
          placeholder="Bookmark URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-3 rounded bg-gray-800 text-white outline-none"
        />

        <button
          onClick={addBookmark}
          disabled={loading}
          className="bg-green-500 px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Bookmark"}
        </button>
      </div>

      {/* BOOKMARK LIST */}
      <div className="space-y-4">
        {bookmarks.length === 0 && (
          <p className="text-gray-500">No bookmarks yet.</p>
        )}

        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="flex justify-between items-center bg-gray-900 p-4 rounded-lg"
          >
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {bookmark.title}
            </a>

            <button
              onClick={() => deleteBookmark(bookmark.id)}
              className="text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
