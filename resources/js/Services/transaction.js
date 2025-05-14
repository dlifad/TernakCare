// File: resources/js/Services/transaction.js

/**
 * Mendapatkan ringkasan transaksi dari backend
 * 
 * @returns {Promise} Promise objek dengan data ringkasan transaksi
 */
export const getTransactionSummary = async () => {
    try {
        // Di sini kita tidak perlu membuat permintaan API secara manual
        // karena data sudah dikirim dari backend melalui Inertia props
        // pada pages/Shop/Dashboard.jsx
        
        // Dapatkan data dari usePage Inertia
        const { dashboardData } = usePage().props;
        
        // Kembalikan data
        return dashboardData;
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        throw error;
    }
};