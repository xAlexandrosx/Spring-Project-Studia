let categoryNamesMap = new Map();
let globalNotesCache = [];

document.addEventListener("DOMContentLoaded", initializeDashboard);

async function initializeDashboard() {
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');

    if (searchInput) searchInput.addEventListener('input', processFilterAndRender);
    if (sortSelect) sortSelect.addEventListener('change', processFilterAndRender);

    await fetchAndMapCategoryNames();
    await fetchUserNotes();
}

async function fetchAndMapCategoryNames() {
    try {
        const response = await fetch('/api/categories', { method: 'GET' });

        if (response.ok) {
            const categories = await response.json();
            categoryNamesMap.clear();

            categories.forEach(cat => {
                categoryNamesMap.set(cat.id, cat.name);
            });
        } else if (response.status === 401 || response.status === 403) {
            window.location.href = '/login';
        }
    } catch (err) {
        console.error("Could not pre-populate dashboard category map lookup references:", err);
    }
}

async function fetchUserNotes() {
    const statusMsg = document.getElementById('dashboard-status-msg');

    try {
        const dashboardUrlParams = new URLSearchParams(window.location.search);
        const filterCategoryId = dashboardUrlParams.get('categoryId');

        const targetFetchUrl = filterCategoryId
            ? `/api/notes/by-categories?ids=${filterCategoryId}`
            : '/api/notes';

        const response = await fetch(targetFetchUrl, { method: 'GET' });

        if (response.ok) {
            globalNotesCache = await response.json();
            if (statusMsg) statusMsg.innerText = "";

            processFilterAndRender();
        } else if (response.status === 401 || response.status === 403) {
            window.location.href = '/login';
        } else {
            if (statusMsg) {
                statusMsg.style.color = "red";
                statusMsg.innerText = `API endpoint error response failure. Status Code: ${response.status}`;
            }
        }
    } catch (err) {
        if (statusMsg) {
            statusMsg.style.color = "red";
            statusMsg.innerText = `Network routing structural failure error state: ${err.message}`;
        }
    }
}

function processFilterAndRender() {
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const statusMsg = document.getElementById('dashboard-status-msg');
    const gridContainer = document.getElementById('notes-grid');

    if (!gridContainer || !searchInput || !sortSelect) return;

    const query = searchInput.value.toLowerCase().trim();
    const sortBy = sortSelect.value;

    if (statusMsg) statusMsg.innerText = "";

    let processedData = globalNotesCache.map(note => {
        let textTags = '';
        if (Array.isArray(note.categoryIds) && note.categoryIds.length > 0) {
            textTags = note.categoryIds
                .map(id => categoryNamesMap.get(id) || '')
                .filter(Boolean)
                .join(', ');
        }
        return { ...note, computedTagsString: textTags };
    });

    if (query !== "") {
        processedData = processedData.filter(note => {
            const titleMatch = (note.title || '').toLowerCase().includes(query);
            const tagMatch = note.computedTagsString.toLowerCase().includes(query);
            return titleMatch || tagMatch;
        });
    }

    processedData.sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        const dateA = a.dateAdded ? new Date(a.dateAdded) : new Date(0);
        const dateB = b.dateAdded ? new Date(b.dateAdded) : new Date(0);
        const tagA = a.computedTagsString.toLowerCase();
        const tagB = b.computedTagsString.toLowerCase();

        switch (sortBy) {
            case 'title-asc': return titleA.localeCompare(titleB);
            case 'title-desc': return titleB.localeCompare(titleA);
            case 'date-asc': return dateA - dateB;
            case 'date-desc': return dateB - dateA;
            case 'category-asc': return tagA.localeCompare(tagB);
            case 'category-desc': return tagB.localeCompare(tagA);
            default: return 0;
        }
    });

    if (processedData.length === 0) {
        if (statusMsg) statusMsg.innerText = "No matching notes found.";
        gridContainer.innerHTML = "";
    } else {
        if (statusMsg) statusMsg.innerText = "";
        renderDashboardGrid(processedData, gridContainer);
    }
}

function renderDashboardGrid(notes, container) {
    container.innerHTML = notes.map(note => {
        const displayTags = note.computedTagsString || 'None';
        const dateString = note.dateAdded ? new Date(note.dateAdded).toLocaleDateString() : 'N/A';

        return `
            <div class="note-card">
                <div>
                    <h3 class="card-title">${escapeHtml(note.title || 'Untitled Note')}</h3>
                    <div class="card-meta">Added: ${dateString}</div>
                    <div class="card-categories"><strong>Tags:</strong> ${escapeHtml(displayTags)}</div>
                </div>
                <a href="/note-viewer?id=${note.id}" class="view-link">Open Note &rarr;</a>
            </div>
        `;
    }).join('');
}

function escapeHtml(str) {
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}