'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

type Datatable1PaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  /** Template with {from}, {to} and {total} */
  summary: (from: number, to: number, total: number) => string
}

export function Datatable1Pagination({ page, pageSize, total, onPageChange, summary }: Datatable1PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col gap-3 p-4 border-t border-border sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        {summary(total === 0 ? 0 : (page - 1) * pageSize + 1, Math.min(page * pageSize, total), total)}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Go to previous page"
          className="size-9 cursor-pointer"
        >
          <ChevronLeft className="rtl:-scale-x-100" />
        </Button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
          <Button
            key={pageNumber}
            variant={page === pageNumber ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPageChange(pageNumber)}
            aria-label={`Go to page ${pageNumber}`}
            aria-current={page === pageNumber ? 'page' : undefined}
            className="size-9 cursor-pointer"
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Go to next page"
          className="size-9 cursor-pointer"
        >
          <ChevronRight className="rtl:-scale-x-100" />
        </Button>
      </div>
    </div>
  )
}
