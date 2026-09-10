/**
 * Nexus Contacts - Storage & Data Persistence Module
 * Handles LocalStorage persistence, default sample data, and data import/export (JSON, CSV, vCard).
 */

const STORAGE_KEY = 'nexus_contacts_data_v1';
const SETTINGS_KEY = 'nexus_contacts_settings_v1';

// Initial rich sample dataset
const INITIAL_CONTACTS = [
  {
    id: 'cnt_1',
    firstName: 'Elena',
    lastName: 'Rostova',
    phone: '+1 (555) 234-5678',
    email: 'elena.rostova@nexusdesign.io',
    company: 'Nexus Creative Studio',
    jobTitle: 'Principal Product Designer',
    category: 'Work',
    tags: ['Design', 'Work', 'VIP'],
    isFavorite: true,
    address: '742 Evergreen Terrace, San Francisco, CA',
    birthday: '1992-04-15',
    notes: 'Key stakeholder for the UI/UX redesign project. Prefers communication via Slack or email.',
    avatarColor: '#6366f1',
    avatarUrl: '',
    activityLog: [
      { id: 'act_1_1', type: 'note', text: 'Completed Q3 design system review session.', timestamp: '2026-08-20T10:30:00Z' },
      { id: 'act_1_2', type: 'call', text: '15-min sync call regarding prototype feedback.', timestamp: '2026-09-02T14:15:00Z' }
    ],
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-09-02T14:15:00Z'
  },
  {
    id: 'cnt_2',
    firstName: 'Marcus',
    lastName: 'Vance',
    phone: '+1 (555) 876-5432',
    email: 'marcus.vance@vanguardtech.dev',
    company: 'Vanguard Systems',
    jobTitle: 'Lead Cloud Architect',
    category: 'Work',
    tags: ['Work', 'Engineering'],
    isFavorite: true,
    address: '100 Innovation Way, Austin, TX',
    birthday: '1988-11-28',
    notes: 'Met at Cloud Native Summit 2025. Expert in Kubernetes and distributed backend infrastructure.',
    avatarColor: '#0ea5e9',
    avatarUrl: '',
    activityLog: [
      { id: 'act_2_1', type: 'email', text: 'Sent proposal for multi-region cluster deployment.', timestamp: '2026-08-14T11:00:00Z' }
    ],
    createdAt: '2026-02-15T11:20:00Z',
    updatedAt: '2026-08-14T11:00:00Z'
  },
  {
    id: 'cnt_3',
    firstName: 'Sophia',
    lastName: 'Chen',
    phone: '+1 (555) 345-6789',
    email: 'sophia.chen@chronosventures.com',
    company: 'Chronos Capital',
    jobTitle: 'Investment Partner',
    category: 'VIP',
    tags: ['VIP', 'Finance', 'Advisor'],
    isFavorite: true,
    address: '500 Wall Street, New York, NY',
    birthday: '1985-07-09',
    notes: 'Series A lead investor advisor. Monthly board meeting on the first Tuesday of every month.',
    avatarColor: '#8b5cf6',
    avatarUrl: '',
    activityLog: [
      { id: 'act_3_1', type: 'meeting', text: 'Quarterly financial review at Chronos HQ.', timestamp: '2026-07-10T16:00:00Z' },
      { id: 'act_3_2', type: 'call', text: 'Discussed valuation strategy and term sheet.', timestamp: '2026-08-30T09:45:00Z' }
    ],
    createdAt: '2026-03-01T14:30:00Z',
    updatedAt: '2026-08-30T09:45:00Z'
  },
  {
    id: 'cnt_4',
    firstName: 'Liam',
    lastName: 'O\'Connor',
    phone: '+1 (555) 901-2345',
    email: 'liam.oconnor@family.org',
    company: 'Home & Hearth',
    jobTitle: 'Architect',
    category: 'Family',
    tags: ['Family', 'Personal'],
    isFavorite: false,
    address: '12 Birchwood Lane, Seattle, WA',
    birthday: '1995-09-22',
    notes: 'Cousin Liam. Remember to send birthday wishes every September!',
    avatarColor: '#10b981',
    avatarUrl: '',
    activityLog: [
      { id: 'act_4_1', type: 'note', text: 'Family gathering dinner planned for Thanksgiving.', timestamp: '2026-08-05T18:00:00Z' }
    ],
    createdAt: '2026-03-12T16:00:00Z',
    updatedAt: '2026-08-05T18:00:00Z'
  },
  {
    id: 'cnt_5',
    firstName: 'Aaliyah',
    lastName: 'Patel',
    phone: '+1 (555) 456-7890',
    email: 'aaliyah.patel@biogenesis.med',
    company: 'BioGenesis Labs',
    jobTitle: 'Research Scientist',
    category: 'Friends',
    tags: ['Friends', 'Personal'],
    isFavorite: false,
    address: '320 Science Park, Boston, MA',
    birthday: '1993-01-30',
    notes: 'College roommate from MIT. Passionate about CRISPR and molecular biology.',
    avatarColor: '#ec4899',
    avatarUrl: '',
    activityLog: [],
    createdAt: '2026-04-18T10:15:00Z',
    updatedAt: '2026-04-18T10:15:00Z'
  },
  {
    id: 'cnt_6',
    firstName: 'David',
    lastName: 'Kim',
    phone: '+1 (555) 678-9012',
    email: 'david.kim@hyperioncyber.security',
    company: 'Hyperion Security',
    jobTitle: 'Security Operations Lead',
    category: 'Work',
    tags: ['Work', 'Security'],
    isFavorite: false,
    address: '88 Cyber Citadel, Denver, CO',
    birthday: '1990-06-12',
    notes: 'Handles SOC compliance audits and penetration testing coordination.',
    avatarColor: '#f59e0b',
    avatarUrl: '',
    activityLog: [
      { id: 'act_6_1', type: 'email', text: 'Received annual SOC2 audit confirmation.', timestamp: '2026-08-25T13:20:00Z' }
    ],
    createdAt: '2026-05-02T08:45:00Z',
    updatedAt: '2026-08-25T13:20:00Z'
  },
  {
    id: 'cnt_7',
    firstName: 'Zoe',
    lastName: 'Kavinsky',
    phone: '+1 (555) 567-8901',
    email: 'zoe@kavinskymedia.com',
    company: 'Kavinsky Media',
    jobTitle: 'Creative Director & Producer',
    category: 'Work',
    tags: ['Media', 'Work', 'Creative'],
    isFavorite: false,
    address: '42 Hollywood Blvd, Los Angeles, CA',
    birthday: '1994-12-05',
    notes: 'Video production director for product launch trailers and brand campaigns.',
    avatarColor: '#d946ef',
    avatarUrl: '',
    activityLog: [],
    createdAt: '2026-06-11T15:10:00Z',
    updatedAt: '2026-06-11T15:10:00Z'
  },
  {
    id: 'cnt_8',
    firstName: 'Hiroshi',
    lastName: 'Tanaka',
    phone: '+1 (555) 789-0123',
    email: 'hiroshi.tanaka@tokyotech.jp',
    company: 'Mirai Robotics',
    jobTitle: 'Hardware Robotics Engineer',
    category: 'VIP',
    tags: ['VIP', 'Robotics', 'International'],
    isFavorite: true,
    address: 'Chiyoda-ku, Tokyo, Japan',
    birthday: '1987-03-18',
    notes: 'Oversees Asia-Pacific hardware integration. Timezone: JST (UTC+9).',
    avatarColor: '#14b8a6',
    avatarUrl: '',
    activityLog: [
      { id: 'act_8_1', type: 'meeting', text: 'Virtual demo of the robotic arm API SDK.', timestamp: '2026-09-01T06:00:00Z' }
    ],
    createdAt: '2026-07-04T12:00:00Z',
    updatedAt: '2026-09-01T06:00:00Z'
  }
];

// Default App Settings
const DEFAULT_SETTINGS = {
  theme: 'dark',
  viewMode: 'grid', // 'grid' or 'list'
  sortBy: 'name-asc', // 'name-asc', 'name-desc', 'recent', 'favorite'
  activeCategory: 'all',
  activeTag: 'all'
};

class StorageService {
  /**
   * Load contacts from LocalStorage or initialize with sample dataset
   */
  static loadContacts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read contacts from localStorage, falling back to initial data.', e);
    }
    // Initialize default data
    this.saveContacts(INITIAL_CONTACTS);
    return [...INITIAL_CONTACTS];
  }

  /**
   * Save contacts array to LocalStorage
   */
  static saveContacts(contacts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
      return true;
    } catch (e) {
      console.error('Error saving contacts to localStorage:', e);
      return false;
    }
  }

  /**
   * Load user preferences / settings
   */
  static loadSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Could not read settings from localStorage, using defaults.', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Save user preferences / settings
   */
  static saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage:', e);
    }
  }

  /**
   * Reset contacts to default sample dataset
   */
  static resetToDemoData() {
    this.saveContacts(INITIAL_CONTACTS);
    return [...INITIAL_CONTACTS];
  }

  /**
   * Clear all contacts
   */
  static clearAllContacts() {
    this.saveContacts([]);
    return [];
  }

  /**
   * Export contacts as a JSON file download
   */
  static exportToJSON(contacts) {
    const dataStr = JSON.stringify(contacts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `nexus_contacts_backup_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export contacts as a CSV spreadsheet download
   */
  static exportToCSV(contacts) {
    const headers = [
      'First Name',
      'Last Name',
      'Phone',
      'Email',
      'Company',
      'Job Title',
      'Category',
      'Tags',
      'Favorite',
      'Address',
      'Birthday',
      'Notes'
    ];

    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = contacts.map(c => [
      escapeCSV(c.firstName),
      escapeCSV(c.lastName),
      escapeCSV(c.phone),
      escapeCSV(c.email),
      escapeCSV(c.company),
      escapeCSV(c.jobTitle),
      escapeCSV(c.category),
      escapeCSV(Array.isArray(c.tags) ? c.tags.join(', ') : ''),
      escapeCSV(c.isFavorite ? 'Yes' : 'No'),
      escapeCSV(c.address),
      escapeCSV(c.birthday),
      escapeCSV(c.notes)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `nexus_contacts_${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export single or all contacts as vCard (.vcf) format
   */
  static exportToVCF(contacts) {
    const contactList = Array.isArray(contacts) ? contacts : [contacts];
    let vcfContent = '';

    contactList.forEach(c => {
      vcfContent += 'BEGIN:VCARD\r\n';
      vcfContent += 'VERSION:3.0\r\n';
      vcfContent += `N:${c.lastName || ''};${c.firstName || ''};;;\r\n`;
      vcfContent += `FN:${[c.firstName, c.lastName].filter(Boolean).join(' ')}\r\n`;
      if (c.company) vcfContent += `ORG:${c.company}\r\n`;
      if (c.jobTitle) vcfContent += `TITLE:${c.jobTitle}\r\n`;
      if (c.phone) vcfContent += `TEL;TYPE=CELL,VOICE:${c.phone}\r\n`;
      if (c.email) vcfContent += `EMAIL;TYPE=INTERNET,PREF:${c.email}\r\n`;
      if (c.address) vcfContent += `ADR;TYPE=HOME:;;${c.address};;;;\r\n`;
      if (c.birthday) vcfContent += `BDAY:${c.birthday.replace(/-/g, '')}\r\n`;
      if (c.notes) vcfContent += `NOTE:${c.notes.replace(/\n/g, '\\n')}\r\n`;
      if (c.category) vcfContent += `CATEGORIES:${c.category}\r\n`;
      vcfContent += 'END:VCARD\r\n';
    });

    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = contactList.length === 1
      ? `${contactList[0].firstName}_${contactList[0].lastName}.vcf`
      : `nexus_contacts_all_${new Date().toISOString().slice(0, 10)}.vcf`;

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Import contacts from a parsed JSON string or Object
   */
  static parseJSONImport(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data)) {
        throw new Error('Imported JSON must be an array of contact objects.');
      }
      return data.filter(item => item && (item.firstName || item.lastName || item.phone || item.email));
    } catch (e) {
      throw new Error(`Failed to parse JSON file: ${e.message}`);
    }
  }

  /**
   * Import contacts from a CSV string
   */
  static parseCSVImport(csvString) {
    const lines = csvString.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV file is empty or missing data rows.');
    }

    // Helper to parse CSV line respecting quotes
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[\s_]+/g, ''));
    const importedContacts = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length === 0 || cols.every(c => !c)) continue;

      const contact = {
        id: 'cnt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        company: '',
        jobTitle: '',
        category: 'Personal',
        tags: [],
        isFavorite: false,
        address: '',
        birthday: '',
        notes: '',
        avatarColor: ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 6)],
        avatarUrl: '',
        activityLog: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      headers.forEach((header, index) => {
        const val = cols[index] || '';
        if (header.includes('firstname') || header === 'first') contact.firstName = val;
        else if (header.includes('lastname') || header === 'last') contact.lastName = val;
        else if (header.includes('name') && !contact.firstName) {
          const parts = val.split(' ');
          contact.firstName = parts[0] || '';
          contact.lastName = parts.slice(1).join(' ') || '';
        }
        else if (header.includes('phone') || header.includes('mobile') || header.includes('tel')) contact.phone = val;
        else if (header.includes('email') || header.includes('mail')) contact.email = val;
        else if (header.includes('company') || header.includes('org')) contact.company = val;
        else if (header.includes('title') || header.includes('role') || header.includes('job')) contact.jobTitle = val;
        else if (header.includes('category')) contact.category = val || 'Personal';
        else if (header.includes('tag')) contact.tags = val ? val.split(',').map(t => t.trim()).filter(Boolean) : [];
        else if (header.includes('fav')) contact.isFavorite = val.toLowerCase() === 'yes' || val.toLowerCase() === 'true' || val === '1';
        else if (header.includes('address') || header.includes('addr')) contact.address = val;
        else if (header.includes('birth') || header.includes('bday')) contact.birthday = val;
        else if (header.includes('note')) contact.notes = val;
      });

      if (contact.firstName || contact.lastName || contact.phone || contact.email) {
        importedContacts.push(contact);
      }
    }

    return importedContacts;
  }
}

// Make globally accessible
window.StorageService = StorageService;
