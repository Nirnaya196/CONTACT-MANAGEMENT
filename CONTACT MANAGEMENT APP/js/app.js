/**
 * Nexus Contacts - Main Application Coordinator & Event Bindings
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Services
  const cm = new window.ContactManager().init();
  const ui = new window.UIManager(cm);
  const settings = window.StorageService.loadSettings();

  // Apply Initial Settings (Theme & View Mode)
  document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
  let currentViewMode = settings.viewMode || 'grid';

  // State sync function
  const renderAll = () => {
    const filtered = cm.getFilteredContacts();
    ui.renderContacts(filtered, currentViewMode);
    ui.renderSidebar();
  };

  // Subscribe UI updates to data changes
  cm.subscribe(() => {
    renderAll();
  });

  // Initial render
  renderAll();

  // ==========================================
  // Header Controls & Search
  // ==========================================
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (searchClearBtn) {
        searchClearBtn.style.display = val ? 'flex' : 'none';
      }
      cm.setFilters({ query: val });
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      cm.setFilters({ query: '' });
      searchInput.focus();
    });
  }

  // View Mode Switcher (Grid vs List)
  const btnViewGrid = document.getElementById('btn-view-grid');
  const btnViewList = document.getElementById('btn-view-list');

  const setViewMode = (mode) => {
    currentViewMode = mode;
    settings.viewMode = mode;
    window.StorageService.saveSettings(settings);

    if (btnViewGrid && btnViewList) {
      btnViewGrid.classList.toggle('active', mode === 'grid');
      btnViewList.classList.toggle('active', mode === 'list');
    }
    renderAll();
  };

  if (btnViewGrid) btnViewGrid.addEventListener('click', () => setViewMode('grid'));
  if (btnViewList) btnViewList.addEventListener('click', () => setViewMode('list'));

  // Initialize View Mode Buttons
  setViewMode(currentViewMode);

  // Theme Toggle (Dark / Light)
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    settings.theme = newTheme;
    window.StorageService.saveSettings(settings);
    ui.showToast(`Switched to ${newTheme} mode`);
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Sort Dropdown Selector
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.value = cm.sortBy;
    sortSelect.addEventListener('change', (e) => {
      cm.setFilters({ sortBy: e.target.value });
    });
  }

  // Add Contact Button
  const btnAddContact = document.getElementById('btn-add-contact');
  if (btnAddContact) {
    btnAddContact.addEventListener('click', () => {
      ui.openAddEditModal();
    });
  }

  // ==========================================
  // Sidebar Category & Tag Navigation
  // ==========================================
  const sidebarCategoryLinks = document.querySelectorAll('.sidebar-nav-item');
  sidebarCategoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      sidebarCategoryLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const category = link.dataset.category;
      if (category === 'favorites') {
        cm.setFilters({ category: 'all', favoriteOnly: true, tag: 'all' });
      } else {
        cm.setFilters({ category: category, favoriteOnly: false, tag: 'all' });
      }
    });
  });

  // Sidebar Tag Pills (Delegated)
  const sidebarTagsList = document.getElementById('sidebar-tags-list');
  if (sidebarTagsList) {
    sidebarTagsList.addEventListener('click', (e) => {
      const tagBtn = e.target.closest('.sidebar-tag-item');
      if (tagBtn) {
        const tag = tagBtn.dataset.tag;
        const isCurrent = cm.selectedTag.toLowerCase() === tag.toLowerCase();
        const nextTag = isCurrent ? 'all' : tag;
        cm.setFilters({ tag: nextTag });
      }
    });
  }

  // Mobile Sidebar Toggle
  const btnMobileMenu = document.getElementById('btn-mobile-menu');
  const sidebar = document.getElementById('app-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  const toggleMobileSidebar = (open) => {
    if (sidebar) sidebar.classList.toggle('mobile-open', open);
    if (sidebarOverlay) sidebarOverlay.classList.toggle('open', open);
  };

  if (btnMobileMenu) {
    btnMobileMenu.addEventListener('click', () => toggleMobileSidebar(true));
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => toggleMobileSidebar(false));
  }

  // ==========================================
  // Add / Edit Contact Form Submission
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const contactId = document.getElementById('contact-id-input').value;
      const formData = {
        firstName: document.getElementById('form-first-name').value,
        lastName: document.getElementById('form-last-name').value,
        phone: document.getElementById('form-phone').value,
        email: document.getElementById('form-email').value,
        company: document.getElementById('form-company').value,
        jobTitle: document.getElementById('form-job-title').value,
        category: document.getElementById('form-category').value,
        tags: document.getElementById('form-tags').value,
        isFavorite: document.getElementById('form-favorite').checked,
        address: document.getElementById('form-address').value,
        birthday: document.getElementById('form-birthday').value,
        notes: document.getElementById('form-notes').value,
        avatarColor: document.getElementById('form-avatar-color').value,
        avatarUrl: document.getElementById('form-avatar-url').value
      };

      if (!formData.firstName.trim() && !formData.lastName.trim() && !formData.phone.trim() && !formData.email.trim()) {
        ui.showToast('Please provide at least a name, phone, or email.');
        return;
      }

      if (contactId) {
        cm.updateContact(contactId, formData);
        ui.showToast('Contact updated successfully!');
      } else {
        cm.addContact(formData);
        ui.showToast('New contact added successfully! 🎉');
      }

      ui.closeModal();
    });
  }

  // Close Modals
  document.querySelectorAll('.btn-close-modal, .modal-backdrop').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el) {
        document.querySelectorAll('.modal-wrapper').forEach(m => m.classList.remove('active'));
      }
    });
  });

  // Drawer Close Button & Overlay
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');

  if (btnCloseDrawer) {
    btnCloseDrawer.addEventListener('click', () => ui.closeContactDrawer());
  }
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', () => ui.closeContactDrawer());
  }

  // ==========================================
  // Tools & Modals: Analytics, Duplicates, Shortcuts
  // ==========================================
  const btnShowAnalytics = document.getElementById('btn-show-analytics');
  if (btnShowAnalytics) {
    btnShowAnalytics.addEventListener('click', () => ui.showAnalyticsModal());
  }

  const btnFindDuplicates = document.getElementById('btn-find-duplicates');
  if (btnFindDuplicates) {
    btnFindDuplicates.addEventListener('click', () => ui.showDuplicatesModal());
  }

  const btnKeyboardHelp = document.getElementById('btn-keyboard-help');
  const shortcutsModal = document.getElementById('shortcuts-modal');
  if (btnKeyboardHelp && shortcutsModal) {
    btnKeyboardHelp.addEventListener('click', () => {
      shortcutsModal.classList.add('active');
    });
  }

  // Reset to Demo Data
  const btnResetDemo = document.getElementById('btn-reset-demo');
  if (btnResetDemo) {
    btnResetDemo.addEventListener('click', () => {
      if (confirm('Reset your contacts to the default sample dataset? Current custom contacts will be replaced.')) {
        cm.contacts = window.StorageService.resetToDemoData();
        cm.persist();
        ui.showToast('Demo sample contacts restored!');
      }
    });
  }

  // ==========================================
  // Import & Export Handlers
  // ==========================================
  const btnExportJson = document.getElementById('btn-export-json');
  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      window.StorageService.exportToJSON(cm.contacts);
      ui.showToast('Exported contacts to JSON file');
    });
  }

  const btnExportCsv = document.getElementById('btn-export-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      window.StorageService.exportToCSV(cm.contacts);
      ui.showToast('Exported contacts to CSV file');
    });
  }

  const btnExportVcfAll = document.getElementById('btn-export-vcf-all');
  if (btnExportVcfAll) {
    btnExportVcfAll.addEventListener('click', () => {
      window.StorageService.exportToVCF(cm.contacts);
      ui.showToast('Exported all contacts to vCard (.vcf)');
    });
  }

  const fileImportInput = document.getElementById('file-import-input');
  const btnTriggerImport = document.getElementById('btn-trigger-import');

  if (btnTriggerImport && fileImportInput) {
    btnTriggerImport.addEventListener('click', () => {
      fileImportInput.click();
    });

    fileImportInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          let imported = [];

          if (file.name.endsWith('.json')) {
            imported = window.StorageService.parseJSONImport(content);
          } else if (file.name.endsWith('.csv') || file.type === 'text/csv') {
            imported = window.StorageService.parseCSVImport(content);
          } else {
            throw new Error('Unsupported file format. Please choose a .json or .csv file.');
          }

          if (imported.length === 0) {
            throw new Error('No valid contact entries found in file.');
          }

          // Merge imported contacts
          imported.forEach(contact => {
            cm.addContact(contact);
          });

          ui.showToast(`Successfully imported ${imported.length} contacts!`);
        } catch (err) {
          ui.showToast(`Import Error: ${err.message}`, 5000);
        } finally {
          fileImportInput.value = '';
        }
      };

      reader.readAsText(file);
    });
  }

  // ==========================================
  // Global Keyboard Shortcuts
  // ==========================================
  document.addEventListener('keydown', (e) => {
    // If inside an active form input (except Escape)
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    // Escape -> Close drawer, modal, or blur search
    if (e.key === 'Escape') {
      ui.closeContactDrawer();
      document.querySelectorAll('.modal-wrapper').forEach(m => m.classList.remove('active'));
      if (document.activeElement === searchInput) {
        searchInput.blur();
      }
      return;
    }

    if (isTyping) return;

    // Ctrl/Cmd + K or Slash -> Focus Search
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' || e.key === '/') {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Ctrl/Cmd + N -> Add New Contact
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      ui.openAddEditModal();
    }

    // Ctrl/Cmd + D -> Toggle Dark/Light Theme
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      toggleTheme();
    }

    // Question Mark (?) -> Open Keyboard Shortcuts Cheat Sheet
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      if (shortcutsModal) shortcutsModal.classList.add('active');
    }
  });
});
