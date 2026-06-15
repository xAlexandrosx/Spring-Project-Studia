const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('id');

let isNotePublic = false;
let categoryNamesMap = new Map();

function getCsrfConfig() {
    const tokenEl = document.querySelector('meta[name="_csrf"]');
    const headerEl = document.querySelector('meta[name="_csrf_header"]');

    const headers = { 'Content-Type': 'application/json' };

    if (tokenEl && headerEl) {
        headers[headerEl.content] = tokenEl.content;
    }

    return headers;
}

document.addEventListener("DOMContentLoaded", async () => {
    const statusMsg = document.getElementById('viewer-status-msg');

    if (!noteId) {
        if (statusMsg) {
            statusMsg.style.color = "red";
            statusMsg.innerText = "Error: No target record ID provided in URL parameters.";
        }
        return;
    }

    const editBtn = document.getElementById('edit-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const shareBtn = document.getElementById('share-btn');

    if (editBtn) {
        editBtn.onclick = () => {
            window.location.href = `/note-editor?id=${noteId}`;
        };
    }
    if (deleteBtn) deleteBtn.onclick = deleteThisNote;
    if (shareBtn) shareBtn.onclick = generateShareLink;

    await fetchAndMapCategoryNames();
    await loadNoteData(noteId);
});

async function fetchAndMapCategoryNames() {
    try {
        const response = await fetch('/api/categories', { method: 'GET' });

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
        const response = await fetch(`/api/notes/${id}`, { method: 'GET' });

        if (response.ok) {
            const note = await response.json();

            isNotePublic = note.shared === 1 || note.shared === true;

            const titleEl = document.getElementById('note-title');
            const contentEl = document.getElementById('note-content');
            const metaEl = document.getElementById('note-meta');
            const badge = document.getElementById('visibility-badge');
            const catListEl = document.getElementById('categories-list');

            if (titleEl) titleEl.innerText = note.title || 'Untitled Record';
            if (contentEl) contentEl.innerText = note.content || '';
            if (metaEl) metaEl.innerText = `Record ID: #${note.id} | Added on: ${note.dateAdded || 'N/A'}`;

            if (badge) {
                if (isNotePublic) {
                    badge.innerText = "PUBLIC";
                    badge.className = "badge badge-public";
                } else {
                    badge.innerText = "PRIVATE";
                    badge.className = "badge badge-private";
                }
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

            if (catListEl) catListEl.innerText = formattedCategories;

        } else if (response.status === 401 || response.status === 403) {
            window.location.href = '/login';
        } else {
            if (statusMsg) {
                statusMsg.style.color = 'red';
                statusMsg.innerText = `Fetch failed. Endpoint processing error: ${response.status}`;
            }
        }
    } catch (err) {
        if (statusMsg) {
            statusMsg.style.color = 'red';
            statusMsg.innerText = `Network/CORS operational break: ${err.message}`;
        }
    }
}

async function deleteThisNote() {
    if (!confirm("Are you sure you want to execute DELETE for this note item?")) return;

    const statusMsg = document.getElementById('viewer-status-msg');
    try {
        const response = await fetch(`/api/notes/${noteId}`, {
            method: 'DELETE',
            headers: getCsrfConfig()
        });

        if (response.ok) {
            if (statusMsg) {
                statusMsg.style.color = "green";
                statusMsg.innerText = "Deleted. Redirecting to system dashboard file index...";
            }
            setTimeout(() => {
                window.location.href = '/my-notes';
            }, 1000);
        } else {
            if (statusMsg) {
                statusMsg.style.color = "red";
                statusMsg.innerText = `Delete transaction failed on server. Status: ${response.status}`;
            }
        }
    } catch (err) {
        console.error("Error executing delete verification flow:", err);
    }
}

function generateShareLink() {
    const statusMsg = document.getElementById('viewer-status-msg');

    if (!isNotePublic) {
        if (statusMsg) {
            statusMsg.style.color = "red";
            statusMsg.innerText = "Error: Cannot generate share link for PRIVATE notes. Change visibility to public first.";
        }
        return;
    }

    const absoluteShareUrl = `${window.location.origin}${window.location.pathname}?id=${noteId}`;

    navigator.clipboard.writeText(absoluteShareUrl)
        .then(() => {
            if (statusMsg) {
                statusMsg.style.color = "green";
                statusMsg.innerText = "Copied link to clipboard! Anyone can access this note layout viewer context.";
            }
        })
        .catch(err => {
            if (statusMsg) {
                statusMsg.style.color = "blue";
                statusMsg.innerText = `Link: ${absoluteShareUrl}`;
            }
        });
}