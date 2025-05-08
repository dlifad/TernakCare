import axios from 'axios';

// Dapatkan base URL untuk API
const baseURL = '/api';

/**
 * Mengambil daftar produk dari API dengan parameter filter
 * 
 * @param {Object} params - Parameter untuk filter dan paginasi
 * @param {string|null} params.category - Kategori produk
 * @param {string} params.sort - Urutan produk (newest, oldest, price_low, price_high, popular)
 * @param {number} params.page - Halaman saat ini
 * @param {string|null} params.search - Kata kunci pencarian
 * @returns {Promise} Promise yang mengembalikan data produk dan metadata paginasi
 */
export const getProducts = async (params = {}) => {
    try {
        const response = await axios.get(`${baseURL}/marketplace/products`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

/**
 * Mengambil detail produk berdasarkan ID
 * 
 * @param {number} id - ID produk
 * @returns {Promise} Promise yang mengembalikan detail produk
 */
export const getProductById = async (id) => {
    try {
        const response = await axios.get(`${baseURL}/marketplace/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Menambahkan produk ke keranjang belanja
 * 
 * @param {Object} cartItem - Data item keranjang yang akan ditambahkan
 * @param {number} cartItem.product_id - ID produk
 * @param {number} cartItem.quantity - Jumlah produk
 * @returns {Promise} Promise yang mengembalikan data keranjang yang diperbarui
 */
export const addToCart = async (cartItem) => {
    try {
        const response = await axios.post(`${baseURL}/marketplace/cart`, cartItem);
        return response.data;
    } catch (error) {
        console.error('Error adding item to cart:', error);
        throw error;
    }
};

/**
 * Mengambil data keranjang belanja pengguna saat ini
 * 
 * @returns {Promise} Promise yang mengembalikan data keranjang
 */
export const getCart = async () => {
    try {
        const response = await axios.get(`${baseURL}/marketplace/cart`);
        return response.data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
};

/**
 * Mengubah jumlah produk di keranjang belanja
 * 
 * @param {number} itemId - ID item keranjang
 * @param {number} quantity - Jumlah baru
 * @returns {Promise} Promise yang mengembalikan data keranjang yang diperbarui
 */
export const updateCartItemQuantity = async (itemId, quantity) => {
    try {
        const response = await axios.patch(`${baseURL}/marketplace/cart/${itemId}`, { quantity });
        return response.data;
    } catch (error) {
        console.error(`Error updating cart item ${itemId}:`, error);
        throw error;
    }
};

/**
 * Menghapus produk dari keranjang belanja
 * 
 * @param {number} itemId - ID item keranjang
 * @returns {Promise} Promise yang mengembalikan data keranjang yang diperbarui
 */
export const removeFromCart = async (itemId) => {
    try {
        const response = await axios.delete(`${baseURL}/marketplace/cart/${itemId}`);
        return response.data;
    } catch (error) {
        console.error(`Error removing cart item ${itemId}:`, error);
        throw error;
    }
};

/**
 * Membuat transaksi baru (checkout)
 * 
 * @param {Object} transactionData - Data transaksi
 * @returns {Promise} Promise yang mengembalikan data transaksi baru
 */
export const createTransaction = async (transactionData) => {
    try {
        const response = await axios.post(`${baseURL}/marketplace/transactions`, transactionData);
        return response.data;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
};