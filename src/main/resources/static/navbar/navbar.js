function getCsrfConfig() {
    const tokenEl = document.querySelector('meta[name="_csrf"]');
    const headerEl = document.querySelector('meta[name="_csrf_header"]');

    const headers = { 'Content-Type': 'application/json' };

    if (tokenEl && headerEl) {
        headers[headerEl.content] = tokenEl.content;
    }

    return headers;
}

async function logout() {
    try {
        await fetch('/auth/logout', {
            method: 'POST',
            headers: getCsrfConfig()
        });

        localStorage.removeItem('jwt_token');

        window.location.href = '/login?logout';
    } catch (err) {
        console.error("Logout transaction network routing failure:", err);
        window.location.href = '/login';
    }
}