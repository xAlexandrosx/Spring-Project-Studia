const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('id');

let userCategoriesMap = new Map();

const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
    'Content-Type': 'application/json'
});

document.addEventListener("DOMContentLoaded", async () => {
    await loadUserCategoriesCloud();

    if (noteId) {
        document.getElementById('editor-title-display').innerText = `Edit Note #${noteId}`;
        await populateExistingNoteData(noteId);
    }
});

async function loadUserCategoriesCloud() {
    const cloudContainer = document.getElementById('categories-pill-cloud');
    try {
        const response = await fetch('/api/categories', {
            method: 'GET',
            headers: getHeaders()
        });

        if (response.ok) {
            const categories = await response.json();
            userCategoriesMap.clear();

            if (categories.length === 0) {
                cloudContainer.innerHTML = '<span class="empty-text">No categories created yet.</span>';
                return;
            }

            cloudContainer.innerHTML = categories.map(cat => {
                userCategoriesMap.set(cat.name.trim().toLowerCase(), cat.id);
                return `<span class="category-pill" onclick="appendCategoryToInput('${escapeHtml(cat.name)}')">${escapeHtml(cat.name)}</span>`;
            }).join('');
        } else {
            cloudContainer.innerHTML = '<span class="error-text">Failed to fetch available categories.</span>';
        }
    } catch (err) {
        console.error("Categories cloud build failure:", err);
    }
}

function appendCategoryToInput(catName) {
    const input = document.getElementById('note-categories');
    let currentValues = input.value.trim();

    if (currentValues === "") {
        input.value = catName;
    } else {
        const splitValues = currentValues.split(',').map(v => v.trim().toLowerCase());
        if (!splitValues.includes(catName.toLowerCase())) {
            input.value = `${input.value.trim()}, ${catName}`;
        }
    }
    input.focus();
}

async function populateExistingNoteData(id) {
    const statusMsg = document.getElementById('editor-status-msg');
    try {
        const response = await fetch(`/api/notes/${id}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (response.ok) {
            const note = await response.json();

            document.getElementById('note-title').value = note.title || '';
            document.getElementById('note-content').value = note.content || '';
            document.getElementById('note-visibility').value = note.shared === 1 ? 'public' : 'private';

            if (Array.isArray(note.categoryIds) && note.categoryIds.length > 0) {
                const namesArray = [];

                note.categoryIds.forEach(idToFind => {
                    for (let [name, catId] of userCategoriesMap.entries()) {
                        if (catId === idToFind) {
                            // Capitalize first letter neatly for presentation
                            namesArray.push(name.charAt(0).toUpperCase() + name.slice(1));
                            break;
                        }
                    }
                });

                document.getElementById('note-categories').value = namesArray.join(', ');
            }
        } else {
            statusMsg.style.color = 'red';
            statusMsg.innerText = `Could not fetch target record. Status: ${response.status}`;
        }
    } catch (err) {
        console.error("Populate form crash scenario logs:", err);
    }
}

document.getElementById('note-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const statusMsg = document.getElementById('editor-status-msg');
    statusMsg.style.color = "blue";
    statusMsg.innerText = "Processing payload transactions...";

    const categoryRawStr = document.getElementById('note-categories').value;

    const cleanCategoryIds = categoryRawStr.split(',')
        .map(name => name.trim().toLowerCase())
        .filter(name => name.length > 0)
        .map(name => userCategoriesMap.get(name))
        .filter(id => id !== undefined);

    const payload = {
        title: document.getElementById('note-title').value.trim(),
        content: document.getElementById('note-content').value.trim(),
        categoryIds: cleanCategoryIds,
        shared: document.getElementById('note-visibility').value === 'public' ? 1 : 0
    };

    const urlTarget = noteId ? `/api/notes/${noteId}` : '/api/notes';
    const httpVerb = noteId ? 'PUT' : 'POST';

    try {
        const response = await fetch(urlTarget, {
            method: httpVerb,
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            statusMsg.style.color = "green";
            statusMsg.innerText = "Success! Saving content modifications. Redirecting...";
            setTimeout(() => {
                window.location.href = '/my-notes';
            }, 1000);
        } else {
            statusMsg.style.color = "red";
            statusMsg.innerText = `Server error processing update. Backend Status Code: ${response.status}`;
        }
    } catch (err) {
        statusMsg.style.color = "red";
        statusMsg.innerText = `Network connection interrupted routing failure: ${err.message}`;
    }
});

function escapeHtml(str) {
    return str.toString()
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

