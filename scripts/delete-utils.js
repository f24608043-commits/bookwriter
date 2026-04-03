// Delete utilities for BookWriter

// Delete book with confirmation
async function deleteBook(bookId, bookTitle) {
  const confirmed = await showDeleteConfirmation(
    'Delete Book',
    `Are you sure you want to delete "${bookTitle}"? This will permanently delete the book and all its chapters, comments, and related data.`
  );
  
  if (!confirmed) return;
  
  try {
    showLoading(true);
    
    const response = await api.delete(`/books/${bookId}`);
    
    if (response.message) {
      showToast('Book deleted successfully', 'success');
      
      // Invalidate all relevant queries
      if (window.queryClient) {
        window.queryClient.invalidateQueries({ queryKey: ['books'] });
        window.queryClient.invalidateQueries({ queryKey: ['my-works'] });
        window.queryClient.invalidateQueries({ queryKey: ['books', 'trending'] });
        window.queryClient.invalidateQueries({ queryKey: ['books', 'browse'] });
      }
      
      // Redirect if on book detail page
      if (window.location.pathname.includes(`/books/${bookId}`)) {
        window.location.href = '/my-works';
      }
    }
  } catch (error) {
    showToast(error.message || 'Failed to delete book', 'error');
  } finally {
    showLoading(false);
  }
}

// Delete chapter with confirmation
async function deleteChapter(chapterId, chapterTitle, bookId) {
  const confirmed = await showDeleteConfirmation(
    'Delete Chapter',
    `Are you sure you want to delete "${chapterTitle}"? This action cannot be undone.`
  );
  
  if (!confirmed) return;
  
  try {
    showLoading(true);
    
    const response = await api.delete(`/chapters/${chapterId}`);
    
    if (response.message) {
      showToast('Chapter deleted successfully', 'success');
      
      // Invalidate relevant queries
      if (window.queryClient) {
        window.queryClient.invalidateQueries({ queryKey: ['chapters', bookId] });
        window.queryClient.invalidateQueries({ queryKey: ['book', bookId] });
        window.queryClient.invalidateQueries({ queryKey: ['my-works'] });
      }
      
      // Redirect if on chapter page
      if (window.location.pathname.includes(`/chapters/${chapterId}`)) {
        window.location.href = `/books/${bookId}`;
      }
    }
  } catch (error) {
    showToast(error.message || 'Failed to delete chapter', 'error');
  } finally {
    showLoading(false);
  }
}

// Show delete confirmation dialog
function showDeleteConfirmation(title, message) {
  return new Promise((resolve) => {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md mx-4">
        <div class="flex items-center mb-4">
          <div class="bg-red-100 rounded-full p-2 mr-3">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
        </div>
        <p class="text-gray-600 mb-6">${message}</p>
        <div class="flex justify-end space-x-3">
          <button id="cancel-btn" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">
            Cancel
          </button>
          <button id="confirm-btn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
            Delete
          </button>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Focus confirm button for keyboard navigation
    const confirmBtn = modal.querySelector('#confirm-btn');
    const cancelBtn = modal.querySelector('#cancel-btn');
    confirmBtn.focus();
    
    // Event listeners
    const cleanup = () => {
      document.body.removeChild(modal);
      document.removeEventListener('keydown', handleKeydown);
    };
    
    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };
    
    const handleCancel = () => {
      cleanup();
      resolve(false);
    };
    
    const handleKeydown = (e) => {
      if (e.key === 'Escape') handleCancel();
      if (e.key === 'Enter' && document.activeElement === confirmBtn) handleConfirm();
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    document.addEventListener('keydown', handleKeydown);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) handleCancel();
    });
  });
}

// Show/hide loading state
function showLoading(show) {
  const existingLoader = document.getElementById('global-loader');
  
  if (show) {
    if (!existingLoader) {
      const loader = document.createElement('div');
      loader.id = 'global-loader';
      loader.className = 'fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50';
      loader.innerHTML = `
        <div class="bg-white rounded-lg p-4 flex items-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-3"></div>
          <span class="text-gray-700">Deleting...</span>
        </div>
      `;
      document.body.appendChild(loader);
    }
  } else {
    if (existingLoader) {
      existingLoader.remove();
    }
  }
}

// Make functions globally available
window.deleteBook = deleteBook;
window.deleteChapter = deleteChapter;
window.showDeleteConfirmation = showDeleteConfirmation;
window.showLoading = showLoading;
