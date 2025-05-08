import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Return null if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Show at most 5 page numbers

    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first and last page
      // Show a window around the current page
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Somewhere in the middle
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center">
      <ul className="flex space-x-1">
        {/* Previous button */}
        <li>
          <button
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-md flex items-center ${
              currentPage === 1
                ? 'text-neutral-light cursor-not-allowed'
                : 'text-neutral-dark hover:bg-neutral-lightest'
            }`}
            aria-label="Previous page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </li>

        {/* Page numbers */}
        {pageNumbers.map((pageNumber, index) => (
          <li key={index}>
            {pageNumber === '...' ? (
              <span className="px-3 py-2 text-neutral-dark">...</span>
            ) : (
              <button
                onClick={() => onPageChange(pageNumber)}
                className={`px-3 py-2 rounded-md ${
                  currentPage === pageNumber
                    ? 'bg-primary text-white font-medium'
                    : 'text-neutral-dark hover:bg-neutral-lightest'
                }`}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            )}
          </li>
        ))}

        {/* Next button */}
        <li>
          <button
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-md flex items-center ${
              currentPage === totalPages
                ? 'text-neutral-light cursor-not-allowed'
                : 'text-neutral-dark hover:bg-neutral-lightest'
            }`}
            aria-label="Next page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;