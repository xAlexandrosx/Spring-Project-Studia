const token = localStorage.getItem('jwt_token');
if (!token) window.location.href = '/login';

// --- Extract Claims (Names) from JWT Token ---
function decodeJwtPayload() {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (e) {
        return {};
    }
}

const jwtPayload = decodeJwtPayload();
const userFirstName = jwtPayload.firstName || jwtPayload.first_name || jwtPayload.sub || 'User';
const userLastName = jwtPayload.lastName || jwtPayload.last_name || '';

let activeNotes = [];
let dynamicGlobalCategories = [];
let targetedNoteId = null;
let currentEditingCategoryIds = [];
let isCurrentlyEditing = false;

let originalTitle = "";
let originalContent = "";
let originalCategoryIds = [];
let currentTab = "my";

// --- 1. Hydration Handlers ---
async function fetchSystemCategories() {
    try {
        const response = await fetch('/api/categories', { headers: { 'Authorization': 'Bearer ' + token } });
        if (response.ok) dynamicGlobalCategories = await response.json();
    } catch (err) { console.error("Could not populate global category definitions.", err); }
}

async function loadDashboard() {
    await fetchSystemCategories();

    const endpoint = currentTab === 'shared' ? '/api/notes/shared' : '/api/notes';
    try {
        const response = await fetch(endpoint, { headers: { 'Authorization': 'Bearer ' + token } });
        if (response.ok) {
            activeNotes = await response.json();
            handleSearchAndSortFilter();
        } else {
            document.getElementById('notes-grid').innerHTML = '<p style="color:red;">Session expired. Please log in again.</p>';
        }
    } catch (err) {
        console.error("Failed to load notes endpoint:", err);
    }
}

function displayUserIdentityLabel() {
    const logoutBtn = document.getElementById('logout-btn') || document.querySelector('button[onclick="logout()"]');
    if (logoutBtn) {
        if (!document.getElementById('jwt-user-profile-badge')) {
            const label = document.createElement('span');
            label.id = 'jwt-user-profile-badge';
            label.style.marginRight = '15px';
            label.style.fontSize = '14px';
            label.style.color = '#555';
            label.style.fontWeight = '500';
            label.style.alignSelf = 'center';
            label.innerText = `Logged in as: ${userFirstName} ${userLastName}`.trim();

            logoutBtn.parentNode.insertBefore(label, logoutBtn);
        }
    }
}

function toggleDashboardTab(tabName) {
    currentTab = tabName;

    const myTabEl = document.getElementById("tab-my-notes");
    const sharedTabEl = document.getElementById("tab-shared-notes");
    const newNoteBtn = document.getElementById("nav-new-note-btn");
    const deleteBtn = document.getElementById("delete-selected-btn");

    if (currentTab === "shared") {
        if(myTabEl) { myTabEl.style.fontWeight = "normal"; myTabEl.style.borderBottom = "none"; myTabEl.style.color = "#7f8c8d"; }
        if(sharedTabEl) { sharedTabEl.style.fontWeight = "bold"; sharedTabEl.style.borderBottom = "2px solid #008bf8"; sharedTabEl.style.color = "#2c3e50"; }

        if (newNoteBtn) newNoteBtn.style.visibility = "hidden";
        if (deleteBtn) deleteBtn.style.visibility = "hidden";
    } else {
        if(sharedTabEl) { sharedTabEl.style.fontWeight = "normal"; sharedTabEl.style.borderBottom = "none"; sharedTabEl.style.color = "#7f8c8d"; }
        if(myTabEl) { myTabEl.style.fontWeight = "bold"; myTabEl.style.borderBottom = "2px solid #008bf8"; myTabEl.style.color = "#2c3e50"; }

        if (newNoteBtn) newNoteBtn.style.visibility = "visible";
        if (deleteBtn) deleteBtn.style.visibility = "visible";
    }

    switchToDashboard();
}

function handleSearchAndSortFilter() {
    const searchBar = document.getElementById('global-search-bar');
    const sortSelect = document.getElementById('global-sort-select');

    const query = searchBar ? searchBar.value.trim().toLowerCase() : '';
    const sortType = sortSelect ? sortSelect.value : 'date-desc';

    let processedNotes = activeNotes.filter(note => {
        const matchesTitle = note.title && note.title.toLowerCase().includes(query);
        const targetIds = Array.isArray(note.categoryIds) ? note.categoryIds : [];
        const matchesCategory = targetIds.some(id => {
            const match = dynamicGlobalCategories.find(c => c.id === id);
            return match && match.name.toLowerCase().includes(query);
        });
        return matchesTitle || matchesCategory;
    });

    processedNotes.sort((x, y) => {
        if (sortType === 'title-asc') return (x.title || '').localeCompare(y.title || '');
        if (sortType === 'title-desc') return (y.title || '').localeCompare(x.title || '');
        if (sortType === 'date-asc') return new Date(x.dateAdded) - new Date(y.dateAdded);
        return new Date(y.dateAdded) - new Date(x.dateAdded);
    });

    renderNotesGrid(processedNotes);
}

function renderNotesGrid(notes) {
    const grid = document.getElementById('notes-grid');
    if (!grid) return;
    grid.innerHTML = '';

    notes.forEach(note => {
        const targetIds = Array.isArray(note.categoryIds) ? note.categoryIds : [];
        const categoriesHtml = targetIds.map(id => {
            const match = dynamicGlobalCategories.find(c => c.id === id);
            return `<span class="category-badge">${match ? match.name : 'Tag #' + id}</span>`;
        }).join('');

        const checkboxHtml = currentTab === 'my'
            ? `<input type="checkbox" class="note-checkbox" value="${note.id}" onchange="evaluateDeleteButtonState(event)">`
            : '';

        const authorName = note.owner ? `${note.owner.firstName} ${note.owner.lastName}` : 'Unknown';

        grid.innerHTML += `
            <div class="card" onclick="handleCardClick(event, ${note.id})">
                ${checkboxHtml}
                <div class="card-details">
                    <p class="text-title">${note.title || 'Untitled'}</p>
                    <p class="text-author">by ${authorName}</p>
                    <div class="categories-wrapper">${categoriesHtml}</div>
                </div>
                <button class="card-button">More info</button>
            </div>
        `;
    });

    if (currentTab === 'my') {
        grid.innerHTML += `
            <div id="dynamic-creator-card" class="card card-creator" onclick="openFreshNoteEditor()">
                <div><span class="creator-plus">+</span><span class="creator-label">Add Note</span></div>
            </div>
        `;
    }
    evaluateDeleteButtonState();
}

function openFreshNoteEditor() {
    targetedNoteId = null;
    currentEditingCategoryIds = [];
    isCurrentlyEditing = true;

    const titleField = document.getElementById('panel-title');
    const contentField = document.getElementById('panel-content');
    const metaField = document.getElementById('panel-meta');
    const saveBtn = document.getElementById('edit-save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const delBtn = document.getElementById('view-delete-btn');
    const shareBtn = document.getElementById('panel-share-btn');

    if (titleField) {
        titleField.innerText = "Untitled Note";
        titleField.setAttribute('contenteditable', 'true');
        titleField.style.borderBottom = "2px dashed #008bf8";
    }
    if (contentField) {
        contentField.innerText = "Type content here...";
        contentField.setAttribute('contenteditable', 'true');
        contentField.style.border = "2px dashed #008bf8";
        contentField.style.padding = "10px";
        contentField.style.borderRadius = "8px";
    }
    if (metaField) metaField.innerText = `Creating a new note...`;

    if (saveBtn) {
        saveBtn.innerText = "Save";
        saveBtn.style.backgroundColor = "#2ecc71";
        saveBtn.style.display = "inline-block";
    }
    if (cancelBtn) cancelBtn.style.display = "inline-block";
    if (delBtn) delBtn.style.display = "none";
    if (shareBtn) shareBtn.style.display = "none";

    const indicator = document.getElementById('shared-readonly-indicator');
    if (indicator) indicator.style.display = "none";

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.style.opacity = "0.4";
        backBtn.style.pointerEvents = "none";
    }

    renderPillboxInterface('panel-pillbox', 'panel-cat-input', 'panel-dropdown', true);

    const navBar = document.getElementById('navbar-search-sort');
    if (navBar) navBar.style.visibility = 'hidden';

    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('details-view').style.display = 'block';

    if (titleField) {
        titleField.focus();
        document.execCommand('selectAll', false, null);
    }
}

function evaluateDeleteButtonState(event) {
    if(event) event.stopPropagation();
    const deleteBtn = document.getElementById('delete-selected-btn');
    if (deleteBtn) {
        deleteBtn.disabled = currentTab === 'shared' || document.querySelectorAll('.note-checkbox:checked').length === 0;
    }
}

function handleCardClick(event, noteId) {
    if(event.target.closest('.note-checkbox') || event.target.closest('.card-button')) return;
    const note = activeNotes.find(n => n.id === noteId);
    if(!note) return;

    targetedNoteId = noteId;
    currentEditingCategoryIds = Array.isArray(note.categoryIds) ? [...note.categoryIds] : [];
    isCurrentlyEditing = false;
    exitVisualEditState();

    const authorName = note.owner ? `${note.owner.firstName} ${note.owner.lastName}` : 'Unknown';

    document.getElementById('panel-title').innerText = note.title || '';
    document.getElementById('panel-content').innerText = note.content || '';
    document.getElementById('panel-meta').innerText = `Created by ${authorName} | Added: ${new Date(note.dateAdded).toLocaleString()}`;

    renderPillboxInterface('panel-pillbox', 'panel-cat-input', 'panel-dropdown', false);

    const shareBtn = document.getElementById('panel-share-btn');
    const editSaveBtn = document.getElementById('edit-save-btn');
    const viewDeleteBtn = document.getElementById('view-delete-btn');
    const indicator = document.getElementById('shared-readonly-indicator');

    if (currentTab === 'shared') {
        if (shareBtn) shareBtn.style.display = 'none';
        if (editSaveBtn) editSaveBtn.style.display = 'none';
        if (viewDeleteBtn) viewDeleteBtn.style.display = 'none';
        if (indicator) indicator.style.display = 'inline';
    } else {
        if (shareBtn) shareBtn.style.display = 'block';
        if (editSaveBtn) editSaveBtn.style.display = 'inline-block';
        if (viewDeleteBtn) viewDeleteBtn.style.display = 'inline-block';
        if (indicator) indicator.style.display = 'none';
    }

    const navBar = document.getElementById('navbar-search-sort');
    if (navBar) navBar.style.visibility = 'hidden';

    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('details-view').style.display = 'block';
}

function toggleEditMode() {
    if (currentTab === 'shared') return;
    const titleField = document.getElementById('panel-title');
    const contentField = document.getElementById('panel-content');

    if (!titleField || !contentField) return;

    if (titleField.getAttribute('contenteditable') !== 'true') {
        isCurrentlyEditing = true;
        originalTitle = titleField.innerText;
        originalContent = contentField.innerText;
        originalCategoryIds = [...currentEditingCategoryIds];

        titleField.setAttribute('contenteditable', 'true');
        contentField.setAttribute('contenteditable', 'true');
        titleField.style.borderBottom = "2px dashed #008bf8";
        contentField.style.border = "2px dashed #008bf8";
        contentField.style.padding = "10px";
        contentField.style.borderRadius = "8px";
        titleField.focus();

        const saveBtn = document.getElementById('edit-save-btn');
        if (saveBtn) {
            saveBtn.innerText = "Save";
            saveBtn.style.backgroundColor = "#2ecc71";
        }
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) cancelBtn.style.display = "inline-block";

        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.style.opacity = "0.4";
            backBtn.style.pointerEvents = "none";
        }

        renderPillboxInterface('panel-pillbox', 'panel-cat-input', 'panel-dropdown', true);
    } else {
        saveFormChanges(titleField.innerText, contentField.innerText);
    }
}

function cancelEditMode() {
    if(!confirm("Discard changes?")) return;
    isCurrentlyEditing = false;

    if (targetedNoteId === null) {
        switchToDashboard();
    } else {
        document.getElementById('panel-title').innerText = originalTitle;
        document.getElementById('panel-content').innerText = originalContent;
        currentEditingCategoryIds = [...originalCategoryIds];
        exitVisualEditState();
    }
}

function exitVisualEditState() {
    const titleField = document.getElementById('panel-title');
    const contentField = document.getElementById('panel-content');
    if (titleField) {
        titleField.removeAttribute('contenteditable');
        titleField.style.borderBottom = "none";
    }
    if (contentField) {
        contentField.removeAttribute('contenteditable');
        contentField.style.border = "none";
        contentField.style.padding = "0";
    }

    const editSaveBtn = document.getElementById('edit-save-btn');
    if (editSaveBtn) {
        editSaveBtn.innerText = "Update Note";
        editSaveBtn.style.backgroundColor = "#008bf8";
    }
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) cancelBtn.style.display = "none";

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.style.opacity = "1";
        backBtn.style.pointerEvents = "auto";
    }

    renderPillboxInterface('panel-pillbox', 'panel-cat-input', 'panel-dropdown', false);
}

function validateFieldLive(fieldId, hintId, min, max, message) {
    const field = document.getElementById(fieldId);
    const hint = document.getElementById(hintId);
    if (!field) return false;

    const length = field.innerText.trim().length;
    if (length < min || length > max) {
        field.classList.add('invalid-field');
        if (hint) hint.innerText = message;
        return false;
    } else {
        field.classList.remove('invalid-field');
        if (hint) hint.innerText = "";
        return true;
    }
}

async function isTitleDuplicate(title, exclusionId = null) {
    return activeNotes.some(note => note.title && note.title.trim().toLowerCase() === title.trim().toLowerCase() && note.id !== exclusionId);
}

async function saveFormChanges(updatedTitle, updatedContent) {
    if (currentTab === 'shared') return;

    if (!validateFieldLive('panel-title', 'panel-title-hint', 3, 20, 'Title must be between 3 and 20 characters.') ||
        !validateFieldLive('panel-content', 'panel-content-hint', 5, 500, 'Content must be between 5 and 500 characters.')) return;

    if (await isTitleDuplicate(updatedTitle, targetedNoteId)) {
        const titleField = document.getElementById('panel-title');
        if (titleField) titleField.classList.add('invalid-field');
        alert("A note with this title already exists!");
        return;
    }

    let url = '/api/notes';
    let method = 'POST';

    if (targetedNoteId !== null) {
        url = `/api/notes/${targetedNoteId}`;
        method = 'PUT';
    }

    const response = await fetch(url, {
        method: method,
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: updatedTitle.trim(), content: updatedContent.trim(), categoryIds: currentEditingCategoryIds })
    });

    if(response.ok) {
        isCurrentlyEditing = false;
        switchToDashboard();
    } else {
        alert("Failed to save changes. Please try again.");
    }
}

async function deleteCurrentNote() {
    if (currentTab === 'shared' || targetedNoteId === null) return;
    if(!confirm("Delete note?")) return;
    const response = await fetch(`/api/notes/${targetedNoteId}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
    if(response.ok) { isCurrentlyEditing = false; switchToDashboard(); }
}

async function deleteCheckedNotes() {
    if (currentTab === 'shared') return;
    const checkedBoxes = document.querySelectorAll('.note-checkbox:checked');
    if (checkedBoxes.length === 0) return;
    if(!confirm(`Delete these ${checkedBoxes.length} notes?`)) return;
    for (let box of checkedBoxes) {
        await fetch(`/api/notes/${box.value}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
    }
    loadDashboard();
}

async function shareCurrentNote() {
    if (currentTab === 'shared' || !targetedNoteId) return;
    if (!confirm("Share this note with all other users?")) return;

    try {
        const response = await fetch(`/api/notes/${targetedNoteId}/share`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (response.ok) {
            alert("Note successfully shared with everyone in the database!");
        } else {
            alert("Could not process note share configuration.");
        }
    } catch (err) {
        console.error("Error broadcasting share operation:", err);
    }
}

function switchToDashboard() {
    isCurrentlyEditing = false;
    const navBar = document.getElementById('navbar-search-sort');
    if (navBar) navBar.style.visibility = 'visible';
    document.getElementById('details-view').style.display = 'none';
    document.getElementById('dashboard-view').style.display = 'block';
    loadDashboard();
}

function logout() { localStorage.removeItem('jwt_token'); window.location.href = '/login'; }

// --- Notion-style Category Manager Dropdown & Pillbox Handling Engine ---

function focusPillboxInput(inputId) {
    const input = document.getElementById(inputId);
    if (input) input.focus();
}

function showNotionDropdown(dropdownId, inputId) {
    if (!isCurrentlyEditing) return; // Ignore input actions if item context is read-only

    const dropdown = document.getElementById(dropdownId);
    const input = document.getElementById(inputId);
    if (!dropdown) return;

    dropdown.style.display = 'block';
    filterNotionDropdown(dropdownId, input.value);

    // Global hook click events to dismiss picker drop windows cleanly
    const closeDropdownHandler = function(e) {
        if (!e.target.closest('.notion-cat-container')) {
            dropdown.style.display = 'none';
            document.removeEventListener('click', closeDropdownHandler);
        }
    };
    setTimeout(() => document.addEventListener('click', closeDropdownHandler), 50);
}

function filterNotionDropdown(dropdownId, query) {
    const prefix = dropdownId.split('-')[0];
    const listContainer = document.getElementById(`${prefix}-options-list`);
    const createBtn = document.getElementById(`${prefix}-create-btn`);

    if (!listContainer) return;
    listContainer.innerHTML = '';

    const cleanQuery = query.trim().toLowerCase();

    // Isolate active unused choices matching input text filters
    const availableCategories = dynamicGlobalCategories.filter(cat =>
        !currentEditingCategoryIds.includes(cat.id) &&
        cat.name.toLowerCase().includes(cleanQuery)
    );

    availableCategories.forEach(cat => {
        const option = document.createElement('div');
        option.className = 'notion-option';
        option.innerText = cat.name;
        option.onclick = () => selectCategoryOption(prefix, cat.id);
        listContainer.appendChild(option);
    });

    // Handle "On-The-Fly" runtime element creation UI changes
    if (createBtn) {
        const exactMatchExists = dynamicGlobalCategories.some(cat => cat.name.toLowerCase() === cleanQuery);

        if (cleanQuery.length >= 2 && !exactMatchExists) {
            createBtn.style.display = 'block';
            createBtn.innerHTML = `Create "<strong>${query}</strong>"`;
            createBtn.onclick = () => createCategoryOnTheFly(prefix, query);
        } else {
            createBtn.style.display = 'none';
        }
    }
}

function selectCategoryOption(prefix, categoryId) {
    if (!currentEditingCategoryIds.includes(categoryId)) {
        currentEditingCategoryIds.push(categoryId);
    }

    const input = document.getElementById(`${prefix}-cat-input`);
    if (input) input.value = '';

    const dropdown = document.getElementById(`${prefix}-dropdown`);
    if (dropdown) dropdown.style.display = 'none';

    renderPillboxInterface(`${prefix}-pillbox`, `${prefix}-cat-input`, `${prefix}-dropdown`, true);
}

async function createCategoryOnTheFly(prefix, categoryName) {
    try {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: categoryName.trim() })
        });

        if (response.ok) {
            const newCategory = await response.json();

            // Push directly to internal definitions cache
            dynamicGlobalCategories.push(newCategory);

            // Instantly toggle option selection inside operational layout arrays
            selectCategoryOption(prefix, newCategory.id);
        } else {
            alert("Failed to save new category.");
        }
    } catch (err) {
        console.error("Error creating category on the fly:", err);
    }
}

function removePillBadge(event, prefix, categoryId, inputId, dropdownId) {
    if (event) event.stopPropagation();
    currentEditingCategoryIds = currentEditingCategoryIds.filter(id => id !== categoryId);
    renderPillboxInterface(`${prefix}-pillbox`, inputId, dropdownId, isCurrentlyEditing);
}

function renderPillboxInterface(pillboxId, inputId, dropdownId, isEditable = false) {
    const box = document.getElementById(pillboxId);
    if (!box) return;
    const input = document.getElementById(inputId);
    const prefix = pillboxId.split('-')[0];

    box.querySelectorAll('.pill-badge').forEach(el => el.remove());
    if (isEditable) {
        box.classList.remove('disabled-pillbox');
        box.style.pointerEvents = "auto";
        if (input) input.style.display = "inline-block";
    } else {
        box.classList.add('disabled-pillbox');
        box.style.pointerEvents = "none";
        if (input) input.style.display = "none";
    }

    currentEditingCategoryIds.forEach(id => {
        const match = dynamicGlobalCategories.find(c => c.id === id);
        const badge = document.createElement('div');
        badge.className = 'pill-badge';
        badge.innerHTML = `
            <span>${match ? match.name : 'Tag #' + id}</span>
            <span class="pill-remove" onclick="removePillBadge(event, '${prefix}', ${id}, '${inputId}', '${dropdownId}')">×</span>
        `;
        box.insertBefore(badge, input);
    });
}

// --- Initialization Entry Point ---
function init() {
    displayUserIdentityLabel();
    loadDashboard();
}

document.addEventListener("DOMContentLoaded", init);
if (document.readyState === "interactive" || document.readyState === "complete") {
    init();
}