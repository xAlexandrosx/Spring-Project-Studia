const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('id');

let isNotePublic = false;

let categoryNamesMap = new Map();

const getHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token && token !== "null" && token !== "undefined") {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

document.addEventListener("DOMContentLoaded", async () => {
    const statusMsg = document.getElementById('viewer-status-msg');

    if (!noteId) {
        statusMsg.style.color = "red";
        statusMsg.innerText = "Error: No target record ID provided in URL parameters.";
        return;
    }

    document.getElementById('edit-btn').onclick = () => {
        window.location.href = `/note-editor?id=${noteId}`;
    };

    document.getElementById('delete-btn').onclick = deleteThisNote;
    document.getElementById('share-btn').onclick = generateShareLink;

    await fetchAndMapCategoryNames();

    await loadNoteData(noteId);
});

async function fetchAndMapCategoryNames() {
    try {
        const response = await fetch('/api/categories', {
            method: 'GET',
            headers: getHeaders()
        });

        if (response.ok) {
            const categories = await response.json();
            categoryNamesMap.clear();

            categories.forEach(cat => {
                categoryNamesMap.set(cat.id, cat.name);
            });
        }
    } catch (err) {
        console.error("Could not populate viewer translation dictionary map:", err);
    }
}

async function loadNoteData(id) {
    const statusMsg = document.getElementById('viewer-status-msg');
    try {
        const response = await fetch(`/api/notes/${id}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (response.ok) {
            const note = await response.json();

            isNotePublic = note.shared;

            document.getElementById('note-title').innerText = note.title || 'Untitled Record';
            document.getElementById('note-content').innerText = note.content || '';
            document.getElementById('note-meta').innerText = `Record ID: #${note.id} | Added on: ${note.dateAdded || 'N/A'}`;

            const badge = document.getElementById('visibility-badge');
            if (isNotePublic) {
                badge.innerText = "PUBLIC";
                badge.className = "badge badge-public";
            } else {
                badge.innerText = "PRIVATE";
                badge.className = "badge badge-private";
            }

            let formattedCategories = 'None';
            if (Array.isArray(note.categoryIds) && note.categoryIds.length > 0) {
                const namesArray = note.categoryIds
                    .map(catId => categoryNamesMap.get(catId) || `ID #${catId}`)
                    .filter(Boolean);

                if (namesArray.length > 0) {
                    formattedCategories = namesArray.join(', ');
                }
            }

            document.getElementById('categories-list').innerText = formattedCategories;

        } else {
            statusMsg.style.color = 'red';
            statusMsg.innerText = `Fetch failed. Endpoint processing error: ${response.status}`;
        }
    } catch (err) {
        statusMsg.style.color = 'red';
        statusMsg.innerText = `Network/CORS operational break: ${err.message}`;
    }
}

async function deleteThisNote() {
    if (!confirm("Are you sure you want to execute DELETE for this note item?")) return;

    const statusMsg = document.getElementById('viewer-status-msg');
    try {
        const response = await fetch(`/api/notes/${noteId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.ok) {
            statusMsg.style.color = "green";
            statusMsg.innerText = "Deleted. Redirecting to system dashboard file index...";
            setTimeout(() => {
                window.location.href = '/my-notes';
            }, 1000);
        } else {
            statusMsg.style.color = "red";
            statusMsg.innerText = `Delete transaction failed on server. Status: ${response.status}`;
        }
    } catch (err) {
        console.error(err);
    }
}

function generateShareLink() {
    const statusMsg = document.getElementById('viewer-status-msg');

    if (!isNotePublic) {
        statusMsg.style.color = "red";
        statusMsg.innerText = "Error: Cannot generate share link for PRIVATE notes. Change visibility to public first.";
        return;
    }

    const absoluteShareUrl = `${window.location.origin}${window.location.pathname}?id=${noteId}`;

    navigator.clipboard.writeText(absoluteShareUrl)
        .then(() => {
            statusMsg.style.color = "green";
            statusMsg.innerText = "Copied link to clipboard! Anyone logged in can access this explicit endpoint file route.";
        })
        .catch(err => {
            statusMsg.style.color = "blue";
            statusMsg.innerText = `Link: ${absoluteShareUrl}`;
        });
}