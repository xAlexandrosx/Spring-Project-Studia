const token = localStorage.getItem('jwt_token');

if (!token) {
    window.location.href = '/login';
}

let allUsers = [];

document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
});

async function loadUsers() {
    try {
        const res = await fetch('/api/users', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
            allUsers = await res.json();
            renderUsersTable();
        }
    } catch (err) {
        console.error("Failed fetching users array:", err);
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
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

    const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert("User records modified successfully!");
        loadUsers();
    }
}

async function deleteUser(id) {
    if (!confirm("Permanently remove user account?")) return;
    const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
        loadUsers();
    }
}

async function changeUserRole(userId, dropdownElement) {
    const targetRoleId = dropdownElement.value;
    const fallbackId = targetRoleId === "1" ? "3" : "1";

    await fetch(`/api/users/removeRole/${userId}/${fallbackId}`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const res = await fetch(`/api/users/addRole/${userId}/${targetRoleId}`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.ok) {
        alert("Role update saved.");
    }
}

function inspectUserNotes(userId, usernameValue) {
    window.location.href = `/admin-usernotes-preview?userId=${userId}&username=${usernameValue}`;
}

function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
}