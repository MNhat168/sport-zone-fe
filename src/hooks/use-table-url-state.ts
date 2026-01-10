import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'

type UseTableUrlStateParams = {
  pagination?: {
    pageKey?: string
    pageSizeKey?: string
    defaultPage?: number
    defaultPageSize?: number
  }
  sorting?: {
    sortByKey?: string
    sortOrderKey?: string
    defaultSortBy?: string
    defaultSortOrder?: 'asc' | 'desc'
  }
  globalFilter?: {
    enabled?: boolean
    key?: string
    trim?: boolean
  }
  columnFilters?: Array<{
    columnId: string
    searchKey: string
    type?: 'string' | 'array'
  }>
}

type UseTableUrlStateReturn = {
  // Global filter
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>
  // Column filters
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  // Pagination
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  // Sorting
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  // Helpers
  ensurePageInRange: (pageCount: number) => void
  // Raw URL params for API calls
  getApiParams: () => {
    page: number
    limit: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    search?: string
  }
}

// Helper to safely parse number from URL param
const getNumberParam = (
  params: URLSearchParams,
  key: string,
  defaultValue: number
): number => {
  const value = params.get(key)
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

export function useTableUrlState(
  params: UseTableUrlStateParams
): UseTableUrlStateReturn {
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    pagination: paginationCfg,
    sorting: sortingCfg,
    globalFilter: globalFilterCfg,
    columnFilters: columnFiltersCfg = [],
  } = params

  // Pagination config
  const pageKey = paginationCfg?.pageKey ?? 'page'
  const pageSizeKey = paginationCfg?.pageSizeKey ?? 'limit'
  const defaultPage = paginationCfg?.defaultPage ?? 1
  const defaultPageSize = paginationCfg?.defaultPageSize ?? 10

  // Sorting config
  const sortByKey = sortingCfg?.sortByKey ?? 'sortBy'
  const sortOrderKey = sortingCfg?.sortOrderKey ?? 'sortOrder'
  const defaultSortBy = sortingCfg?.defaultSortBy ?? 'createdAt'
  const defaultSortOrder = sortingCfg?.defaultSortOrder ?? 'desc'

  // Global filter config
  const globalFilterKey = globalFilterCfg?.key ?? 'search'
  const globalFilterEnabled = globalFilterCfg?.enabled ?? true
  const trimGlobal = globalFilterCfg?.trim ?? true

  // Read pagination from URL
  const pagination: PaginationState = useMemo(() => {
    const pageNum = getNumberParam(searchParams, pageKey, defaultPage)
    const pageSizeNum = getNumberParam(searchParams, pageSizeKey, defaultPageSize)
    return { pageIndex: Math.max(0, pageNum - 1), pageSize: pageSizeNum }
  }, [searchParams, pageKey, pageSizeKey, defaultPage, defaultPageSize])

  // Read sorting from URL
  const sorting: SortingState = useMemo(() => {
    const sortBy = searchParams.get(sortByKey) || defaultSortBy
    const sortOrder = searchParams.get(sortOrderKey) || defaultSortOrder
    return sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []
  }, [searchParams, sortByKey, sortOrderKey, defaultSortBy, defaultSortOrder])

  // Read column filters from URL
  const initialColumnFilters: ColumnFiltersState = useMemo(() => {
    const collected: ColumnFiltersState = []
    for (const cfg of columnFiltersCfg) {
      const raw = searchParams.get(cfg.searchKey)
      if (!raw) continue

      if (cfg.type === 'array') {
        const value = raw.split(',').filter(Boolean)
        if (value.length > 0) {
          collected.push({ id: cfg.columnId, value })
        }
      } else {
        if (raw.trim() !== '') {
          collected.push({ id: cfg.columnId, value: raw })
        }
      }
    }
    return collected
  }, [columnFiltersCfg, searchParams])

  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters)

  // Read global filter from URL
  const [globalFilter, setGlobalFilter] = useState<string | undefined>(() => {
    if (!globalFilterEnabled) return undefined
    const raw = searchParams.get(globalFilterKey)
    return raw ?? ''
  })

  // Update URL params helper
  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(updates)) {
          if (value === undefined || value === '') {
            newParams.delete(key)
          } else {
            newParams.set(key, value)
          }
        }
        return newParams
      })
    },
    [setSearchParams]
  )

  // Pagination change handler
  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      const next =
        typeof updater === 'function' ? updater(pagination) : updater
      const nextPage = next.pageIndex + 1
      const nextPageSize = next.pageSize

      updateSearchParams({
        [pageKey]: nextPage === defaultPage ? undefined : String(nextPage),
        [pageSizeKey]:
          nextPageSize === defaultPageSize ? undefined : String(nextPageSize),
      })
    },
    [pagination, pageKey, pageSizeKey, defaultPage, defaultPageSize, updateSearchParams]
  )

  // Sorting change handler
  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      const firstSort = next[0]

      if (!firstSort) {
        updateSearchParams({
          [sortByKey]: undefined,
          [sortOrderKey]: undefined,
          [pageKey]: undefined, // Reset to page 1 on sort change
        })
      } else {
        updateSearchParams({
          [sortByKey]:
            firstSort.id === defaultSortBy ? undefined : firstSort.id,
          [sortOrderKey]:
            firstSort.desc === (defaultSortOrder === 'desc')
              ? undefined
              : firstSort.desc
              ? 'desc'
              : 'asc',
          [pageKey]: undefined, // Reset to page 1 on sort change
        })
      }
    },
    [sorting, sortByKey, sortOrderKey, pageKey, defaultSortBy, defaultSortOrder, updateSearchParams]
  )

  // Global filter change handler
  const onGlobalFilterChange: OnChangeFn<string> | undefined =
    globalFilterEnabled
      ? (updater) => {
          const next =
            typeof updater === 'function'
              ? updater(globalFilter ?? '')
              : updater
          const value = trimGlobal ? next.trim() : next
          setGlobalFilter(value)
          updateSearchParams({
            [globalFilterKey]: value || undefined,
            [pageKey]: undefined, // Reset to page 1 on filter change
          })
        }
      : undefined

  // Column filters change handler
  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) => {
      const next =
        typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(next)

      const updates: Record<string, string | undefined> = {
        [pageKey]: undefined, // Reset to page 1 on filter change
      }

      for (const cfg of columnFiltersCfg) {
        const found = next.find((f) => f.id === cfg.columnId)
        if (cfg.type === 'array') {
          const value = Array.isArray(found?.value)
            ? (found!.value as string[])
            : []
          updates[cfg.searchKey] =
            value.length > 0 ? value.join(',') : undefined
        } else {
          const value =
            typeof found?.value === 'string' ? (found.value as string) : ''
          updates[cfg.searchKey] = value.trim() !== '' ? value : undefined
        }
      }

      updateSearchParams(updates)
    },
    [columnFilters, columnFiltersCfg, pageKey, updateSearchParams]
  )

  // Ensure page is in range
  const ensurePageInRange = useCallback(
    (pageCount: number) => {
      const currentPage = getNumberParam(searchParams, pageKey, defaultPage)
      if (pageCount > 0 && currentPage > pageCount) {
        updateSearchParams({ [pageKey]: undefined })
      }
    },
    [searchParams, pageKey, defaultPage, updateSearchParams]
  )

  // Get API params for data fetching
  const getApiParams = useCallback(() => {
    const page = getNumberParam(searchParams, pageKey, defaultPage)
    const limit = getNumberParam(searchParams, pageSizeKey, defaultPageSize)
    const sortBy = searchParams.get(sortByKey) || defaultSortBy
    const sortOrder = (searchParams.get(sortOrderKey) || defaultSortOrder) as
      | 'asc'
      | 'desc'
    const search = globalFilterEnabled
      ? searchParams.get(globalFilterKey) || undefined
      : undefined

    return { page, limit, sortBy, sortOrder, search }
  }, [
    searchParams,
    pageKey,
    pageSizeKey,
    sortByKey,
    sortOrderKey,
    globalFilterKey,
    defaultPage,
    defaultPageSize,
    defaultSortBy,
    defaultSortOrder,
    globalFilterEnabled,
  ])

  return {
    globalFilter: globalFilterEnabled ? (globalFilter ?? '') : undefined,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    ensurePageInRange,
    getApiParams,
  }
}
