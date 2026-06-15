const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');
const username = urlParams.get('username') || "User";

function getCsrfConfig() {
    const tokenEl = document.querySelector('meta[name="_csrf"]');
    const headerEl = document.querySelector('meta[name="_csrf_header"]');

    const headers = { 'Content-Type': 'application/json' };

    if (tokenEl && headerEl) {
        headers[headerEl.content] = tokenEl.content;
    }

    return headers;
}

document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById('profile-table-body');
    if (!tbody) return;

    if (!userId) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:red;">Error: No userId specified in URL parameters.</td></tr>`;
        return;
    }

    const titleEl = document.getElementById('profile-title');
    if (titleEl) {
        titleEl.innerText = `Notes profile collection for: ${username}`;
    }

    loadUserNotes();
});

async function loadUserNotes() {
    const tbody = document.getElementById('profile-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`/api/notes/admin/${userId}`, { method: 'GET' });

        if (res.ok) {
            const notes = await res.json();
            if (notes.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5">This specific user hasn't written any database records yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = notes.map(note => `
                <tr>
                    <td>${note.id}</td>
                    <td><span id="profile-title-${note.id}" contenteditable="true">${note.title || ''}</span></td>
                    <td><span id="profile-content-${note.id}" contenteditable="true">${note.content || ''}</span></td>
                    <td>
                        <select onchange="changeVisibility(${note.id}, this.value)">
                            <option value="1" ${note.shared === 1 ? 'selected' : ''}>Public</option>
                            <option value="0" ${note.shared !== 1 ? 'selected' : ''}>Private</option>
                        </select>
                    </td>
                    <td>
                        <button onclick="saveProfileNoteChanges(${note.id})">Save</button>
                        <button onclick="purgeProfileNote(${note.id})">Remove</button>
                    </td>
                </tr>
            `).join('');
        } else if (res.status === 401 || res.status === 403) {
            window.location.href = '/login';
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:red;">Failed reading collections.</td></tr>`;
        console.error("Fetch operational error:", err);
    }
}

async function saveProfileNoteChanges(noteId) {
    const payload = {
        title: document.getElementById(`profile-title-${noteId}`).innerText.trim(),
        content: document.getElementById(`profile-content-${noteId}`).innerText.trim()
    };

    try {
        const res = await fetch(`/api/notes/admin/${noteId}`, {
            method: 'PUT',
            headers: getCsrfConfig(),
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Modifications stored successfully.");
            loadUserNotes();
        } else {
            console.error("Admin update override failed. Status:", res.status);
        }
    } catch (err) {
        console.error("Error executing admin note save override:", err);
    }
}

async function purgeProfileNote(noteId) {
    if (!confirm("Delete note?")) return;

    try {
        const res = await fetch(`/api/notes/admin/${noteId}`, {
            method: 'DELETE',
            headers: getCsrfConfig()
        });

        if (res.ok) {
            loadUserNotes();
        } else {
            console.error("Admin delete purge execution failed. Status:", res.status);
        }
    } catch (err) {
        console.error("Error executing admin note drop:", err);
    }
}

async function changeVisibility(noteId, statusValue) {
    try {
        const res = await fetch(`/api/notes/admin/setShare/${noteId}/${statusValue}`, {
            method: 'PUT',
            headers: getCsrfConfig()
        });

        if (!res.ok) {
            console.error("Failed setting share visibility. Status:", res.status);
        }
    } catch (err) {
        console.error("Error updating visibility state:", err);
    }
}

function goBack() {
    window.location.href = '/admin-panel';
}

async function logout() {
    try {
        await fetch('/auth/logout', {
            method: 'POST',
            headers: getCsrfConfig()
        });
        window.location.href = '/login?logout';
    } catch (err) {
        console.error("Logout transaction network routing failure:", err);
        window.location.href = '/login';
    }
}