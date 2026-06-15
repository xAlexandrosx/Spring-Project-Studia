let categoriesCache = [];

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
    const sortSelect = document.getElementById('sort-select');
    const createForm = document.getElementById('create-category-form');

    if (sortSelect) sortSelect.addEventListener('change', renderCategories);
    if (createForm) createForm.addEventListener('submit', handleCreateCategory);

    fetchCategories();
});

async function fetchCategories() {
    const statusMsg = document.getElementById('categories-status-msg');
    try {
        const response = await fetch('/api/categories', { method: 'GET' });

        if (response.ok) {
            const categories = await response.json();

            categoriesCache = await Promise.all(categories.map(async (category) => {
                try {
                    const notesResponse = await fetch(`/api/notes/by-categories?ids=${category.id}`, {
                        method: 'GET'
                    });

                    if (notesResponse.ok) {
                        const notesList = await notesResponse.json();
                        category.noteCount = notesList.length;
                    } else {
                        category.noteCount = 0;
                    }
                } catch (err) {
                    console.error(`Failed tracking size for category #${category.id}:`, err);
                    category.noteCount = 0;
                }
                return category;
            }));

            renderCategories();
        } else if (response.status === 401 || response.status === 403) {
            window.location.href = '/login';
        } else {
            statusMsg.innerText = `Failed loading records table metrics. Status: ${response.status}`;
        }
    } catch (err) {
        if (statusMsg) {
            statusMsg.innerText = `Network operational connection broke down: ${err.message}`;
        }
    }
}

function renderCategories() {
    const listContainer = document.getElementById('categories-list');
    const sortSelect = document.getElementById('sort-select');
    const statusMsg = document.getElementById('categories-status-msg');

    if (!listContainer || !sortSelect) return;
    if (statusMsg) statusMsg.innerText = "";

    if (categoriesCache.length === 0) {
        listContainer.innerHTML = `<li class="empty-msg">No categories created yet. Add one above!</li>`;
        return;
    }

    let sortedData = [...categoriesCache];
    const sortBy = sortSelect.value;

    if (sortBy === 'alphabetical') {
        sortedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === 'popularity') {
        sortedData.sort((a, b) => (b.noteCount || 0) - (a.noteCount || 0));
    }

    listContainer.innerHTML = sortedData.map(category => {
        const count = category.noteCount || 0;
        return `
            <li class="category-item" data-id="${category.id}">
                <div class="category-info">
                    <span class="category-name">${escapeHtml(category.name)}</span>
                    <span class="category-badge">${count} ${count === 1 ? 'note' : 'notes'}</span>
                </div>
                <div class="item-actions">
                    <button class="action-btn view-btn" onclick="filterNotesByCategoryId(${category.id})">View Notes</button>
                    <button class="action-btn edit-btn" onclick="editCategoryName(${category.id}, '${escapeHtml(category.name)}')">Rename</button>
                    <button class="action-btn delete-btn" onclick="deleteCategory(${category.id})">Delete</button>
                </div>
            </li>
        `;
    }).join('');
}

async function handleCreateCategory(e) {
    e.preventDefault();
    const inputElement = document.getElementById('new-category-name');
    if (!inputElement) return;

    const nameValue = inputElement.value.trim();
    if (!nameValue) return;

    try {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: getCsrfConfig(),
            body: JSON.stringify({ name: nameValue })
        });

        if (response.ok) {
            inputElement.value = "";
            await fetchCategories();
        }
    } catch (err) {
        console.error("Failed adding element asset entity trace:", err);
    }
}

async function editCategoryName(id, currentName) {
    const newName = prompt(`Modify group structural classification properties:\nChange rename mapping value for "${currentName}" into:`, currentName);
    if (!newName || newName.trim() === "" || newName.trim() === currentName) return;

    try {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: getCsrfConfig(),
            body: JSON.stringify({ name: newName.trim() })
        });

        if (response.ok) {
            await fetchCategories();
        }
    } catch (err) {
        console.error("PUT execution mapping dropped exception payload context:", err);
    }
}

async function deleteCategory(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE',
            headers: getCsrfConfig()
        });

        if (response.ok) {
            await fetchCategories();
        }
    } catch (err) {
        console.error("Purge method invocation error state layout tracking logs:", err);
    }
}

function filterNotesByCategoryId(id) {
    window.location.href = `/my-notes?categoryId=${id}`;
}

function escapeHtml(str) {
    return str.toString()
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}