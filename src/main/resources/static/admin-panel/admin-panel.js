function getCsrfConfig() {
    const tokenEl = document.querySelector('meta[name="_csrf"]');
    const headerEl = document.querySelector('meta[name="_csrf_header"]');

    const headers = { 'Content-Type': 'application/json' };

    if (tokenEl && headerEl) {
        headers[headerEl.content] = tokenEl.content;
    }

    return headers;
}

let allUsers = [];

document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
});

async function loadUsers() {
    try {
        const res = await fetch('/api/users', { method: 'GET' });

        if (res.ok) {
            allUsers = await res.json();
            renderUsersTable();
        } else if (res.status === 401 || res.status === 403) {
            window.location.href = '/login';
        }
    } catch (err) {
        console.error("Failed fetching users array:", err);
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = allUsers.map(user => {
        const loginName = user.login || user.username || "N/A";
        const fName = user.firstName || "";
        const lName = user.lastName || "";
        const bday = user.birthday || "N/A";

        return `
            <tr>
                <td>${user.id}</td>
                <td><span id="user-login-${user.id}" contenteditable="true">${loginName}</span></td>
                <td><span id="user-fname-${user.id}" contenteditable="true">${fName}</span></td>
                <td><span id="user-lname-${user.id}" contenteditable="true">${lName}</span></td>
                <td>${bday}</td>
                <td>
                    <select id="user-role-${user.id}" onchange="changeUserRole(${user.id}, this)">
                        <option value="1">Full User</option>
                        <option value="3">Limited User</option>
                    </select>
                </td>
                <td>
                    <button onclick="saveUser(${user.id}, '${bday}')">Save</button>
                    <button onclick="deleteUser(${user.id})">Delete</button>
                    <button onclick="inspectUserNotes(${user.id}, '${loginName}')">View Notes</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function saveUser(id, birthdayValue) {
    const payload = {
        login: document.getElementById(`user-login-${id}`).innerText.trim(),
        firstName: document.getElementById(`user-fname-${id}`).innerText.trim(),
        lastName: document.getElementById(`user-lname-${id}`).innerText.trim(),
        birthday: birthdayValue,
        password: "",
        repeatPassword: ""
    };

    try {
        const res = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: getCsrfConfig(),
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("User records modified successfully!");
            loadUsers();
        } else {
            console.error("Failed to update user. Status:", res.status);
        }
    } catch (err) {
        console.error("Error during user save transaction:", err);
    }
}

async function deleteUser(id) {
    if (!confirm("Permanently remove user account?")) return;

    try {
        const res = await fetch(`/api/users/${id}`, {
            method: 'DELETE',
            headers: getCsrfConfig()
        });

        if (res.ok) {
            loadUsers();
        }
    } catch (err) {
        console.error("Error during user deletion execution:", err);
    }
}

async function changeUserRole(userId, dropdownElement) {
    const targetRoleId = dropdownElement.value;
    const fallbackId = targetRoleId === "1" ? "3" : "1";

    try {
        await fetch(`/api/users/removeRole/${userId}/${fallbackId}`, {
            method: 'PUT',
            headers: getCsrfConfig()
        });

        const res = await fetch(`/api/users/addRole/${userId}/${targetRoleId}`, {
            method: 'PUT',
            headers: getCsrfConfig()
        });

        if (res.ok) {
            alert("Role update saved.");
        }
    } catch (err) {
        console.error("Error altering user authorization privileges:", err);
    }
}

function inspectUserNotes(userId, usernameValue) {
    window.location.href = `/admin-usernotes-preview?userId=${userId}&username=${encodeURIComponent(usernameValue)}`;
}

async function logout() {
    try {
        const res = await fetch('/auth/logout', {
            method: 'POST',
            headers: getCsrfConfig()
        });

        window.location.href = '/login?logout';
    } catch (err) {
        console.error("Error executing system logout routing:", err);
        window.location.href = '/login';
    }
}