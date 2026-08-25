'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FORUM_POSTS } from '@/lib/data';
import { MessageCircle, ThumbsUp, Plus, Search } from 'lucide-react';

const CATEGORIES = ['All', 'Crop Advice', 'Finance Tips', 'Pest & Disease', 'Success Story', 'Weather', 'Market'];

export default function ForumPage() {
  const { lang } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const filtered = FORUM_POSTS.filter(p => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const categoryColors: Record<string, string> = {
    'Crop Advice': 'bg-green-100 text-green-700',
    'Finance Tips': 'bg-blue-100 text-blue-700',
    'Pest & Disease': 'bg-red-100 text-red-700',
    'Success Story': 'bg-amber-100 text-amber-700',
    'Weather': 'bg-sky-100 text-sky-700',
    'Market': 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-3">🤝</div>
          <h1 className="text-3xl font-black mb-2">{t(lang, 'communityForum')}</h1>
          <p className="text-purple-200 text-lg">Farmers helping farmers. Share tips, ask questions, learn together.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Search + new post */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search discussions..." className="input-field pl-10 py-3" />
          </div>
          <button className="btn-primary py-3 px-5 flex items-center gap-2 text-sm">
            <Plus size={18} /> {t(lang, 'askQuestion')}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat ? 'bg-purple-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-400'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {filtered.map(post => (
            <div key={post.id} className="card p-6 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{post.title}</h3>
                    <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category] || 'bg-gray-100 text-gray-600'}`}>
                      {post.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className="font-medium text-gray-700">{post.author}</span>
                    <span>·</span>
                    <span>{post.time}</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${liked.has(post.id) ? 'text-[#1a5c2a]' : 'text-gray-400 hover:text-[#1a5c2a]'}`}>
                      <ThumbsUp size={16} className={liked.has(post.id) ? 'fill-[#1a5c2a]' : ''} />
                      {post.likes + (liked.has(post.id) ? 1 : 0)} {t(lang, 'likes')}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">
                      <MessageCircle size={16} />
                      {post.replies} {t(lang, 'replies')}
                    </button>
                    <button className="ml-auto text-sm font-semibold text-[#1a5c2a] hover:underline">Read More →</button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold">No posts found</p>
            </div>
          )}
        </div>

        {/* Share tip button */}
        <div className="mt-6 card p-5 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <p className="text-gray-700 font-semibold mb-3">Have a farming tip to share? Help fellow farmers!</p>
          <button className="btn-gold py-3 px-6 flex items-center gap-2 mx-auto">
            <Plus size={18} /> {t(lang, 'shareTip')}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
