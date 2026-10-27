"use client";

// From the 21st.dev catalog (shadcnstore/datatable-1), wired to live RSVP data:
// working search, status filter, CSV export and delete.

import { useMemo, useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Datatable1Pagination } from "@/components/ui/datatable-1-utils/datatable-1-pagination";
import { Datatable1Toolbar, type StatusFilter } from "@/components/ui/datatable-1-utils/datatable-1-toolbar";

const ITEMS_PER_PAGE = 10;

const HEAD_CLASS =
  "p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider";

export type GuestRow = {
  id: string;
  name: string;
  attending: boolean;
  partySize: number;
  phone: string | null;
  message: string | null;
  createdAt: string;
};

export type Datatable1Labels = {
  search: string;
  all: string;
  coming: string;
  notComing: string;
  exportCsv: string;
  name: string;
  status: string;
  party: string;
  phone: string;
  message: string;
  replied: string;
  actions: string;
  delete: string;
  confirmDelete: string;
  duplicate: string;
  empty: string;
  showing: string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

export function Datatable1({
  rows,
  labels,
  locale,
  exportHref,
  onDelete,
}: {
  rows: GuestRow[];
  labels: Datatable1Labels;
  locale: string;
  exportHref: string;
  onDelete: (id: string) => Promise<void>;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [pending, startTransition] = useTransition();

  const duplicates = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const key = normalizeName(row.name);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [rows]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === "coming" && !row.attending) return false;
      if (filter === "notComing" && row.attending) return false;
      if (!query) return true;
      return [row.name, row.phone ?? "", row.message ?? ""].some((v) => v.toLowerCase().includes(query));
    });
  }, [rows, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const currentRows = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Cairo",
      }),
    [locale],
  );

  const handleDelete = (row: GuestRow) => {
    if (!window.confirm(fill(labels.confirmDelete, { name: row.name }))) return;
    startTransition(() => onDelete(row.id));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <Card className="pb-0 gap-0">
        <CardHeader className="border-b border-border gap-0">
          <Datatable1Toolbar
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            filter={filter}
            onFilterChange={(value) => {
              setFilter(value);
              setCurrentPage(1);
            }}
            exportHref={exportHref}
            labels={labels}
          />
        </CardHeader>
        <CardContent className="p-0" aria-busy={pending}>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className={HEAD_CLASS}>{labels.name}</TableHead>
                <TableHead className={HEAD_CLASS}>{labels.status}</TableHead>
                <TableHead className={HEAD_CLASS}>{labels.party}</TableHead>
                <TableHead className={HEAD_CLASS}>{labels.phone}</TableHead>
                <TableHead className={HEAD_CLASS}>{labels.message}</TableHead>
                <TableHead className={HEAD_CLASS}>{labels.replied}</TableHead>
                <TableHead className={HEAD_CLASS}>{labels.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-10 text-center text-muted-foreground">
                    {labels.empty}
                  </TableCell>
                </TableRow>
              ) : null}
              {currentRows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  <TableCell className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 bg-muted">
                        <AvatarFallback className="bg-primary/15 text-gold-deep font-semibold">
                          {getInitials(row.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">
                          {row.name}
                        </div>
                        {(duplicates.get(normalizeName(row.name)) ?? 0) > 1 ? (
                          <Badge variant="outline" className="mt-1 border-amber-300 bg-amber-50 text-amber-800">
                            {labels.duplicate}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-4">
                    {row.attending ? (
                      <Badge
                        variant="outline"
                        className="px-2.5 py-0.5 font-semibold bg-green-50 text-green-700 border-green-200"
                      >
                        {labels.coming}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="px-2.5 py-0.5 font-semibold bg-rose-50 text-rose-700 border-rose-200">
                        {labels.notComing}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="p-4 text-sm font-medium text-foreground tabular-nums">
                    {row.attending ? row.partySize : "-"}
                  </TableCell>
                  <TableCell className="p-4 text-sm text-muted-foreground" dir="ltr">
                    {row.phone || "-"}
                  </TableCell>
                  <TableCell className="p-4 text-sm text-muted-foreground max-w-xs whitespace-normal">
                    {row.message || "-"}
                  </TableCell>
                  <TableCell className="p-4 text-sm text-muted-foreground">
                    {dateFormat.format(new Date(row.createdAt))}
                  </TableCell>
                  <TableCell className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs cursor-pointer"
                        >
                          {labels.actions}
                          <ChevronDown data-icon="inline-end" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="text-destructive cursor-pointer py-2"
                            onSelect={() => handleDelete(row)}
                          >
                            {labels.delete}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Datatable1Pagination
            page={page}
            pageSize={ITEMS_PER_PAGE}
            total={filtered.length}
            onPageChange={setCurrentPage}
            summary={(from, to, total) => fill(labels.showing, { from, to, total })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default Datatable1;
