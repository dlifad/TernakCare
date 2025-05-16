/**
 * Format utility functions
 */
export const format = {
    /**
     * Format date to localized string in Indonesian format
     * @param {string|Date} date - Date to format
     * @returns {string} - Formatted date string
     */
    formatDate: (date) => {
        if (!date) return '';
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleDateString('id-ID', options);
    },

    /**
     * Format short date (DD/MM/YYYY)
     * @param {string|Date} date - Date to format
     * @returns {string} - Formatted date string
     */
    formatShortDate: (date) => {
        if (!date) return '';
        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit'
        };
        return new Date(date).toLocaleDateString('id-ID', options);
    },

    /**
     * Format date without time (DD MMMM YYYY)
     * @param {string|Date} date - Date to format
     * @returns {string} - Formatted date string
     */
    formatDateOnly: (date) => {
        if (!date) return '';
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        return new Date(date).toLocaleDateString('id-ID', options);
    },

    /**
     * Format time only (HH:MM)
     * @param {string|Date} date - Date to format
     * @returns {string} - Formatted time string
     */
    formatTime: (date) => {
        if (!date) return '';
        const options = { 
            hour: '2-digit', 
            minute: '2-digit'
        };
        return new Date(date).toLocaleTimeString('id-ID', options);
    },

    /**
     * Format currency to Indonesian Rupiah
     * @param {number} amount - Amount to format
     * @returns {string} - Formatted currency string
     */
    formatCurrency: (amount) => {
        if (amount === null || amount === undefined) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Format relative time (e.g., "5 menit yang lalu")
     * @param {string|Date} date - Date to format
     * @returns {string} - Formatted relative time string
     */
    formatRelativeTime: (date) => {
        if (!date) return '';
        
        const now = new Date();
        const pastDate = new Date(date);
        const diffMs = now - pastDate;
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHours = Math.round(diffMin / 60);
        const diffDays = Math.round(diffHours / 24);
        const diffWeeks = Math.round(diffDays / 7);
        const diffMonths = Math.round(diffDays / 30);
        
        if (diffSec < 60) {
            return 'Baru saja';
        } else if (diffMin < 60) {
            return `${diffMin} menit yang lalu`;
        } else if (diffHours < 24) {
            return `${diffHours} jam yang lalu`;
        } else if (diffDays < 7) {
            return `${diffDays} hari yang lalu`;
        } else if (diffWeeks < 4) {
            return `${diffWeeks} minggu yang lalu`;
        } else if (diffMonths < 12) {
            return `${diffMonths} bulan yang lalu`;
        } else {
            return format.formatDateOnly(date);
        }
    },
    
    /**
     * Format phone number to proper Indonesian format
     * @param {string} phone - Phone number
     * @returns {string} - Formatted phone number
     */
    formatPhone: (phone) => {
        if (!phone) return '';
        
        // Handle country code
        let formattedPhone = phone;
        if (phone.startsWith('+62')) {
            formattedPhone = '0' + phone.substring(3);
        } else if (phone.startsWith('62')) {
            formattedPhone = '0' + phone.substring(2);
        }
        
        // Add spaces for readability
        if (formattedPhone.length > 4) {
            formattedPhone = formattedPhone.substring(0, 4) + ' ' + formattedPhone.substring(4);
        }
        if (formattedPhone.length > 9) {
            formattedPhone = formattedPhone.substring(0, 9) + ' ' + formattedPhone.substring(9);
        }
        
        return formattedPhone;
    }
};