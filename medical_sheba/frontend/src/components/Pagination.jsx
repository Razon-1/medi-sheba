import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
  if (totalPages <= 1) return null;

  const handleFirstPage = () => onPageChange(1);
  const handlePrevPage = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1));
  const handleLastPage = () => onPageChange(totalPages);
  const handlePageClick = (page) => onPageChange(page);

  // Generate page numbers to display (show current page and neighbors)
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Info Section */}
      <div className="flex items-center gap-4 text-sm text-gray-700">
        <p>
          Page <span className="font-bold text-gray-900">{currentPage}</span> of{' '}
          <span className="font-bold text-gray-900">{totalPages}</span>
        </p>
        {totalItems && (
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-gray-300">
            <span>Total:</span>
            <span className="font-bold text-gray-900">{totalItems}</span>
            <span>items</span>
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="flex items-center gap-1">
        {/* First Page Button */}
        <button
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          className="btn btn-sm px-2.5 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50"
          title="First page"
        >
          <ChevronsLeft size={18} />
        </button>

        {/* Previous Page Button */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="btn btn-sm px-2.5 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50"
          title="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-2">
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                page === currentPage
                  ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-primary-400 hover:text-primary-600'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Page Button */}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="btn btn-sm px-2.5 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50"
          title="Next page"
        >
          <ChevronRight size={18} />
        </button>

        {/* Last Page Button */}
        <button
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
          className="btn btn-sm px-2.5 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50"
          title="Last page"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
}
