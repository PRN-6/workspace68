import {
  Menu,
  MoreVertical,
  Star,
  Share2,
  Inbox,
  Folder,
  Plus,
  PenTool,
  Home,
  Search,
  Heart,
  Settings,
  Smartphone,
  Monitor,
  MousePointer2,
  Hand,
  Play,
  Undo2,
  Redo2,
  Trash2,
  Maximize2,
  SlidersHorizontal,
} from 'lucide-react'

export default function M3PhonePreview() {
  return (
    <div className="relative flex flex-col items-center justify-center py-4 select-none">
      {/* Top Floating Toolbar Pill Cluster (From reference images) */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {/* Pointer / Hand segment */}
        <div className="flex items-center gap-0.5 rounded-full border border-ink-700 bg-ink-900/90 p-1 shadow-sm backdrop-blur">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-crimson-600 text-white shadow-sm">
            <MousePointer2 size={14} />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-ink-800 hover:text-white">
            <Hand size={14} />
          </div>
        </div>

        {/* Add / Play segment */}
        <div className="hidden sm:flex items-center gap-0.5 rounded-full border border-ink-700 bg-ink-900/90 p-1 shadow-sm backdrop-blur">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-ink-800 hover:text-white">
            <Plus size={14} />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-ink-800 hover:text-white">
            <Play size={14} />
          </div>
        </div>

        {/* Undo / Redo / Trash segment */}
        <div className="flex items-center gap-0.5 rounded-full border border-ink-700 bg-ink-900/90 p-1 shadow-sm backdrop-blur">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-ink-800 hover:text-white">
            <Undo2 size={14} />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-ink-800 hover:text-white">
            <Redo2 size={14} />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-ink-800 hover:text-white">
            <Trash2 size={14} />
          </div>
        </div>
      </div>

      {/* Screen Mode Indicator Pill */}
      <div className="mb-3 flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur">
        <div className="flex items-center gap-1 rounded-lg bg-crimson-600 px-1.5 py-0.5 text-white">
          <Smartphone size={12} />
        </div>
        <div className="flex items-center gap-1 text-zinc-500">
          <Monitor size={12} />
        </div>
        <span className="ml-1 font-medium text-zinc-200">Home Screen</span>
      </div>

      {/* Smartphone Frame (Material 3 Expressive) */}
      <div className="relative w-[310px] sm:w-[335px] aspect-[9/18.6] rounded-[46px] border-[9px] border-[#1c1b1f] bg-[#0f0e13] shadow-[0_25px_60px_-15px_rgba(225,29,51,0.3)] overflow-hidden flex flex-col text-zinc-200">
        {/* Dynamic Island / Speaker Pill */}
        <div className="mx-auto mt-2 h-3.5 w-24 rounded-full bg-[#1C1B1F] shrink-0 z-20" />

        {/* Inner App Bar */}
        <div className="flex items-center justify-between px-4 pt-2 pb-2 text-white">
          <Menu size={18} className="cursor-pointer text-zinc-400" />
          <span className="font-display text-sm font-bold tracking-tight">Workspace68</span>
          <MoreVertical size={18} className="cursor-pointer text-zinc-400" />
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 px-4 pt-1">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-crimson-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-crimson-500 active:scale-95"
          >
            <Star size={12} className="fill-white" />
            <span>Favorite</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-ink-800 active:scale-95"
          >
            <Share2 size={12} />
            <span>Share</span>
          </button>
        </div>

        {/* Component List Cards */}
        <div className="mt-3.5 px-4 space-y-2">
          {/* Item 1 */}
          <div className="flex items-center justify-between rounded-2xl bg-ink-900 p-2.5 border border-ink-800 shadow-sm transition hover:bg-ink-850">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-crimson-600/15 text-crimson-400">
                <Inbox size={15} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">Components</p>
                <p className="truncate text-[10px] text-zinc-400">Material 3 Expressive blocks</p>
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-500">›</span>
          </div>

          {/* Item 2 */}
          <div className="flex items-center justify-between rounded-2xl bg-ink-900 p-2.5 border border-ink-800 shadow-sm transition hover:bg-ink-850">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-crimson-600/15 text-crimson-400">
                <Star size={15} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">Real React Code</p>
                <p className="truncate text-[10px] text-zinc-400">Export clean, owner-ready code</p>
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-500">›</span>
          </div>

          {/* Item 3 */}
          <div className="flex items-center justify-between rounded-2xl bg-ink-900 p-2.5 border border-ink-800 shadow-sm transition hover:bg-ink-850">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-crimson-600/15 text-crimson-400">
                <Folder size={15} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">Projects</p>
                <p className="truncate text-[10px] text-zinc-400">Local-first with cloud backup</p>
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-500">›</span>
          </div>

          {/* Active component badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-crimson-600 bg-crimson-600/15 px-3 py-1 text-xs font-semibold text-crimson-400 mt-2">
            <Plus size={11} />
            <span>Interactive Button</span>
          </div>
        </div>

        {/* Floating Action Button (FAB) */}
        <div className="mt-auto px-4 pb-3 flex justify-end">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-crimson-600 text-white shadow-md transition hover:scale-105 active:scale-95 cursor-pointer">
            <PenTool size={16} />
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="border-t border-ink-800 bg-ink-900/90 px-2 py-1.5 flex items-center justify-around shrink-0">
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex h-6 w-11 items-center justify-center rounded-full bg-crimson-600 text-white">
              <Home size={13} />
            </div>
            <span className="text-[9px] font-bold text-crimson-400">Home</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-zinc-400 opacity-75">
            <Search size={14} />
            <span className="text-[9px] font-medium">Search</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-zinc-400 opacity-75">
            <Heart size={14} />
            <span className="text-[9px] font-medium">Saved</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-zinc-400 opacity-75">
            <Settings size={14} />
            <span className="text-[9px] font-medium">Settings</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Pills (From reference images) */}
      <div className="mt-4 flex w-full max-w-[340px] items-center justify-between px-2">
        {/* Tidy Pill */}
        <div className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/90 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
          <SlidersHorizontal size={12} className="text-crimson-500" />
          <span>Tidy</span>
        </div>

        {/* Zoom controls pill */}
        <div className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/90 px-2.5 py-1 text-xs font-medium text-zinc-400 shadow-sm backdrop-blur">
          <span>—</span>
          <span className="font-semibold text-white">67%</span>
          <span>+</span>
          <Maximize2 size={11} className="text-zinc-500" />
        </div>
      </div>
    </div>
  )
}
