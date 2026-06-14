const token = localStorage.getItem('jwt_token');
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');
const username = urlParams.get('username') || "User";

if (!token) {
    window.location.href = '/login';
}

document.addEventListener("DOMContentLoaded", () => {
    if (!userId) {
        document.getElementById('profile-table-body').innerHTML = `<tr><td colspan="5" style="color:red;">Error: No userId specified in URL parameters.</td></tr>`;
        return;
    }

    document.getElementById('profile-title').innerText = `Notes profile collection for: ${username}`;
    loadUserNotes();
});

async function loadUserNotes() {
    const tbody = document.getElementById('profile-table-body');
    try {
        const res = await fetch(`/api/notes/admin/${userId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
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
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:red;">Failed reading collections.</td></tr>`;
    }
}

async function saveProfileNoteChanges(noteId) {
    const payload = {
        title: document.getElementById(`profile-title-${noteId}`).innerText.trim(),
        content: document.getElementById(`profile-content-${noteId}`).innerText.trim()
    };
    const res = await fetch(`/api/notes/admin/${noteId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (res.ok) {
        alert("Modifications stored successfully.");
        loadUserNotes();
    }
}

async function purgeProfileNote(noteId) {
    if (!confirm("Delete note?")) return;
    const res = await fetch(`/api/notes/admin/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
        loadUserNotes();
    }
}

async function changeVisibility(noteId, statusValue) {
    await fetch(`/api/notes/admin/setShare/${noteId}/${statusValue}`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token }
    });
}

function goBack() {
    window.location.href = '/admin-panel';
}

function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
}