document.getElementById('admin-login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('login-username').value;
    const passwordInput = document.getElementById('login-password').value;
    const messageDisplay = document.getElementById('login-message');

    if (!messageDisplay) return;

    messageDisplay.style.color = "blue";
    messageDisplay.innerText = "Processing admin credentials transaction...";

    const formData = new URLSearchParams();
    formData.append('login', usernameInput.trim());
    formData.append('password', passwordInput);

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        if (response.ok) {

            messageDisplay.style.color = "green";
            messageDisplay.innerText = "Admin Authorized. Shifting to system terminal control panel...";

            setTimeout(() => {
                window.location.href = '/admin-panel';
            }, 1000);
        } else {
            messageDisplay.style.color = "red";
            messageDisplay.innerText = `Authentication Failed. Invalid admin credentials or privilege structure.`;
        }
    } catch (err) {
        messageDisplay.style.color = "red";
        messageDisplay.innerText = `Network connection failure error: ${err.message}`;
    }
});