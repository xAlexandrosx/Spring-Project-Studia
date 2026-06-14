const token = localStorage.getItem('jwt_token');
if (!token) {
    window.location.href = '/login';
}

function decodeJwtPayload() {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (e) {
        console.error("Failed to parse JWT session token:", e);
        return null;
    }
}

function hydrateNavbar() {
    const payload = decodeJwtPayload();
    const identitySpan = document.getElementById('user-identity');

    if (!payload || !identitySpan) return;

    const username = payload.sub || 'Unknown User';

    const roles = payload.roles || payload.authorities || 'USER';
    const formattedRoles = Array.isArray(roles) ? roles.join(', ') : roles;

    identitySpan.innerText = `Logged in as: ${username} (${formattedRoles})`;
}

function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
}

document.addEventListener("DOMContentLoaded", hydrateNavbar);