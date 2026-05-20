'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import {
  Camera,
  Play,
  Tv,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Eye,
  Plus,
  X,
  ChevronRight,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Handle = 'noireuniform' | 'yeah.ok.e'
type Platform = 'instagram' | 'tiktok' | 'youtube'

interface Post {
  id: string
  caption: string
  likes: number
  comments: number
  reach: number
  saves: number
  timeAgo: string
  views?: number
}

interface QueueItem {
  id: string
  label: string
  note: string
}

interface PlatformData {
  stats: { label: string; value: string }[]
  posts: Post[]
  queue: QueueItem[]
  active: boolean
}

interface HandleData {
  handle: string
  badge: string
  platforms: Record<Platform, PlatformData>
}

// ─── Data ────────────────────────────────────────────────────────────────────

const DATA: Record<Handle, HandleData> = {
  noireuniform: {
    handle: '@noireuniform',
    badge: 'BRAND',
    platforms: {
      instagram: {
        active: true,
        stats: [
          { label: 'Followers', value: '2,847' },
          { label: 'Engagement', value: '4.2%' },
          { label: 'Reach / wk', value: '18,400' },
        ],
        posts: [
          {
            id: 'ni1',
            caption: 'The uniform drop is here 🖤',
            likes: 347,
            comments: 28,
            reach: 4200,
            saves: 91,
            timeAgo: '3 days ago',
          },
          {
            id: 'ni2',
            caption: 'Built different. Dressed different.',
            likes: 289,
            comments: 19,
            reach: 3100,
            saves: 64,
            timeAgo: '1 week ago',
          },
          {
            id: 'ni3',
            caption: 'Noire SS26 collection preview',
            likes: 512,
            comments: 44,
            reach: 7800,
            saves: 183,
            timeAgo: '2 weeks ago',
          },
        ],
        queue: [
          { id: 'niq1', label: 'New drop teaser', note: 'Schedule for Friday 7pm' },
          { id: 'niq2', label: 'Behind the scenes', note: 'Production floor footage' },
        ],
      },
      tiktok: {
        active: true,
        stats: [
          { label: 'Followers', value: '1,204' },
          { label: 'Total Likes', value: '8,920' },
          { label: 'Videos', value: '31' },
        ],
        posts: [
          {
            id: 'nt1',
            caption: 'How I built Noire on $90',
            likes: 892,
            comments: 114,
            reach: 14200,
            saves: 340,
            timeAgo: '8 days ago',
            views: 14200,
          },
          {
            id: 'nt2',
            caption: 'The uniform speaks',
            likes: 521,
            comments: 67,
            reach: 6800,
            saves: 198,
            timeAgo: '2 weeks ago',
            views: 6800,
          },
        ],
        queue: [
          { id: 'ntq1', label: 'Packing orders ASMR', note: 'Raw, no music' },
          { id: 'ntq2', label: 'Try-on haul SS26', note: 'All colorways' },
        ],
      },
      youtube: {
        active: true,
        stats: [
          { label: 'Subscribers', value: '312' },
          { label: 'Videos', value: '8' },
          { label: 'Total Views', value: '4,200+' },
        ],
        posts: [
          {
            id: 'ny1',
            caption: 'Noire — The Story So Far',
            likes: 88,
            comments: 17,
            reach: 1400,
            saves: 0,
            timeAgo: '1 month ago',
            views: 1400,
          },
          {
            id: 'ny2',
            caption: 'Building a brand from scratch',
            likes: 61,
            comments: 9,
            reach: 980,
            saves: 0,
            timeAgo: '2 months ago',
            views: 980,
          },
        ],
        queue: [
          { id: 'nyq1', label: 'SS26 Full Collection Walk-Through', note: 'Film after drop' },
          { id: 'nyq2', label: 'Year in review — Noire 2025', note: 'Legacy archive' },
        ],
      },
    },
  },
  'yeah.ok.e': {
    handle: '@yeah.ok.e',
    badge: 'PERSONAL',
    platforms: {
      instagram: {
        active: true,
        stats: [
          { label: 'Followers', value: '892' },
          { label: 'Engagement', value: '6.1%' },
          { label: 'Reach / wk', value: '4,200' },
        ],
        posts: [
          {
            id: 'pi1',
            caption: 'The pressure era, documented.',
            likes: 201,
            comments: 31,
            reach: 1800,
            saves: 54,
            timeAgo: '5 days ago',
          },
          {
            id: 'pi2',
            caption: 'Building in silence.',
            likes: 178,
            comments: 22,
            reach: 1400,
            saves: 47,
            timeAgo: '1 week ago',
          },
          {
            id: 'pi3',
            caption: 'Everything is in motion.',
            likes: 144,
            comments: 16,
            reach: 1100,
            saves: 33,
            timeAgo: '2 weeks ago',
          },
        ],
        queue: [
          { id: 'piq1', label: 'Thread: why I moved different', note: 'Caption-heavy drop' },
          { id: 'piq2', label: 'Voice memo drop', note: 'No filter, raw thoughts' },
        ],
      },
      tiktok: {
        active: true,
        stats: [
          { label: 'Followers', value: '447' },
          { label: 'Total Likes', value: '2,100' },
          { label: 'Videos', value: '12' },
        ],
        posts: [
          {
            id: 'pt1',
            caption: 'What the pressure era taught me',
            likes: 312,
            comments: 58,
            reach: 3200,
            saves: 94,
            timeAgo: '4 days ago',
            views: 3200,
          },
        ],
        queue: [
          { id: 'ptq1', label: 'Day in the life — builder mode', note: 'Raw and real' },
          { id: 'ptq2', label: 'The lesson I learned the hard way', note: 'No filter' },
        ],
      },
      youtube: {
        active: false,
        stats: [
          { label: 'Status', value: 'Not active' },
          { label: 'Subscribers', value: '—' },
          { label: 'Videos', value: '—' },
        ],
        posts: [],
        queue: [
          { id: 'pyq1', label: 'First upload: The Pressure Era', note: 'When ready' },
        ],
      },
    },
  },
}

const PLATFORM_TABS: { id: Platform; label: string; Icon: React.ElementType }[] = [
  { id: 'instagram', label: 'Instagram', Icon: Camera },
  { id: 'tiktok', label: 'TikTok', Icon: Play },
  { id: 'youtube', label: 'YouTube', Icon: Tv },
]

const HASHTAGS = ['#noireuniform', '#blackowned', '#uniformculture', '#ss26']

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 min-w-0 bg-[#080808] border border-[#1c1c1c] rounded-xl px-3 py-3 flex flex-col gap-1">
      <p className="text-[9px] uppercase tracking-widest text-text-muted truncate">{label}</p>
      <p className="text-lg font-light text-text-primary leading-none">{value}</p>
    </div>
  )
}

function PostRow({
  post,
  platform,
  onTap,
}: {
  post: Post
  platform: Platform
  onTap: (post: Post) => void
}) {
  const showViews = platform === 'tiktok' || platform === 'youtube'

  return (
    <button
      onClick={() => onTap(post)}
      className="w-full text-left flex items-start gap-3 py-3 border-b border-[#1c1c1c] last:border-0 hover:bg-white/[0.02] transition-colors active:bg-white/[0.04] rounded-sm"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary leading-snug truncate">{post.caption}</p>
        <div className="flex items-center gap-3 mt-1.5">
          {showViews && post.views !== undefined ? (
            <span className="flex items-center gap-1 text-[10px] text-text-muted">
              <Eye size={10} />
              {post.views.toLocaleString()}
            </span>
          ) : null}
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <Heart size={10} />
            {post.likes.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <MessageCircle size={10} />
            {post.comments}
          </span>
          <span className="text-[10px] text-text-muted ml-auto">{post.timeAgo}</span>
        </div>
      </div>
      <ChevronRight size={14} className="text-text-muted mt-0.5 flex-shrink-0" />
    </button>
  )
}

function QueueRow({ item }: { item: QueueItem }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#1c1c1c] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary leading-snug">{item.label}</p>
        <p className="text-[10px] text-text-muted mt-0.5">{item.note}</p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button className="text-[9px] uppercase tracking-wider text-accent border border-accent/30 rounded-md px-2 py-1 hover:bg-accent/10 transition-colors">
          Schedule
        </button>
        <button className="text-[9px] uppercase tracking-wider text-text-muted border border-[#1c1c1c] rounded-md px-2 py-1 hover:bg-white/[0.04] transition-colors">
          Draft
        </button>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SocialPage() {
  const [activeHandle, setActiveHandle] = useState<Handle>('noireuniform')
  const [activeTab, setActiveTab] = useState<Platform>('instagram')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const handleData = DATA[activeHandle]
  const platformData = handleData.platforms[activeTab]

  return (
    <div className="min-h-dvh bg-[#020202] pb-32">
      {/* ── Header ── */}
      <div className="px-5 pt-14 pb-4">
        <p className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-0.5">Legacy OS</p>
        <h1 className="text-2xl font-light text-text-primary tracking-tight">SOCIAL</h1>
        <p className="text-[11px] text-text-muted mt-0.5 uppercase tracking-widest">Content & Reach</p>
      </div>

      {/* ── Handle Switcher ── */}
      <div className="px-5 mb-5">
        <div className="inline-flex items-center bg-[#080808] border border-[#1c1c1c] rounded-full p-0.5">
          {(Object.keys(DATA) as Handle[]).map((handle) => {
            const d = DATA[handle]
            const isActive = activeHandle === handle
            return (
              <button
                key={handle}
                onClick={() => {
                  setActiveHandle(handle)
                  setSelectedPost(null)
                }}
                className={clsx(
                  'relative px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all duration-200',
                  isActive
                    ? 'text-[#020202] bg-[#d4af7a]'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                <span className="mr-1 text-[9px] uppercase tracking-widest opacity-70">
                  {d.badge}
                </span>
                {d.handle}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Platform Tabs ── */}
      <div className="px-5 mb-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {PLATFORM_TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id)
                  setSelectedPost(null)
                }}
                className={clsx(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200 border',
                  isActive
                    ? 'border-[#d4af7a]/50 text-[#d4af7a] bg-[#d4af7a]/10'
                    : 'border-[#1c1c1c] text-text-muted hover:text-text-secondary hover:border-[#2a2a2a]'
                )}
              >
                <Icon size={12} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeHandle}-${activeTab}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="px-5 space-y-5"
        >
          {/* ── Stats Row ── */}
          <div className="flex gap-2">
            {platformData.stats.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} />
            ))}
          </div>

          {/* ── Not active state ── */}
          {!platformData.active && (
            <div className="bg-[#080808] border border-[#1c1c1c] rounded-2xl px-5 py-8 text-center">
              <p className="text-text-muted text-sm">Not active on this platform yet.</p>
              <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">Channel queued for launch</p>
            </div>
          )}

          {/* ── Recent Content ── */}
          {platformData.active && platformData.posts.length > 0 && (
            <div className="bg-[#080808] border border-[#1c1c1c] rounded-2xl overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-text-muted">Recent Content</p>
                <TrendingUp size={12} className="text-text-muted" />
              </div>
              <div className="px-4 pb-2">
                {platformData.posts.map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    platform={activeTab}
                    onTap={setSelectedPost}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Hashtags (Instagram + noireuniform only) ── */}
          {activeHandle === 'noireuniform' && activeTab === 'instagram' && (
            <div className="bg-[#080808] border border-[#1c1c1c] rounded-2xl px-4 py-4">
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Top Hashtags</p>
              <div className="flex flex-wrap gap-2">
                {HASHTAGS.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] text-[#d4af7a] bg-[#d4af7a]/10 border border-[#d4af7a]/20 rounded-full px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Content Queue ── */}
          <div className="bg-[#080808] border border-[#1c1c1c] rounded-2xl overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-text-muted">Content Queue</p>
              <button className="flex items-center gap-1 text-[9px] text-accent uppercase tracking-wider hover:opacity-80 transition-opacity">
                <Plus size={10} />
                Add
              </button>
            </div>
            <div className="px-4 pb-2">
              {platformData.queue.map((item) => (
                <QueueRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Post Now FAB ── */}
      <div className="fixed bottom-20 right-5 z-40">
        <button className="flex items-center gap-2 bg-[#d4af7a] text-[#020202] text-[11px] font-semibold uppercase tracking-wider rounded-full px-5 py-3 shadow-lg shadow-[#d4af7a]/20 hover:bg-[#c9a466] transition-colors active:scale-95 transform">
          <Plus size={14} />
          Post Now
        </button>
      </div>

      {/* ── Post Detail Bottom-Sheet ── */}
      <AnimatePresence>
        {selectedPost && (
          <div
            className="fixed inset-0 z-50 flex items-end"
            onClick={() => setSelectedPost(null)}
          >
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full bg-[#080808] border-t border-[#1c1c1c] rounded-t-2xl max-h-[80vh] overflow-y-auto"
            >
              {/* Sheet header */}
              <div className="sticky top-0 bg-[#080808] border-b border-[#1c1c1c] px-5 pt-5 pb-4 z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[9px] uppercase tracking-widest text-text-muted mb-1">
                      Post Detail — {handleData.handle}
                    </p>
                    <p className="text-base font-light text-text-primary leading-snug">
                      {selectedPost.caption}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-text-muted hover:text-text-primary p-1 transition-colors flex-shrink-0 mt-0.5"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-text-muted mt-1.5">{selectedPost.timeAgo}</p>
              </div>

              {/* Sheet body */}
              <div className="px-5 py-5 space-y-5">
                {/* Engagement metrics */}
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-text-muted mb-3">Engagement</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#020202] border border-[#1c1c1c] rounded-xl p-3 flex items-center gap-2">
                      <Heart size={14} className="text-[#d4af7a]" />
                      <div>
                        <p className="text-[9px] text-text-muted uppercase tracking-wider">Likes</p>
                        <p className="text-base font-light text-text-primary">{selectedPost.likes.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-[#020202] border border-[#1c1c1c] rounded-xl p-3 flex items-center gap-2">
                      <MessageCircle size={14} className="text-[#d4af7a]" />
                      <div>
                        <p className="text-[9px] text-text-muted uppercase tracking-wider">Comments</p>
                        <p className="text-base font-light text-text-primary">{selectedPost.comments.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-[#020202] border border-[#1c1c1c] rounded-xl p-3 flex items-center gap-2">
                      <Eye size={14} className="text-[#d4af7a]" />
                      <div>
                        <p className="text-[9px] text-text-muted uppercase tracking-wider">Reach</p>
                        <p className="text-base font-light text-text-primary">{selectedPost.reach.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-[#020202] border border-[#1c1c1c] rounded-xl p-3 flex items-center gap-2">
                      <Users size={14} className="text-[#d4af7a]" />
                      <div>
                        <p className="text-[9px] text-text-muted uppercase tracking-wider">Saves</p>
                        <p className="text-base font-light text-text-primary">{selectedPost.saves.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Link placeholder */}
                <div className="bg-[#020202] border border-[#1c1c1c] rounded-xl p-3">
                  <p className="text-[9px] uppercase tracking-widest text-text-muted mb-1">Post Link</p>
                  <p className="text-xs text-text-muted italic">
                    {activeHandle === 'noireuniform'
                      ? 'instagram.com/noireuniform/p/...'
                      : 'instagram.com/yeah.ok.e/p/...'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
