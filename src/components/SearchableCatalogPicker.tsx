import React, { useMemo, useState } from 'react';
import { JobCategory, WorkforceSegment } from '../types';
import {
  FUNCTIONAL_CATEGORIES_AZ,
  POSITION_CATALOG_AZ,
  PositionCatalogItem,
  inferWorkforceSegment,
} from '../lib/naukriFilters';
import { Search, ChevronDown, Check, ArrowDownAZ, X } from 'lucide-react';

interface SearchableCategoryPickerProps {
  value: JobCategory;
  onChange: (category: JobCategory) => void;
  id?: string;
}

const segmentPillClass = (seg: WorkforceSegment) => {
  if (seg === 'IT') return 'bg-sky-50 text-sky-800 border-sky-200';
  if (seg === 'Blue Collar') return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-emerald-50 text-emerald-800 border-emerald-200';
};

export const SearchableCategoryPicker: React.FC<SearchableCategoryPickerProps> = ({
  value,
  onChange,
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [segmentTab, setSegmentTab] = useState<'all' | WorkforceSegment>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FUNCTIONAL_CATEGORIES_AZ.filter((cat) => {
      const seg = inferWorkforceSegment(cat);
      if (segmentTab !== 'all' && seg !== segmentTab) return false;
      if (!q) return true;
      return cat.toLowerCase().includes(q);
    });
  }, [query, segmentTab]);

  return (
    <div className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 flex items-center justify-between gap-2 cursor-pointer hover:border-emerald-700 transition-colors text-left"
      >
        <span className="truncate font-medium">{value}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${segmentPillClass(
              inferWorkforceSegment(value)
            )}`}
          >
            {inferWorkforceSegment(value)}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2.5 border-b border-stone-100 space-y-2 bg-stone-50/70">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                <ArrowDownAZ className="w-3.5 h-3.5 text-emerald-700" />
                <span>Select Category (A–Z • {FUNCTIONAL_CATEGORIES_AZ.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Select or type your job category..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {(['all', 'IT', 'Non-IT', 'Blue Collar'] as const).map((seg) => (
                <button
                  key={seg}
                  type="button"
                  onClick={() => setSegmentTab(seg)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    segmentTab === seg
                      ? 'bg-emerald-800 text-white'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {seg === 'all' ? 'All' : seg}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-stone-100">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-500">
                No category matches &quot;{query}&quot;
              </div>
            ) : (
              filtered.map((cat) => {
                const seg = inferWorkforceSegment(cat);
                const selected = cat === value;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onChange(cat);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      selected ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <span className="truncate flex items-center gap-1.5">
                      {selected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                      <span className="truncate">{cat}</span>
                    </span>
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold shrink-0 ${segmentPillClass(seg)}`}>
                      {seg}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface SearchableTitlePickerProps {
  value: string;
  onSelectCatalogItem: (item: PositionCatalogItem) => void;
  onSelectCustomTitle: (customTitle: string) => void;
}

export const SearchableTitlePicker: React.FC<SearchableTitlePickerProps> = ({
  value,
  onSelectCatalogItem,
  onSelectCustomTitle,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POSITION_CATALOG_AZ;
    return POSITION_CATALOG_AZ.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.skills.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-stone-900 font-medium text-xs flex items-center justify-between gap-2 cursor-pointer hover:border-emerald-600 text-left"
      >
        <span className="truncate">
          {value ? `${value} (Click to browse A–Z)` : 'Try Data Entry Manager, AutoCAD Designer, Chef, Telecaller...'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-emerald-700 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2.5 border-b border-stone-100 bg-stone-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-700">
                Select Job Title (A–Z • {POSITION_CATALOG_AZ.length} Roles)
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try Data Entry Manager, Auto Driver, Staff Nurse..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-stone-100">
            {filtered.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  onSelectCatalogItem(item);
                  setOpen(false);
                  setQuery('');
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-emerald-50/50 flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-stone-900 truncate">{item.title}</div>
                  <div className="text-[10px] text-stone-500 truncate">{item.category}</div>
                </div>
                <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold shrink-0 ${segmentPillClass(item.segment)}`}>
                  {item.segment}
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                if (query.trim()) {
                  onSelectCustomTitle(query.trim());
                }
                setOpen(false);
              }}
              className="w-full px-3 py-2.5 text-left text-xs font-bold text-emerald-800 hover:bg-emerald-50 cursor-pointer bg-stone-50"
            >
              Not finding your job title? {query.trim() ? `Use "${query.trim()}"` : 'Enter custom title below →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
