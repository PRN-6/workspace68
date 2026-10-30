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
  Sparkles,
} from 'lucide-react'

export default function M3PhonePreview() {
  return (
    <div className="relative flex flex-col items-center justify-center py-4 select-none">
      {/* Top Floating Toolbar Pill Cluster (From reference images) */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {/* Pointer / Hand segment */}
        <div className="flex items-center gap-0.5 rounded-full border border-[#E7E0EC] bg-white/90 p-1 shadow-sm backdrop-blur">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6750A4] text-white shadow-sm">
            <MousePointer2 size={14} />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-[#49454F] transition hover:bg-[#F3EDF7]">
            <Hand size={14} />
          </div>
        </div>

        {/* Add / Play segment */}
        <div className="hidden sm:flex items-center gap-0.5 rounded-full border border-[#E7E0EC] bg-white/90 p-1 shadow-sm backdrop-blur">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-[#49454F] transition hover:bg-[#F3EDF7]">
            <Plus size={14} />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-[#49454F] transition hover:bg-[#F3EDF7]">
            <Play size={14} />
          </div>
        </div>

        {/* Undo / Redo / Trash segment */}
        <div className="flex items-center gap-0.5 rounded-full border border-[#E7E0EC] bg-white/90 p-1 shadow-sm backdrop-blur">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-[#49454F] transition hover:bg-[#F3EDF7]">
            <Undo2 size={14} />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-[#49454F] transition hover:bg-[#F3EDF7]">
            <Redo2 size={14} />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-[#49454F] transition hover:bg-[#F3EDF7]">
            <Trash2 size={14} />
          </div>
        </div>
      </div>

      {/* Screen Mode Indicator Pill */}
      <div className="mb-3 flex items-center gap-2 rounded-full border border-[#E7E0EC] bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#1D1B20] shadow-sm backdrop-blur">
        <div className="flex items-center gap-1 rounded-lg bg-[#6750A4] px-1.5 py-0.5 text-white">
          <Smartphone size={12} />
        </div>
        <div className="flex items-center gap-1 text-[#79747E]">
          <Monitor size={12} />
        </div>
        <span className="ml-1 font-medium text-[#1D1B20]">Home Screen</span>
      </div>

      {/* Smartphone Frame (Material 3 Expressive) */}
      <div className="relative w-[310px] sm:w-[335px] aspect-[9/18.6] rounded-[46px] border-[9px] border-[#2B2930] bg-[#FEF7FF] shadow-[0_25px_60px_-15px_rgba(103,80,164,0.35)] overflow-hidden flex flex-col">
        {/* Dynamic Island / Speaker Pill */}
        <div className="mx-auto mt-2 h-3.5 w-24 rounded-full bg-[#1C1B1F] shrink-0 z-20" />

        {/* Inner App Bar */}
        <div className="flex items-center justify-between px-4 pt-2 pb-2 text-[#1D1B20]">
          <Menu size={18} className="cursor-pointer text-[#49454F]" />
          <span className="font-display text-sm font-bold tracking-tight">Workspace68</span>
          <MoreVertical size={18} className="cursor-pointer text-[#49454F]" />
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 px-4 pt-1">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-[#6750A4] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5B449A] active:scale-95"
          >
            <Star size={12} className="fill-white" />
            <span>Favorite</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-[#EDE7F6] px-3.5 py-1.5 text-xs font-semibold text-[#49454F] transition hover:bg-[#E2D9EE] active:scale-95"
          >
            <Share2 size={12} />
            <span>Share</span>
          </button>
        </div>

        {/* Component List Cards */}
        <div className="mt-3.5 px-4 space-y-2">
          {/* Item 1 */}
          <div className="flex items-center justify-between rounded-2xl bg-[#F7F2FA] p-2.5 border border-[#E7E0EC]/70 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition hover:bg-[#F3EDF7]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EADDFF] text-[#6750A4]">
                <Inbox size={15} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#1D1B20]">Components</p>
                <p className="truncate text-[10px] text-[#79747E]">Material 3 Expressive blocks</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#79747E]">›</span>
          </div>

          {/* Item 2 */}
          <div className="flex items-center justify-between rounded-2xl bg-[#F7F2FA] p-2.5 border border-[#E7E0EC]/70 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition hover:bg-[#F3EDF7]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EADDFF] text-[#6750A4]">
                <Star size={15} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#1D1B20]">Real React Code</p>
                <p className="truncate text-[10px] text-[#79747E]">Export clean, owner-ready code</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#79747E]">›</span>
          </div>

          {/* Item 3 */}
          <div className="flex items-center justify-between rounded-2xl bg-[#F7F2FA] p-2.5 border border-[#E7E0EC]/70 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition hover:bg-[#F3EDF7]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EADDFF] text-[#6750A4]">
                <Folder size={15} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#1D1B20]">Projects</p>
                <p className="truncate text-[10px] text-[#79747E]">Local-first with cloud backup</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#79747E]">›</span>
          </div>

          {/* Active component badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#6750A4] bg-[#6750A4]/10 px-3 py-1 text-xs font-semibold text-[#6750A4] mt-2">
            <Plus size={11} />
            <span>Interactive Button</span>
          </div>
        </div>

        {/* Floating Action Button (FAB) */}
        <div className="mt-auto px-4 pb-3 flex justify-end">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EADDFF] text-[#21005D] shadow-md transition hover:scale-105 active:scale-95 cursor-pointer">
            <PenTool size={16} />
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="border-t border-[#E7E0EC] bg-[#F3EDF7] px-2 py-1.5 flex items-center justify-around shrink-0">
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex h-6 w-11 items-center justify-center rounded-full bg-[#EADDFF] text-[#21005D]">
              <Home size={13} />
            </div>
            <span className="text-[9px] font-bold text-[#21005D]">Home</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-[#49454F] opacity-75">
            <Search size={14} />
            <span className="text-[9px] font-medium">Search</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-[#49454F] opacity-75">
            <Heart size={14} />
            <span className="text-[9px] font-medium">Saved</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-[#49454F] opacity-75">
            <Settings size={14} />
            <span className="text-[9px] font-medium">Settings</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Pills (From reference images) */}
      <div className="mt-4 flex w-full max-w-[340px] items-center justify-between px-2">
        {/* Ask an AI Pill */}
        <div className="flex items-center gap-2 rounded-full border border-[#E7E0EC] bg-white/95 px-3 py-1 text-xs font-semibold text-[#1D1B20] shadow-sm backdrop-blur">
          <Sparkles size={12} className="text-[#6750A4]" />
          <span>Ask an AI</span>
          <span className="rounded-full bg-[#FFD8E4] px-1.5 py-0.2 text-[9px] font-bold text-[#31111D]">
            BETA
          </span>
        </div>

        {/* Zoom controls pill */}
        <div className="flex items-center gap-2 rounded-full border border-[#E7E0EC] bg-white/95 px-2.5 py-1 text-xs font-medium text-[#49454F] shadow-sm backdrop-blur">
          <span>—</span>
          <span className="font-semibold text-[#1D1B20]">67%</span>
          <span>+</span>
          <Maximize2 size={11} className="text-[#79747E]" />
        </div>
      </div>
    </div>
  )
}
