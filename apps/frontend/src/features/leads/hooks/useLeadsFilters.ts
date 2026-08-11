import { useState, useCallback } from 'react';
import { LeadStatus, LeadSource } from '@gigflow/shared';

export interface LeadsFilterState {
  search: string;
  debouncedSearch: string;
  status: LeadStatus | '';
  source: LeadSource | '';
  sort: 'latest' | 'score' | 'name';
  page: number;
}

export const useLeadsFilters = () => {
  const [filters, setFilters] = useState<LeadsFilterState>({
    search: '',
    debouncedSearch: '',
    status: '',
    source: '',
    sort: 'latest',
    page: 1,
  });

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setDebouncedSearch = useCallback((debouncedSearch: string) => {
    setFilters((prev) => ({ ...prev, debouncedSearch }));
  }, []);

  const setStatus = useCallback((status: LeadStatus | '') => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setSource = useCallback((source: LeadSource | '') => {
    setFilters((prev) => ({ ...prev, source, page: 1 }));
  }, []);

  const setSort = useCallback((sort: 'latest' | 'score' | 'name') => {
    setFilters((prev) => ({ ...prev, sort, page: 1 }));
  }, []);

  const setPage = useCallback((page: number | ((previousPage: number) => number)) => {
    setFilters((prev) => ({
      ...prev,
      page: typeof page === 'function' ? page(prev.page) : page,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      debouncedSearch: '',
      status: '',
      source: '',
      sort: 'latest',
      page: 1,
    });
  }, []);

  const hasFilters = Boolean(
    filters.search || filters.status || filters.source || filters.sort !== 'latest'
  );

  return {
    filters,
    setSearch,
    setDebouncedSearch,
    setStatus,
    setSource,
    setSort,
    setPage,
    clearFilters,
    hasFilters,
  };
};
