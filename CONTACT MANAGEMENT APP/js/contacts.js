/**
 * Nexus Contacts - Contact Data Manager & Business Logic
 * Handles CRUD operations, search indexing, multi-criteria filtering, sorting, duplicate detection & analytics.
 */

class ContactManager {
  constructor() {
    this.contacts = [];
    this.lastDeletedContact = null;
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.selectedTag = 'all';
    this.favoriteOnly = false;
    this.sortBy = 'name-asc'; // 'name-asc', 'name-desc', 'recent', 'updated', 'company'
    this.listeners = [];
  }

  /**
   * Initialize state from storage
   */
  init() {
    this.contacts = window.StorageService.loadContacts();
    return this;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  notify() {
    this.listeners.forEach(fn => fn(this.getFilteredContacts()));
  }

  /**
   * Save current contacts to storage and notify listeners
   */
  persist() {
    window.StorageService.saveContacts(this.contacts);
    this.notify();
  }

  /**
   * Get contact by ID
   */
  getContactById(id) {
    return this.contacts.find(c => c.id === id) || null;
  }

  /**
   * Create a new contact
   */
  addContact(data) {
    const palette = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];
    const randomColor = palette[Math.floor(Math.random() * palette.length)];

    const newContact = {
      id: 'cnt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      firstName: data.firstName?.trim() || '',
      lastName: data.lastName?.trim() || '',
      phone: data.phone?.trim() || '',
      email: data.email?.trim() || '',
      company: data.company?.trim() || '',
      jobTitle: data.jobTitle?.trim() || '',
      category: data.category || 'Personal',
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      isFavorite: Boolean(data.isFavorite),
      address: data.address?.trim() || '',
      birthday: data.birthday || '',
      notes: data.notes?.trim() || '',
      avatarColor: data.avatarColor || randomColor,
      avatarUrl: data.avatarUrl || '',
      activityLog: [
        {
          id: 'act_' + Date.now(),
          type: 'note',
          text: 'Contact created.',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.contacts.unshift(newContact);
    this.persist();
    return newContact;
  }

  /**
   * Update an existing contact
   */
  updateContact(id, data) {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return null;

    const current = this.contacts[index];
    const updatedTags = Array.isArray(data.tags)
      ? data.tags
      : (data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : current.tags);

    this.contacts[index] = {
      ...current,
      firstName: data.firstName !== undefined ? data.firstName.trim() : current.firstName,
      lastName: data.lastName !== undefined ? data.lastName.trim() : current.lastName,
      phone: data.phone !== undefined ? data.phone.trim() : current.phone,
      email: data.email !== undefined ? data.email.trim() : current.email,
      company: data.company !== undefined ? data.company.trim() : current.company,
      jobTitle: data.jobTitle !== undefined ? data.jobTitle.trim() : current.jobTitle,
      category: data.category || current.category,
      tags: updatedTags,
      isFavorite: data.isFavorite !== undefined ? Boolean(data.isFavorite) : current.isFavorite,
      address: data.address !== undefined ? data.address.trim() : current.address,
      birthday: data.birthday !== undefined ? data.birthday : current.birthday,
      notes: data.notes !== undefined ? data.notes.trim() : current.notes,
      avatarColor: data.avatarColor || current.avatarColor,
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : current.avatarUrl,
      updatedAt: new Date().toISOString()
    };

    this.persist();
    return this.contacts[index];
  }

  /**
   * Delete contact with undo backup
   */
  deleteContact(id) {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.lastDeletedContact = {
      contact: this.contacts[index],
      index: index
    };

    const deleted = this.contacts.splice(index, 1)[0];
    this.persist();
    return deleted;
  }

  /**
   * Restore last deleted contact (Undo operation)
   */
  restoreLastDeleted() {
    if (!this.lastDeletedContact) return null;

    const { contact, index } = this.lastDeletedContact;
    const insertIdx = Math.min(index, this.contacts.length);
    this.contacts.splice(insertIdx, 0, contact);
    this.lastDeletedContact = null;
    this.persist();
    return contact;
  }

  /**
   * Toggle contact favorite state
   */
  toggleFavorite(id) {
    const contact = this.getContactById(id);
    if (contact) {
      contact.isFavorite = !contact.isFavorite;
      contact.updatedAt = new Date().toISOString();
      this.persist();
      return contact.isFavorite;
    }
    return false;
  }

  /**
   * Add activity or interaction record to contact
   */
  addActivity(contactId, type, text) {
    const contact = this.getContactById(contactId);
    if (!contact) return null;

    if (!Array.isArray(contact.activityLog)) {
      contact.activityLog = [];
    }

    const activity = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: type || 'note', // 'note', 'call', 'email', 'meeting'
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    contact.activityLog.unshift(activity);
    contact.updatedAt = new Date().toISOString();
    this.persist();
    return activity;
  }

  /**
   * Delete activity record from contact
   */
  deleteActivity(contactId, activityId) {
    const contact = this.getContactById(contactId);
    if (!contact || !Array.isArray(contact.activityLog)) return false;

    contact.activityLog = contact.activityLog.filter(a => a.id !== activityId);
    this.persist();
    return true;
  }

  /**
   * Set filter parameters
   */
  setFilters({ query, category, tag, favoriteOnly, sortBy }) {
    if (query !== undefined) this.searchQuery = query.trim().toLowerCase();
    if (category !== undefined) this.selectedCategory = category;
    if (tag !== undefined) this.selectedTag = tag;
    if (favoriteOnly !== undefined) this.favoriteOnly = Boolean(favoriteOnly);
    if (sortBy !== undefined) this.sortBy = sortBy;
    this.notify();
  }

  /**
   * Filter and sort contacts based on current state
   */
  getFilteredContacts() {
    let result = [...this.contacts];

    // 1. Search Query Filter
    if (this.searchQuery) {
      const tokens = this.searchQuery.split(' ').filter(Boolean);
      result = result.filter(c => {
        const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
        const searchableText = [
          fullName,
          c.phone || '',
          c.email || '',
          c.company || '',
          c.jobTitle || '',
          c.address || '',
          c.notes || '',
          Array.isArray(c.tags) ? c.tags.join(' ') : ''
        ].join(' ').toLowerCase();

        return tokens.every(token => searchableText.includes(token));
      });
    }

    // 2. Category Filter
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      result = result.filter(c => c.category && c.category.toLowerCase() === this.selectedCategory.toLowerCase());
    }

    // 3. Tag Filter
    if (this.selectedTag && this.selectedTag !== 'all') {
      result = result.filter(c => Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase() === this.selectedTag.toLowerCase()));
    }

    // 4. Favorites Filter
    if (this.favoriteOnly) {
      result = result.filter(c => c.isFavorite);
    }

    // 5. Sorting
    result.sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();

      switch (this.sortBy) {
        case 'name-asc':
          return nameA.localeCompare(nameB);
        case 'name-desc':
          return nameB.localeCompare(nameA);
        case 'recent':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'updated':
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        case 'company':
          return (a.company || '').localeCompare(b.company || '') || nameA.localeCompare(nameB);
        case 'favorite':
          if (a.isFavorite === b.isFavorite) return nameA.localeCompare(nameB);
          return a.isFavorite ? -1 : 1;
        default:
          return nameA.localeCompare(nameB);
      }
    });

    return result;
  }

  /**
   * Get all unique tags across all contacts
   */
  getAllTags() {
    const tagsSet = new Set();
    this.contacts.forEach(c => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach(t => {
          if (t && t.trim()) tagsSet.add(t.trim());
        });
      }
    });
    return Array.from(tagsSet).sort();
  }

  /**
   * Get all unique categories with their count
   */
  getCategoryCounts() {
    const counts = {
      all: this.contacts.length,
      Work: 0,
      Personal: 0,
      Family: 0,
      Friends: 0,
      VIP: 0
    };

    let favoritesCount = 0;

    this.contacts.forEach(c => {
      if (c.isFavorite) favoritesCount++;
      if (c.category && counts[c.category] !== undefined) {
        counts[c.category]++;
      } else if (c.category) {
        counts[c.category] = (counts[c.category] || 0) + 1;
      }
    });

    return { counts, favoritesCount };
  }

  /**
   * Find duplicate contacts based on email or normalized phone number
   */
  findDuplicates() {
    const normalizePhone = (p) => (p || '').replace(/[^0-9+]/g, '');
    const normalizeEmail = (e) => (e || '').trim().toLowerCase();

    const emailMap = new Map();
    const phoneMap = new Map();
    const duplicateGroups = [];
    const processedIds = new Set();

    this.contacts.forEach(c => {
      const email = normalizeEmail(c.email);
      const phone = normalizePhone(c.phone);

      if (email) {
        if (!emailMap.has(email)) emailMap.set(email, []);
        emailMap.get(email).push(c);
      }
      if (phone && phone.length >= 7) {
        if (!phoneMap.has(phone)) phoneMap.set(phone, []);
        phoneMap.get(phone).push(c);
      }
    });

    // Collect duplicates from email matches
    emailMap.forEach((group, email) => {
      if (group.length > 1) {
        const groupIds = group.map(c => c.id);
        if (!groupIds.some(id => processedIds.has(id))) {
          groupIds.forEach(id => processedIds.add(id));
          duplicateGroups.push({
            reason: `Matching Email (${email})`,
            contacts: group
          });
        }
      }
    });

    // Collect duplicates from phone matches
    phoneMap.forEach((group, phone) => {
      if (group.length > 1) {
        const groupIds = group.map(c => c.id);
        const unprocessed = group.filter(c => !processedIds.has(c.id));
        if (unprocessed.length > 1) {
          unprocessed.forEach(c => processedIds.add(c.id));
          duplicateGroups.push({
            reason: `Matching Phone (${phone})`,
            contacts: unprocessed
          });
        }
      }
    });

    return duplicateGroups;
  }

  /**
   * Merge duplicate contacts into a primary contact
   */
  mergeContacts(primaryId, duplicateIds, mergedData) {
    const primaryIndex = this.contacts.findIndex(c => c.id === primaryId);
    if (primaryIndex === -1) return null;

    // Collect all activities and tags from merged duplicates
    const allActivities = [...(this.contacts[primaryIndex].activityLog || [])];
    const allTags = new Set(this.contacts[primaryIndex].tags || []);

    duplicateIds.forEach(id => {
      const dup = this.contacts.find(c => c.id === id);
      if (dup) {
        if (Array.isArray(dup.tags)) dup.tags.forEach(t => allTags.add(t));
        if (Array.isArray(dup.activityLog)) {
          dup.activityLog.forEach(a => {
            allActivities.push({
              ...a,
              text: `[Merged from ${dup.firstName} ${dup.lastName}] ${a.text}`
            });
          });
        }
      }
    });

    // Update primary contact with merged fields
    this.contacts[primaryIndex] = {
      ...this.contacts[primaryIndex],
      ...mergedData,
      tags: Array.from(allTags),
      activityLog: allActivities,
      updatedAt: new Date().toISOString()
    };

    // Remove duplicates
    this.contacts = this.contacts.filter(c => !duplicateIds.includes(c.id));
    this.persist();
    return this.contacts[primaryIndex];
  }

  /**
   * Generate comprehensive contact analytics
   */
  getAnalytics() {
    const total = this.contacts.length;
    const favorites = this.contacts.filter(c => c.isFavorite).length;
    const withEmail = this.contacts.filter(c => c.email).length;
    const withPhone = this.contacts.filter(c => c.phone).length;
    const withNotes = this.contacts.filter(c => c.notes).length;

    // Categories breakdown
    const categories = {};
    this.contacts.forEach(c => {
      const cat = c.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    // Top companies
    const companies = {};
    this.contacts.forEach(c => {
      if (c.company) {
        companies[c.company] = (companies[c.company] || 0) + 1;
      }
    });

    const topCompanies = Object.entries(companies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Tags count
    const tagCounts = {};
    this.contacts.forEach(c => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach(t => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      }
    });

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return {
      total,
      favorites,
      withEmail,
      withPhone,
      withNotes,
      categories,
      topCompanies,
      topTags
    };
  }
}

// Make globally accessible
window.ContactManager = ContactManager;
