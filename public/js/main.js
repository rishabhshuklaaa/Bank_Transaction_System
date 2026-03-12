console.log("Main JS Loaded!");
document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!form.hasAttribute('data-remote')) return;

    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    
    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const res = await fetch(form.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            // Login/Register ke baad dashboard
            if(form.action.toLowerCase().includes('login') || form.action.toLowerCase().includes('register')) {
                window.location.href = '/dashboard';
            } else {
                alert("Success!");
                window.location.reload();
            }
        } else {
            alert("Error: " + (result.message || "Something went wrong"));
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        alert("Network Error - Check Console");
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});