/**
 * Nexus Contacts - UI Rendering, Modals, Drawer, QR Code & Toast Engine
 */

class UIManager {
  constructor(contactManager) {
    this.cm = contactManager;
    this.activeContactId = null;
    this.toastTimeout = null;
    this.undoTimeout = null;

    // Color palette options for custom avatar color picker
    this.palette = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
      '#f59e0b', '#10b981', '#14b8a6', '#0ea5e9'
    ];
  }

  /**
   * Helper: Generate initials from first and last name
   */
  getInitials(firstName, lastName) {
    const f = (firstName || '').trim().charAt(0).toUpperCase();
    const l = (lastName || '').trim().charAt(0).toUpperCase();
    return (f + l) || '?';
  }

  /**
   * Helper: Escape HTML to prevent XSS
   */
  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Helper: Format relative timestamp or date
   */
  formatDate(isoString) {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return isoString;
    }
  }

  /**
   * Helper: Calculate days until next birthday
   */
  getDaysUntilBirthday(bdayString) {
    if (!bdayString) return null;
    try {
      const today = new Date();
      const bday = new Date(bdayString);
      const nextBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());

      if (today > nextBday) {
        nextBday.setFullYear(today.getFullYear() + 1);
      }

      const diffTime = nextBday.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return null;
    }
  }

  /**
   * Render Main Contacts View (Grid or List)
   */
  renderContacts(contacts, viewMode = 'grid') {
    const container = document.getElementById('contacts-container');
    const emptyState = document.getElementById('empty-state');
    const contactCountEl = document.getElementById('contact-count-display');

    if (contactCountEl) {
      contactCountEl.textContent = `${contacts.length} contact${contacts.length === 1 ? '' : 's'}`;
    }

    if (!contacts || contacts.length === 0) {
      if (container) container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    if (viewMode === 'list') {
      container.className = 'contacts-list-view';
      container.innerHTML = `
        <div class="list-table-wrapper">
          <table class="contacts-table">
            <thead>
              <tr>
                <th style="width: 48px;"></th>
                <th>Name</th>
                <th>Contact Info</th>
                <th>Company & Title</th>
                <th>Category</th>
                <th>Tags</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${contacts.map(c => this.renderListRow(c)).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      container.className = 'contacts-grid-view';
      container.innerHTML = contacts.map(c => this.renderGridCard(c)).join('');
    }

    this.attachCardEventListeners();
  }

  /**
   * Render a single Grid Contact Card
   */
  renderGridCard(c) {
    const initials = this.getInitials(c.firstName, c.lastName);
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed Contact';
    const avatarBg = c.avatarColor || '#6366f1';
    const phoneClean = (c.phone || '').replace(/[^0-9+]/g, '');

    const tagsHtml = Array.isArray(c.tags) && c.tags.length > 0
      ? c.tags.slice(0, 3).map(t => `<span class="badge badge-tag">${this.escapeHTML(t)}</span>`).join('') +
        (c.tags.length > 3 ? `<span class="badge badge-more">+${c.tags.length - 3}</span>` : '')
      : '';

    return `
      <article class="contact-card glass-card" data-id="${c.id}">
        <div class="card-header">
          <div class="avatar" style="background: ${avatarBg};">
            ${c.avatarUrl ? `<img src="${this.escapeHTML(c.avatarUrl)}" alt="${this.escapeHTML(fullName)}" />` : initials}
          </div>
          <div class="card-title-group">
            <h3 class="contact-name" title="${this.escapeHTML(fullName)}">${this.escapeHTML(fullName)}</h3>
            ${c.jobTitle || c.company ? `
              <p class="contact-role" title="${this.escapeHTML(c.jobTitle ? `${c.jobTitle} at ${c.company}` : c.company)}">
                ${this.escapeHTML(c.jobTitle ? `${c.jobTitle}${c.company ? ` • ${c.company}` : ''}` : c.company)}
              </p>
            ` : '<p class="contact-role text-muted">No title specified</p>'}
          </div>
          <button class="btn-icon btn-favorite ${c.isFavorite ? 'active' : ''}" data-action="toggle-fav" title="${c.isFavorite ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Favorite">
            <svg class="icon" viewBox="0 0 24 24" fill="${c.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        </div>

        <div class="card-body">
          ${c.phone ? `
            <div class="contact-meta-item">
              <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <a href="tel:${phoneClean}" class="contact-link" onclick="event.stopPropagation()">${this.escapeHTML(c.phone)}</a>
            </div>
          ` : ''}

          ${c.email ? `
            <div class="contact-meta-item">
              <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <a href="mailto:${this.escapeHTML(c.email)}" class="contact-link" onclick="event.stopPropagation()" title="${this.escapeHTML(c.email)}">${this.escapeHTML(c.email)}</a>
            </div>
          ` : ''}

          <div class="card-badges">
            <span class="badge badge-category badge-${(c.category || 'personal').toLowerCase()}">${this.escapeHTML(c.category || 'Personal')}</span>
            ${tagsHtml}
          </div>
        </div>

        <div class="card-footer">
          <div class="quick-actions">
            ${c.phone ? `
              <a href="tel:${phoneClean}" class="btn-action-round" title="Call" aria-label="Call" onclick="event.stopPropagation()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </a>
              <a href="https://wa.me/${phoneClean.replace(/^\+/, '')}" target="_blank" rel="noopener noreferrer" class="btn-action-round btn-whatsapp" title="WhatsApp" aria-label="WhatsApp" onclick="event.stopPropagation()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
            ` : ''}
            ${c.email ? `
              <a href="mailto:${this.escapeHTML(c.email)}" class="btn-action-round" title="Email" aria-label="Email" onclick="event.stopPropagation()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </a>
            ` : ''}
          </div>
          <div class="card-more-actions">
            <button class="btn-icon" data-action="view-details" title="View Full Details" aria-label="View Details">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="btn-icon" data-action="edit" title="Edit Contact" aria-label="Edit Contact">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon btn-danger-hover" data-action="delete" title="Delete Contact" aria-label="Delete Contact">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Render a single List Table Row
   */
  renderListRow(c) {
    const initials = this.getInitials(c.firstName, c.lastName);
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed Contact';
    const avatarBg = c.avatarColor || '#6366f1';
    const phoneClean = (c.phone || '').replace(/[^0-9+]/g, '');

    return `
      <tr class="table-row" data-id="${c.id}">
        <td>
          <button class="btn-icon-sm btn-favorite ${c.isFavorite ? 'active' : ''}" data-action="toggle-fav" title="${c.isFavorite ? 'Starred' : 'Star'}" aria-label="Favorite">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="${c.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        </td>
        <td>
          <div class="row-user-info" data-action="view-details">
            <div class="avatar avatar-sm" style="background: ${avatarBg};">
              ${c.avatarUrl ? `<img src="${this.escapeHTML(c.avatarUrl)}" alt="" />` : initials}
            </div>
            <div>
              <div class="font-semibold">${this.escapeHTML(fullName)}</div>
              ${c.notes ? `<div class="text-xs text-muted truncate max-w-xs">${this.escapeHTML(c.notes)}</div>` : ''}
            </div>
          </div>
        </td>
        <td>
          <div class="row-contact-info">
            ${c.phone ? `<div><a href="tel:${phoneClean}" class="contact-link">${this.escapeHTML(c.phone)}</a></div>` : ''}
            ${c.email ? `<div><a href="mailto:${this.escapeHTML(c.email)}" class="contact-link text-muted">${this.escapeHTML(c.email)}</a></div>` : ''}
          </div>
        </td>
        <td>
          <div>${this.escapeHTML(c.company || '—')}</div>
          ${c.jobTitle ? `<div class="text-xs text-muted">${this.escapeHTML(c.jobTitle)}</div>` : ''}
        </td>
        <td>
          <span class="badge badge-category badge-${(c.category || 'personal').toLowerCase()}">${this.escapeHTML(c.category || 'Personal')}</span>
        </td>
        <td>
          <div class="flex-wrap-gap">
            ${Array.isArray(c.tags) ? c.tags.map(t => `<span class="badge badge-tag">${this.escapeHTML(t)}</span>`).join('') : '—'}
          </div>
        </td>
        <td class="text-right">
          <div class="row-actions">
            <button class="btn-icon-sm" data-action="view-details" title="View Details" aria-label="View Details">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="btn-icon-sm" data-action="edit" title="Edit" aria-label="Edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-icon-sm btn-danger-hover" data-action="delete" title="Delete" aria-label="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Attach interactive listeners to dynamically rendered cards/rows
   */
  attachCardEventListeners() {
    const container = document.getElementById('contacts-container');
    if (!container) return;

    // Delegated click handler
    container.onclick = (e) => {
      const target = e.target.closest('[data-action], .contact-card, .table-row');
      if (!target) return;

      const cardOrRow = e.target.closest('[data-id]');
      if (!cardOrRow) return;

      const contactId = cardOrRow.dataset.id;
      const actionBtn = e.target.closest('[data-action]');
      const action = actionBtn ? actionBtn.dataset.action : 'view-details';

      switch (action) {
        case 'toggle-fav':
          e.stopPropagation();
          const isFav = this.cm.toggleFavorite(contactId);
          this.showToast(isFav ? 'Added to favorites ⭐' : 'Removed from favorites');
          break;
        case 'edit':
          e.stopPropagation();
          this.openAddEditModal(contactId);
          break;
        case 'delete':
          e.stopPropagation();
          this.confirmDeleteContact(contactId);
          break;
        case 'view-details':
        default:
          this.openContactDrawer(contactId);
          break;
      }
    };
  }

  /**
   * Render Sidebar Categories and Tag lists with counts
   */
  renderSidebar() {
    const { counts, favoritesCount } = this.cm.getCategoryCounts();
    const allTags = this.cm.getAllTags();

    // Update Category Counters
    const updateCount = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    };

    updateCount('count-all', counts.all || 0);
    updateCount('count-fav', favoritesCount || 0);
    updateCount('count-work', counts.Work || 0);
    updateCount('count-personal', counts.Personal || 0);
    updateCount('count-family', counts.Family || 0);
    updateCount('count-friends', counts.Friends || 0);
    updateCount('count-vip', counts.VIP || 0);

    // Render Tag Filter Pills in Sidebar
    const tagListContainer = document.getElementById('sidebar-tags-list');
    if (tagListContainer) {
      if (allTags.length === 0) {
        tagListContainer.innerHTML = '<p class="text-xs text-muted" style="padding: 4px 12px;">No tags yet</p>';
      } else {
        tagListContainer.innerHTML = allTags.map(tag => `
          <button class="sidebar-tag-item ${this.cm.selectedTag.toLowerCase() === tag.toLowerCase() ? 'active' : ''}" data-tag="${this.escapeHTML(tag)}">
            <span class="tag-dot"></span>
            <span class="tag-name">${this.escapeHTML(tag)}</span>
          </button>
        `).join('');
      }
    }
  }

  /**
   * Open Contact Detail Drawer
   */
  openContactDrawer(contactId) {
    const contact = this.cm.getContactById(contactId);
    if (!contact) return;

    this.activeContactId = contactId;
    const drawer = document.getElementById('contact-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerContent = document.getElementById('drawer-body-content');

    if (!drawer || !drawerContent) return;

    const initials = this.getInitials(contact.firstName, contact.lastName);
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed Contact';
    const avatarBg = contact.avatarColor || '#6366f1';
    const phoneClean = (contact.phone || '').replace(/[^0-9+]/g, '');
    const daysUntilBday = this.getDaysUntilBirthday(contact.birthday);

    drawerContent.innerHTML = `
      <div class="drawer-hero">
        <div class="drawer-avatar" style="background: ${avatarBg};">
          ${contact.avatarUrl ? `<img src="${this.escapeHTML(contact.avatarUrl)}" alt="" />` : initials}
        </div>
        <div class="drawer-hero-info">
          <div class="flex-center-gap">
            <h2 class="drawer-name">${this.escapeHTML(fullName)}</h2>
            <button class="btn-icon btn-favorite ${contact.isFavorite ? 'active' : ''}" id="drawer-toggle-fav-btn" title="Toggle Favorite">
              <svg viewBox="0 0 24 24" fill="${contact.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          </div>
          ${contact.jobTitle || contact.company ? `
            <p class="drawer-subtitle">${this.escapeHTML(contact.jobTitle || '')} ${contact.jobTitle && contact.company ? 'at' : ''} <strong>${this.escapeHTML(contact.company || '')}</strong></p>
          ` : ''}
          <div class="drawer-badges">
            <span class="badge badge-category badge-${(contact.category || 'personal').toLowerCase()}">${this.escapeHTML(contact.category || 'Personal')}</span>
            ${Array.isArray(contact.tags) ? contact.tags.map(t => `<span class="badge badge-tag">${this.escapeHTML(t)}</span>`).join('') : ''}
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="drawer-actions-bar">
        ${contact.phone ? `
          <a href="tel:${phoneClean}" class="drawer-action-btn" title="Call">
            <div class="action-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <span>Call</span>
          </a>
          <a href="https://wa.me/${phoneClean.replace(/^\+/, '')}" target="_blank" rel="noopener noreferrer" class="drawer-action-btn" title="WhatsApp">
            <div class="action-icon-circle btn-whatsapp-bg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </div>
            <span>WhatsApp</span>
          </a>
        ` : ''}
        ${contact.email ? `
          <a href="mailto:${this.escapeHTML(contact.email)}" class="drawer-action-btn" title="Email">
            <div class="action-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <span>Email</span>
          </a>
        ` : ''}
        <button class="drawer-action-btn" id="drawer-qr-btn" title="Show QR Code">
          <div class="action-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </div>
          <span>vCard QR</span>
        </button>
        <button class="drawer-action-btn" id="drawer-vcf-export-btn" title="Download vCard">
          <div class="action-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </div>
          <span>Export .vcf</span>
        </button>
      </div>

      <!-- Contact Details Information List -->
      <div class="drawer-section">
        <h4 class="drawer-section-title">Contact Information</h4>
        <div class="drawer-info-grid">
          ${contact.phone ? `
            <div class="drawer-info-card">
              <div class="info-label">Phone Number</div>
              <div class="info-value-row">
                <a href="tel:${phoneClean}" class="info-value">${this.escapeHTML(contact.phone)}</a>
                <button class="btn-copy" data-copy="${this.escapeHTML(contact.phone)}" title="Copy Phone">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>
          ` : ''}

          ${contact.email ? `
            <div class="drawer-info-card">
              <div class="info-label">Email Address</div>
              <div class="info-value-row">
                <a href="mailto:${this.escapeHTML(contact.email)}" class="info-value">${this.escapeHTML(contact.email)}</a>
                <button class="btn-copy" data-copy="${this.escapeHTML(contact.email)}" title="Copy Email">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>
          ` : ''}

          ${contact.address ? `
            <div class="drawer-info-card">
              <div class="info-label">Physical Address</div>
              <div class="info-value-row">
                <span class="info-value">${this.escapeHTML(contact.address)}</span>
                <a href="https://maps.google.com/?q=${encodeURIComponent(contact.address)}" target="_blank" rel="noopener noreferrer" class="btn-copy" title="Open Map">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                </a>
              </div>
            </div>
          ` : ''}

          ${contact.birthday ? `
            <div class="drawer-info-card">
              <div class="info-label">Birthday</div>
              <div class="info-value-row">
                <span class="info-value">🎂 ${this.formatDate(contact.birthday)}</span>
                ${daysUntilBday !== null ? `<span class="badge badge-birthday">${daysUntilBday === 0 ? 'Today! 🎉' : `in ${daysUntilBday} days`}</span>` : ''}
              </div>
            </div>
          ` : ''}

          ${contact.notes ? `
            <div class="drawer-info-card full-width">
              <div class="info-label">Personal Notes</div>
              <p class="notes-text">${this.escapeHTML(contact.notes)}</p>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Activity & Interaction Log Section -->
      <div class="drawer-section">
        <div class="flex-between">
          <h4 class="drawer-section-title">Interaction & Activity History</h4>
          <span class="text-xs text-muted">${(contact.activityLog || []).length} logs</span>
        </div>

        <form id="drawer-add-activity-form" class="activity-form">
          <div class="activity-input-row">
            <select id="activity-type-select" class="form-select select-compact">
              <option value="note">📝 Note</option>
              <option value="call">📞 Call</option>
              <option value="meeting">🤝 Meeting</option>
              <option value="email">✉️ Email</option>
            </select>
            <input type="text" id="activity-text-input" class="form-input input-compact" placeholder="Log a call, meeting or note..." required />
            <button type="submit" class="btn btn-primary btn-sm">Add</button>
          </div>
        </form>

        <div class="timeline" id="drawer-timeline">
          ${this.renderTimeline(contact.activityLog || [])}
        </div>
      </div>

      <!-- Drawer Footer Controls -->
      <div class="drawer-footer-controls">
        <button class="btn btn-secondary" id="drawer-edit-btn">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Edit Contact
        </button>
        <button class="btn btn-danger-outline" id="drawer-delete-btn">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Delete
        </button>
      </div>
    `;

    drawer.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');

    // Attach drawer button handlers
    this.attachDrawerEvents(contact);
  }

  /**
   * Render Activity Timeline List
   */
  renderTimeline(activityLog) {
    if (!activityLog || activityLog.length === 0) {
      return '<div class="timeline-empty">No interaction history recorded yet.</div>';
    }

    const typeIcons = {
      note: '📝',
      call: '📞',
      meeting: '🤝',
      email: '✉️'
    };

    return activityLog.map(act => `
      <div class="timeline-item">
        <div class="timeline-icon">${typeIcons[act.type] || '📝'}</div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-type">${act.type.toUpperCase()}</span>
            <span class="timeline-time">${this.formatDate(act.timestamp)}</span>
            <button class="btn-timeline-del" data-act-id="${act.id}" title="Remove entry">×</button>
          </div>
          <p class="timeline-text">${this.escapeHTML(act.text)}</p>
        </div>
      </div>
    `).join('');
  }

  /**
   * Close Contact Drawer
   */
  closeContactDrawer() {
    const drawer = document.getElementById('contact-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    if (drawer) drawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('open');
    this.activeContactId = null;
  }

  /**
   * Attach Drawer event listeners
   */
  attachDrawerEvents(contact) {
    // Favorite toggle button inside drawer
    const favBtn = document.getElementById('drawer-toggle-fav-btn');
    if (favBtn) {
      favBtn.onclick = () => {
        const isFav = this.cm.toggleFavorite(contact.id);
        this.openContactDrawer(contact.id);
        this.showToast(isFav ? 'Added to favorites ⭐' : 'Removed from favorites');
      };
    }

    // QR Code modal trigger
    const qrBtn = document.getElementById('drawer-qr-btn');
    if (qrBtn) {
      qrBtn.onclick = () => this.showQRCodeModal(contact);
    }

    // Export single vCard button
    const vcfBtn = document.getElementById('drawer-vcf-export-btn');
    if (vcfBtn) {
      vcfBtn.onclick = () => {
        window.StorageService.exportToVCF(contact);
        this.showToast('Downloaded contact as vCard (.vcf)');
      };
    }

    // Copy info buttons
    document.querySelectorAll('.btn-copy').forEach(btn => {
      btn.onclick = () => {
        const text = btn.dataset.copy;
        if (text) {
          navigator.clipboard.writeText(text);
          this.showToast('Copied to clipboard!');
        }
      };
    });

    // Add activity log submission
    const activityForm = document.getElementById('drawer-add-activity-form');
    if (activityForm) {
      activityForm.onsubmit = (e) => {
        e.preventDefault();
        const typeSelect = document.getElementById('activity-type-select');
        const textInput = document.getElementById('activity-text-input');
        if (textInput && textInput.value.trim()) {
          this.cm.addActivity(contact.id, typeSelect.value, textInput.value.trim());
          this.openContactDrawer(contact.id);
          this.showToast('Activity log recorded!');
        }
      };
    }

    // Delete activity log handler
    const timelineEl = document.getElementById('drawer-timeline');
    if (timelineEl) {
      timelineEl.onclick = (e) => {
        const delBtn = e.target.closest('.btn-timeline-del');
        if (delBtn) {
          const actId = delBtn.dataset.actId;
          this.cm.deleteActivity(contact.id, actId);
          this.openContactDrawer(contact.id);
        }
      };
    }

    // Edit button in drawer
    const editBtn = document.getElementById('drawer-edit-btn');
    if (editBtn) {
      editBtn.onclick = () => {
        this.closeContactDrawer();
        this.openAddEditModal(contact.id);
      };
    }

    // Delete button in drawer
    const deleteBtn = document.getElementById('drawer-delete-btn');
    if (deleteBtn) {
      deleteBtn.onclick = () => {
        this.closeContactDrawer();
        this.confirmDeleteContact(contact.id);
      };
    }
  }

  /**
   * Open Add or Edit Contact Modal
   */
  openAddEditModal(contactId = null) {
    const modal = document.getElementById('contact-modal');
    const form = document.getElementById('contact-form');
    const modalTitle = document.getElementById('modal-title');
    const avatarColorContainer = document.getElementById('avatar-color-picker');

    if (!modal || !form) return;

    form.reset();
    document.getElementById('contact-id-input').value = contactId || '';

    let activeColor = this.palette[0];

    if (contactId) {
      const contact = this.cm.getContactById(contactId);
      if (contact) {
        modalTitle.textContent = 'Edit Contact';
        document.getElementById('form-first-name').value = contact.firstName || '';
        document.getElementById('form-last-name').value = contact.lastName || '';
        document.getElementById('form-phone').value = contact.phone || '';
        document.getElementById('form-email').value = contact.email || '';
        document.getElementById('form-company').value = contact.company || '';
        document.getElementById('form-job-title').value = contact.jobTitle || '';
        document.getElementById('form-category').value = contact.category || 'Personal';
        document.getElementById('form-tags').value = Array.isArray(contact.tags) ? contact.tags.join(', ') : '';
        document.getElementById('form-favorite').checked = Boolean(contact.isFavorite);
        document.getElementById('form-address').value = contact.address || '';
        document.getElementById('form-birthday').value = contact.birthday || '';
        document.getElementById('form-notes').value = contact.notes || '';
        document.getElementById('form-avatar-url').value = contact.avatarUrl || '';
        activeColor = contact.avatarColor || this.palette[0];
      }
    } else {
      modalTitle.textContent = 'Add New Contact';
      activeColor = this.palette[Math.floor(Math.random() * this.palette.length)];
    }

    document.getElementById('form-avatar-color').value = activeColor;

    // Render color swatches
    if (avatarColorContainer) {
      avatarColorContainer.innerHTML = this.palette.map(color => `
        <button type="button" class="color-swatch ${color === activeColor ? 'selected' : ''}" style="background: ${color};" data-color="${color}"></button>
      `).join('');

      avatarColorContainer.onclick = (e) => {
        const swatch = e.target.closest('.color-swatch');
        if (swatch) {
          document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
          swatch.classList.add('selected');
          document.getElementById('form-avatar-color').value = swatch.dataset.color;
        }
      };
    }

    modal.classList.add('active');
    document.getElementById('form-first-name').focus();
  }

  /**
   * Close Add/Edit Contact Modal
   */
  closeModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) modal.classList.remove('active');
  }

  /**
   * Show Confirmation Dialog for deletion
   */
  confirmDeleteContact(contactId) {
    const contact = this.cm.getContactById(contactId);
    if (!contact) return;

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'this contact';
    const deleted = this.cm.deleteContact(contactId);

    if (deleted) {
      this.showUndoToast(`Deleted "${fullName}"`, () => {
        this.cm.restoreLastDeleted();
        this.showToast(`Restored "${fullName}"`);
      });
    }
  }

  /**
   * Show QR Code Modal for Contact vCard sharing
   */
  showQRCodeModal(contact) {
    const modal = document.getElementById('qr-modal');
    const container = document.getElementById('qr-code-svg-container');
    const qrName = document.getElementById('qr-contact-name');

    if (!modal || !container) return;

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Contact Card';
    if (qrName) qrName.textContent = fullName;

    // Construct vCard string
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${fullName}`,
      contact.phone ? `TEL:${contact.phone}` : '',
      contact.email ? `EMAIL:${contact.email}` : '',
      contact.company ? `ORG:${contact.company}` : '',
      contact.jobTitle ? `TITLE:${contact.jobTitle}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\n');

    // Generate lightweight standalone QR code via Google Chart API fallback or SVG generator
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(vCardData)}&bgcolor=1e1b4b&color=ffffff&margin=10`;

    container.innerHTML = `
      <div class="qr-wrapper">
        <img src="${qrUrl}" alt="Contact vCard QR Code" class="qr-image" />
        <p class="qr-instructions">Scan with your smartphone camera to instantly save <strong>${this.escapeHTML(fullName)}</strong> to your phone contacts.</p>
      </div>
    `;

    modal.classList.add('active');
  }

  /**
   * Show Analytics / Insights Modal
   */
  showAnalyticsModal() {
    const modal = document.getElementById('analytics-modal');
    const content = document.getElementById('analytics-content');
    if (!modal || !content) return;

    const data = this.cm.getAnalytics();

    const maxCatCount = Math.max(...Object.values(data.categories), 1);

    const categoriesHtml = Object.entries(data.categories).map(([cat, count]) => {
      const percentage = Math.round((count / (data.total || 1)) * 100);
      const barWidth = Math.round((count / maxCatCount) * 100);
      return `
        <div class="analytics-bar-row">
          <div class="bar-label-group">
            <span class="bar-name">${this.escapeHTML(cat)}</span>
            <span class="bar-count">${count} (${percentage}%)</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${barWidth}%;"></div>
          </div>
        </div>
      `;
    }).join('');

    const topCompaniesHtml = data.topCompanies.length > 0
      ? data.topCompanies.map(([comp, count]) => `
          <div class="tag-pill-stat">
            <span class="font-medium">${this.escapeHTML(comp)}</span>
            <span class="badge badge-tag">${count}</span>
          </div>
        `).join('')
      : '<p class="text-xs text-muted">No companies recorded</p>';

    const topTagsHtml = data.topTags.length > 0
      ? data.topTags.map(([tag, count]) => `
          <div class="tag-pill-stat">
            <span>#${this.escapeHTML(tag)}</span>
            <span class="badge badge-tag">${count}</span>
          </div>
        `).join('')
      : '<p class="text-xs text-muted">No custom tags created yet</p>';

    content.innerHTML = `
      <div class="stats-overview-grid">
        <div class="stat-card">
          <div class="stat-num">${data.total}</div>
          <div class="stat-desc">Total Contacts</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${data.favorites}</div>
          <div class="stat-desc">Starred Favorites</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${data.withEmail}</div>
          <div class="stat-desc">With Email</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${data.withPhone}</div>
          <div class="stat-desc">With Phone</div>
        </div>
      </div>

      <div class="analytics-section">
        <h4 class="modal-section-heading">Category Distribution</h4>
        <div class="bar-chart-container">
          ${categoriesHtml}
        </div>
      </div>

      <div class="analytics-grid-two">
        <div class="analytics-section">
          <h4 class="modal-section-heading">Top Organizations</h4>
          <div class="pill-stats-wrap">
            ${topCompaniesHtml}
          </div>
        </div>
        <div class="analytics-section">
          <h4 class="modal-section-heading">Popular Tags</h4>
          <div class="pill-stats-wrap">
            ${topTagsHtml}
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  /**
   * Show Duplicate Finder and Resolution Modal
   */
  showDuplicatesModal() {
    const modal = document.getElementById('duplicates-modal');
    const content = document.getElementById('duplicates-content');
    if (!modal || !content) return;

    const duplicates = this.cm.findDuplicates();

    if (duplicates.length === 0) {
      content.innerHTML = `
        <div class="clean-state-box">
          <div class="clean-icon">✨</div>
          <h3>No Duplicates Found!</h3>
          <p class="text-muted text-sm">Your contact database is spotless. No overlapping phone numbers or emails were detected.</p>
        </div>
      `;
    } else {
      content.innerHTML = `
        <p class="duplicates-intro">Found <strong>${duplicates.length} duplicate group${duplicates.length === 1 ? '' : 's'}</strong> based on matching emails or telephone numbers.</p>
        <div class="duplicates-list">
          ${duplicates.map((dup, index) => {
            const primary = dup.contacts[0];
            const duplicateIds = dup.contacts.slice(1).map(c => c.id);
            return `
              <div class="duplicate-group-card">
                <div class="dup-header">
                  <span class="badge badge-warning">${this.escapeHTML(dup.reason)}</span>
                  <button class="btn btn-primary btn-sm btn-merge" data-primary-id="${primary.id}" data-duplicate-ids="${duplicateIds.join(',')}">
                    Merge Into Primary
                  </button>
                </div>
                <div class="dup-contacts-grid">
                  ${dup.contacts.map((c, i) => `
                    <div class="dup-contact-item ${i === 0 ? 'is-primary' : ''}">
                      ${i === 0 ? '<span class="primary-tag">Primary</span>' : ''}
                      <div class="font-semibold">${this.escapeHTML(c.firstName)} ${this.escapeHTML(c.lastName)}</div>
                      <div class="text-xs text-muted">${this.escapeHTML(c.email || 'No email')}</div>
                      <div class="text-xs text-muted">${this.escapeHTML(c.phone || 'No phone')}</div>
                      <div class="text-xs text-muted">${this.escapeHTML(c.company || '')}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Attach merge button handlers
      content.querySelectorAll('.btn-merge').forEach(btn => {
        btn.onclick = () => {
          const primaryId = btn.dataset.primaryId;
          const duplicateIds = btn.dataset.duplicateIds.split(',');
          this.cm.mergeContacts(primaryId, duplicateIds, {});
          this.showToast('Successfully merged contacts!');
          this.showDuplicatesModal();
        };
      });
    }

    modal.classList.add('active');
  }

  /**
   * Show Standard Notification Toast
   */
  showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-msg">${this.escapeHTML(message)}</span>
      </div>
    `;
    toast.className = 'toast toast-active';

    this.toastTimeout = setTimeout(() => {
      toast.className = 'toast';
    }, duration);
  }

  /**
   * Show Undo Delete Toast Notification
   */
  showUndoToast(message, onUndoCallback, duration = 6000) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    if (this.undoTimeout) clearTimeout(this.undoTimeout);

    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-msg">${this.escapeHTML(message)}</span>
        <button class="btn-toast-undo" id="btn-toast-undo">Undo</button>
      </div>
      <div class="toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
    `;
    toast.className = 'toast toast-active toast-undo';

    const undoBtn = document.getElementById('btn-toast-undo');
    if (undoBtn) {
      undoBtn.onclick = () => {
        clearTimeout(this.undoTimeout);
        toast.className = 'toast';
        if (typeof onUndoCallback === 'function') onUndoCallback();
      };
    }

    this.undoTimeout = setTimeout(() => {
      toast.className = 'toast';
    }, duration);
  }
}

// Make globally accessible
window.UIManager = UIManager;
