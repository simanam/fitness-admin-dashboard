// src/components/ui/pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  // Generate page numbers to display
  const generatePaginationItems = () => {
    // Always include first and last page
    const firstPage = 1;
    const lastPage = totalPages;

    // Calculate range around current page
    const leftSiblingIndex = Math.max(currentPage - siblingCount, firstPage);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage);

    // Should we show left dots
    const showLeftDots = leftSiblingIndex > firstPage + 1;
    // Should we show right dots
    const showRightDots = rightSiblingIndex < lastPage - 1;

    // Generate array of page numbers to display
    const items: (number | string)[] = [];

    // Always add first page
    items.push(firstPage);

    // Add left dots if needed
    if (showLeftDots) {
      items.push('...');
    }

    // Add page numbers around current page
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== firstPage && i !== lastPage) {
        items.push(i);
      }
    }

    // Add right dots if needed
    if (showRightDots) {
      items.push('...');
    }

    // Add last page if not the same as first page
    if (lastPage !== firstPage) {
      items.push(lastPage);
    }

    return items;
  };

  const paginationItems = generatePaginationItems();

  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn('flex items-center justify-center space-x-1', className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="inline-flex items-center rounded-md px-2 py-2 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {paginationItems.map((item, index) => {
        if (item === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-sm text-gray-500"
            >
              ...
            </span>
          );
        }

        const page = item as number;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'px-3 py-2 text-sm rounded-md',
              page === currentPage
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            )}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="inline-flex items-center rounded-md px-2 py-2 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export default Pagination;
