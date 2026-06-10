/**
 * Navigation configuration — single source of truth for all pages and sub-pages.
 *
 * Each top-level entry defines:
 *   - key:       unique identifier
 *   - labelKey:  i18n key for display label
 *   - icon:      lucide-react icon name (string, resolved in component)
 *   - path:      route path
 *   - roles:     which user roles can see this page
 *   - subPages:  array of sub-page definitions (if only 1, bottom nav is hidden)
 */

const navConfig = [
    {
        key: 'customer',
        labelKey: 'nav.customer',
        icon: 'Users',
        path: '/customer',
        roles: ['admin', 'worker'],
        subPages: [
            { key: 'add-order', labelKey: 'nav.customer.add_order', icon: 'PlusCircle', path: '/customer' },
            { key: 'search', labelKey: 'nav.customer.search', icon: 'Search', path: '/customer/search' },
            { key: 'report', labelKey: 'nav.customer.report', icon: 'FileText', path: '/customer/report' },
        ],
    },
    {
        key: 'workers',
        labelKey: 'nav.workers',
        icon: 'HardHat',
        path: '/workers',
        roles: ['admin'],
        subPages: [
            { key: 'list', labelKey: 'nav.workers.list', icon: 'List', path: '/workers' },
            { key: 'add-work', labelKey: 'nav.workers.add_work', icon: 'ClipboardPlus', path: '/workers/add-work' },
            { key: 'withdrawal', labelKey: 'nav.workers.withdrawal', icon: 'Wallet', path: '/workers/withdrawal' },
            { key: 'report', labelKey: 'nav.workers.report', icon: 'FileText', path: '/workers/report' },
        ],
    },
    {
        key: 'expenses',
        labelKey: 'nav.expenses',
        icon: 'IndianRupee',
        path: '/expenses',
        roles: ['admin'],
        subPages: [
            { key: 'add-expense', labelKey: 'nav.expenses.add_expense', icon: 'PlusCircle', path: '/expenses' },
            { key: 'report', labelKey: 'nav.expenses.report', icon: 'FileText', path: '/expenses/report' },
        ],
    },
];

export default navConfig;
