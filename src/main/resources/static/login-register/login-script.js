document.addEventListener("DOMContentLoaded", () => {
    const birthdayInput = document.getElementById('reg-birthday');
    if (birthdayInput) {
        const today = new Date();
        const cutoffYear = today.getFullYear() - 18;
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        birthdayInput.max = `${cutoffYear}-${month}-${day}`;
    }
});

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const msgElement = document.getElementById('login-message');
    msgElement.style.color = "blue";
    msgElement.innerText = "Sending request...";

    const payload = {
        login: document.getElementById('login-username').value,
        password: document.getElementById('login-password').value
    };

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('jwt_token', data.token);

            msgElement.style.color = "green";
            msgElement.innerText = "Success! Token stored. Redirecting to dashboard...";
            console.log("JWT Token:", data.token);

            setTimeout(() => {
                window.location.href = '/my-notes';
            }, 800);
        } else {
            msgElement.style.color = "red";
            msgElement.innerText = "Failed. Status: " + response.status;
        }
    } catch (error) {
        msgElement.style.color = "red";
        msgElement.innerText = "Network Error: " + error.message;
    }
});

document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const msgElement = document.getElementById('register-message');
    msgElement.style.color = "blue";
    msgElement.innerText = "Sending request...";

    document.querySelectorAll('.validation-error-span').forEach(span => span.innerText = "");

    const payload = {
        login: document.getElementById('reg-username').value,
        password: document.getElementById('reg-password').value,
        repeatPassword: document.getElementById('reg-password').value,
        firstName: document.getElementById('reg-firstname').value,
        lastName: document.getElementById('reg-lastname').value,
        birthday: document.getElementById('reg-birthday').value
    };

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            msgElement.style.color = "green";
            msgElement.innerText = "User registered successfully!";
            document.getElementById('register-form').reset();
        } else if (response.status === 400) {
            const errorData = await response.json();

            msgElement.style.color = "red";
            msgElement.innerText = "Registration failed.";

            if (errorData.errors && Array.isArray(errorData.errors)) {
                errorData.errors.forEach(err => {
                    if (err.field === 'login') {
                        document.getElementById('error-login').innerText = err.defaultMessage;
                    }
                    if (err.field === 'password') {
                        document.getElementById('error-password').innerText = err.defaultMessage;
                    }
                    if (err.field === 'birthday') {
                        document.getElementById('error-birthday').innerText = err.defaultMessage;
                    }
                });
            }
        } else {
            msgElement.style.color = "red";
            msgElement.innerText = "Registration failed. Status: " + response.status;
        }
    } catch (error) {
        msgElement.style.color = "red";
        msgElement.innerText = "Network Error: " + error.message;
    }
});