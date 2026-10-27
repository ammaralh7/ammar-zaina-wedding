'use client'

import { ChevronDown, Download, Filter, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export type StatusFilter = 'all' | 'coming' | 'notComing'

type Datatable1ToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  filter: StatusFilter
  onFilterChange: (value: StatusFilter) => void
  exportHref: string
  labels: { search: string; all: string; coming: string; notComing: string; exportCsv: string }
}

export function Datatable1Toolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  exportHref,
  labels,
}: Datatable1ToolbarProps) {
  const filterLabel = { all: labels.all, coming: labels.coming, notComing: labels.notComing }[filter]

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <InputGroup className="flex-1 max-w-sm">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          placeholder={labels.search}
          aria-label={labels.search}
          value={search}
          onChange={event => onSearchChange(event.target.value)}
        />
      </InputGroup>
      <div className="sm:ms-auto flex items-center gap-2 flex-wrap justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs cursor-pointer">
              <Filter data-icon="inline-start" />
              {filterLabel}
              <ChevronDown data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup value={filter} onValueChange={value => onFilterChange(value as StatusFilter)}>
                <DropdownMenuRadioItem value="all" className="cursor-pointer">{labels.all}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="coming" className="cursor-pointer">{labels.coming}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="notComing" className="cursor-pointer">{labels.notComing}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button asChild size="sm" className="h-8 px-3 text-xs cursor-pointer">
          <a href={exportHref} download>
            <Download data-icon="inline-start" />
            {labels.exportCsv}
          </a>
        </Button>
      </div>
    </div>
  )
}
