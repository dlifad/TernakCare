import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Ambil CSRF token untuk otorisasi Echo
const csrfToken = document.head.querySelector('meta[name="csrf-token"]');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
    // Untuk channel privat, Laravel Echo akan otomatis menggunakan /broadcasting/auth
    // Pastikan CSRF token ada di header request untuk auth.
    // Axios biasanya sudah mengaturnya jika Anda menggunakan `<meta name="csrf-token" ...>` di blade Anda.
    // Jika tidak, Anda bisa menambahkannya secara manual:
    // auth: {
    //     headers: {
    //         'X-CSRF-TOKEN': csrfToken ? csrfToken.content : null,
    //     },
    // },
    // Jika Anda tidak menggunakan Laravel sebagai auth endpoint (misalnya, jika API terpisah),
    // Anda perlu menentukan authEndpoint:
    // authEndpoint: '/custom/broadcasting/auth',
});