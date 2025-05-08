import axios from 'axios';

/**
 * Get summary statistics for transactions
 * @returns {Promise<Object>} Transaction summary data
 */
export const getTransactionSummary = async () => {
  try {
    // In a real implementation, this would make an API call
    // const response = await axios.get('/api/shop/transaction-summary');
    // return response.data;
    
    // For demo purposes, returning mock data
    return {
      totalProducts: 24,
      activeProducts: 18,
      pendingTransactions: 5,
      completedTransactions: 42,
      recentTransactions: [
        {
          id: 12345,
          farmer_name: 'Budi Santoso',
          main_product: 'Pakan Ternak Premium',
          product_count: 3,
          total: 450000,
          status: 'pending',
          created_at: '2025-05-08T14:32:21'
        },
        {
          id: 12344,
          farmer_name: 'Dewi Suryani',
          main_product: 'Vitamin Ternak',
          product_count: 1,
          total: 175000,
          status: 'processing',
          created_at: '2025-05-07T10:15:43'
        },
        {
          id: 12343,
          farmer_name: 'Ahmad Rizki',
          main_product: 'Obat Cacing Ternak',
          product_count: 2,
          total: 225000,
          status: 'completed',
          created_at: '2025-05-06T16:45:12'
        },
        {
          id: 12342,
          farmer_name: 'Siti Nurhayati',
          main_product: 'Pakan Organik',
          product_count: 1,
          total: 300000,
          status: 'completed',
          created_at: '2025-05-05T09:22:18'
        },
        {
          id: 12341,
          farmer_name: 'Hendra Wijaya',
          main_product: 'Alat Kesehatan Ternak',
          product_count: 4,
          total: 780000,
          status: 'cancelled',
          created_at: '2025-05-04T11:30:55'
        }
      ],
      topProducts: [
        { id: 1, name: 'Pakan Ternak Premium', sold: 42, price: 150000 },
        { id: 2, name: 'Vitamin Ternak', sold: 35, price: 175000 },
        { id: 3, name: 'Obat Cacing Ternak', sold: 27, price: 95000 },
        { id: 4, name: 'Pakan Organik', sold: 22, price: 300000 },
        { id: 5, name: 'Alat Kesehatan Ternak', sold: 18, price: 250000 }
      ],
      monthlyRevenue: [
        { month: 'Jan', amount: 4500000 },
        { month: 'Feb', amount: 5200000 },
        { month: 'Mar', amount: 4800000 },
        { month: 'Apr', amount: 6300000 },
        { month: 'May', amount: 5100000 }
      ]
    };
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    throw error;
  }
};

/**
 * Get all transactions
 * @param {Object} filters - Query filters (status, date range, etc.)
 * @param {number} page - Page number for pagination
 * @returns {Promise<Object>} Paginated transactions
 */
export const getTransactions = async (filters = {}, page = 1) => {
  try {
    // In a real implementation, this would make an API call
    // const response = await axios.get('/api/shop/transactions', {
    //   params: { ...filters, page }
    // });
    // return response.data;
    
    // For demo purposes, returning mock data
    return {
      data: [
        {
          id: 12345,
          farmer_name: 'Budi Santoso',
          farmer_id: 1,
          products: [
            { id: 1, name: 'Pakan Ternak Premium', quantity: 2, price: 150000 },
            { id: 2, name: 'Vitamin Ternak', quantity: 1, price: 175000 }
          ],
          total: 475000,
          status: 'pending',
          created_at: '2025-05-08T14:32:21'
        },
        // Add more mock transactions here
      ],
      meta: {
        current_page: page,
        from: ((page - 1) * 10) + 1,
        last_page: 5,
        path: '/shop/transactions',
        per_page: 10,
        to: page * 10,
        total: 50
      }
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Get transaction history
 * @param {Object} filters - Query filters
 * @param {number} page - Page number for pagination
 * @returns {Promise<Object>} Paginated transaction history
 */
export const getTransactionHistory = async (filters = {}, page = 1) => {
  try {
    // In a real implementation, this would make an API call
    // const response = await axios.get('/api/shop/transaction-history', {
    //   params: { ...filters, page }
    // });
    // return response.data;
    
    // For demo purposes, using the same structure as getTransactions
    const result = await getTransactions(filters, page);
    // Modify to only include completed transactions for history
    result.data = result.data.filter(tx => tx.status === 'completed');
    return result;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

/**
 * Update transaction status
 * @param {number} id - Transaction ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated transaction
 */
export const updateTransactionStatus = async (id, status) => {
  try {
    // In a real implementation, this would make an API call
    // const response = await axios.put(`/api/shop/transactions/${id}/status`, { status });
    // return response.data;
    
    // For demo purposes, returning mock data
    return {
      id,
      status,
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
};