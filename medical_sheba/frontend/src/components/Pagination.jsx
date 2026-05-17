import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import '../styles/components/Pagination.css';

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
    <div className="pagination-container">
      <div className="pagination-info">
        <p>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></p>
        {totalItems && <p className="items-info">Total: <strong>{totalItems}</strong> items</p>}
      </div>

      <div className="pagination-controls">
        <button
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          className="pagination-btn first-page"
          title="First page"
        >
          <ChevronsLeft size={18} />
        </button>

        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="pagination-btn prev-page"
          title="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="page-numbers">
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`page-number ${page === currentPage ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="pagination-btn next-page"
          title="Next page"
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
          className="pagination-btn last-page"
          title="Last page"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
}
