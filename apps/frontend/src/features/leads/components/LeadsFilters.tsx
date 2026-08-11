import { LEAD_STATUS, LEAD_SOURCE, LeadStatus, LeadSource } from '@gigflow/shared';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

interface LeadsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: LeadStatus | '';
  onStatusChange: (value: LeadStatus | '') => void;
  source: LeadSource | '';
  onSourceChange: (value: LeadSource | '') => void;
  sort: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const LeadsFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  source,
  onSourceChange,
  sort,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: LeadsFiltersProps) => {
  return (
    <div className="rounded-3xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filter leads
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Search, sort, and narrow the pipeline without losing context.</p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className={cn('shrink-0', !hasActiveFilters && 'opacity-50')}
          disabled={!hasActiveFilters}
        >
          <X className="mr-1.5 h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads by name or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border bg-background/80 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as LeadStatus | '')}
            className="h-11 rounded-2xl border border-border bg-background/80 px-3 text-sm shadow-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          >
            <option value="">All Statuses</option>
            {Object.values(LEAD_STATUS).map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>

          <select
            value={source}
            onChange={(e) => onSourceChange(e.target.value as LeadSource | '')}
            className="h-11 rounded-2xl border border-border bg-background/80 px-3 text-sm shadow-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          >
            <option value="">All Sources</option>
            {Object.values(LEAD_SOURCE).map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-11 rounded-2xl border border-border bg-background/80 px-3 text-sm shadow-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
