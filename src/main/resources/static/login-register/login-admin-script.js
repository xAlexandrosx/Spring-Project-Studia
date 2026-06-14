document.getElementById('admin-login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('login-username').value;
    const passwordInput = document.getElementById('login-password').value;
    const messageDisplay = document.getElementById('login-message');

    messageDisplay.style.color = "blue";
    messageDisplay.innerText = "Processing admin credentials transaction...";

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: usernameInput, password: passwordInput })
        });

        if (response.ok) {
            const data = await response.json();

            localStorage.setItem('jwt_token', data.token);

            messageDisplay.style.color = "green";
            messageDisplay.innerText = "Admin Authorized. Shifting to system terminal control panel...";

            setTimeout(() => {
                window.location.href = '/admin-panel';
            }, 1000);
        } else {
            messageDisplay.style.color = "red";
            messageDisplay.innerText = `Authentication Failed. Status Code: ${response.status}`;
        }
    } catch (err) {
        messageDisplay.style.color = "red";
        messageDisplay.innerText = `Network connection failure error: ${err.message}`;
    }
});