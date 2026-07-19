import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { X, ImagePlus, Loader2, Send } from 'lucide-react';

export default function CreatePostModal({ onClose }: { onClose: () => void }) {
  const { refreshProfile } = useAuth();
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!imageUrl.trim()) {
      setError('Please add an image URL.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('posts').insert({
      image_url: imageUrl.trim(),
      caption: caption.trim() || null,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    await refreshProfile();
    onClose();
    window.dispatchEvent(new Event('socialhub:post-created'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">Create post</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
            <div className="flex gap-2">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.pexels.com/…"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition"
              />
              <button
                onClick={() => setImageUrl(`https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=800`)}
                className="px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
                title="Use a sample image"
              >
                <ImagePlus className="w-5 h-5" />
              </button>
            </div>
          </div>
          {imageUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
              <img src={imageUrl} alt="preview" className="w-full max-h-72 object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="Write a caption…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition resize-none"
            />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold transition flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Posting…' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}
