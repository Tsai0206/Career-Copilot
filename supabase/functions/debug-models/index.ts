
Deno.serve(async (req) => {
    const apiKey = 'AIzaSyA7XoKI9pUgvgh2fCE05bkrQAlttm3LAso';
    try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const data = await resp.json();
        return new Response(JSON.stringify(data, null, 2), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
})
