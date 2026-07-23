"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationButtonsProps {
  totalCount: number;
  pageSize?: number;
  itemLabel?: string;
  pageSizeOptions?: number[];
  disabled?: boolean;
}

export function PaginationButtons({
  totalCount,
  pageSize = 10,
  itemLabel = "Transacciones",
  pageSizeOptions = [10, 20, 50, 100],
  disabled = false,
}: PaginationButtonsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Read current limit and page from URL searchParams
  const paramLimit = Number(searchParams.get("limit"));
  const currentLimit = paramLimit && !isNaN(paramLimit) && paramLimit > 0 ? paramLimit : pageSize;
  const paramPage = Number(searchParams.get("page"));
  const rawPage = paramPage && !isNaN(paramPage) && paramPage > 0 ? paramPage : 1;

  const totalPages = Math.max(1, Math.ceil(totalCount / currentLimit));
  const currentPage = Math.min(rawPage, totalPages);

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * currentLimit + 1;
  const endItem = Math.min(currentPage * currentLimit, totalCount);

  const isPaginationDisabled = disabled || totalCount <= 0;
  const isNavDisabled = isPaginationDisabled || totalPages <= 1;

  const setPage = (page: number) => {
    if (isNavDisabled || page === currentPage || page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const setLimit = (newLimitStr: string) => {
    const newLimit = Number(newLimitStr);
    if (isNaN(newLimit) || newLimit === currentLimit) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Helper to generate page buttons array
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-3 py-3 w-full border-t border-muted/30 select-none">
      {/* Left side: Rows per page + Range counter */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">Filas</span>
        <Select
          value={String(currentLimit)}
          onValueChange={setLimit}
          disabled={isPaginationDisabled}
        >
          <SelectTrigger className="h-8 w-[72px] text-xs bg-background border-muted/80 shadow-xs focus:ring-1 focus:ring-amber-500/30">
            <SelectValue placeholder={String(currentLimit)} />
          </SelectTrigger>
          <SelectContent align="start">
            {pageSizeOptions.map((opt) => (
              <SelectItem key={opt} value={String(opt)} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="font-normal text-muted-foreground ml-1">
          {startItem} - {endItem} de {totalCount} {itemLabel}
        </span>
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center gap-1.5 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none rounded-md"
          disabled={isNavDisabled || currentPage <= 1}
          onClick={() => setPage(currentPage - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers.map((p, idx) => {
          const isCurrent = p === currentPage;
          const isEllipsis = idx > 0 && p - pageNumbers[idx - 1] > 1;

          return (
            <div key={p} className="flex items-center gap-1.5">
              {isEllipsis && (
                <span className="px-1 text-xs text-muted-foreground/60 select-none">...</span>
              )}
              <button
                type="button"
                disabled={isNavDisabled || isCurrent}
                onClick={() => setPage(p)}
                className={
                  isCurrent
                    ? "bg-[#fde6d2] text-[#c2410c] dark:bg-amber-950/70 dark:text-amber-300 font-semibold h-8 min-w-[32px] px-2.5 rounded-md text-xs border border-amber-200/80 dark:border-amber-800/60 shadow-xs flex items-center justify-center cursor-default transition-all"
                    : "h-8 min-w-[32px] px-2.5 rounded-md text-xs font-normal text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer"
                }
              >
                {p}
              </button>
            </div>
          );
        })}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none rounded-md"
          disabled={isNavDisabled || currentPage >= totalPages}
          onClick={() => setPage(currentPage + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
