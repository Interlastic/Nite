async function getPage(specificTitle = null) {
    let url = "https://en.wikipedia.org/api/rest_v1/page/random/summary";
    if (specificTitle) {
        url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(specificTitle)}`;
    }

    const wiki_summary = await fetch(url);
    const data = await wiki_summary.json();
    const title = data.displaytitle;
    const urlTitle = data.titles.canonical; // Use canonical title for HTML fetch

    const page = await fetch("https://en.wikipedia.org/api/rest_v1/page/html/" + encodeURIComponent(urlTitle));
    let pageData = await page.text();

    // Fix Protocol-Relative (//)
    pageData = pageData.replaceAll('src="//', 'src="https://');
    pageData = pageData.replaceAll('srcset="//', 'srcset="https://');
    pageData = pageData.replaceAll('href="//', 'href="https://');

    // Fix Rooted (/)
    pageData = pageData.replaceAll('src="/', 'src="https://en.wikipedia.org/');
    pageData = pageData.replaceAll('href="/', 'href="https://en.wikipedia.org/');

    return { html: pageData, title: title, rawTitle: data.title };
}

async function createCard(specificTitle = null, sourceTitle = null, insertAfterElement = null) {
    const { html, title, rawTitle } = await getPage(specificTitle);
    const css = await fetch("styles_inject.css").then(r => r.text());

    const card = document.createElement("div");
    card.className = "e2";

    const shadow = card.attachShadow({ mode: "open" });

    shadow.innerHTML = `
        <style>${css}</style>
        ${sourceTitle ? `<div class="source-badge">Linked from: ${sourceTitle}</div>` : ""}
        <div class="article-header">
            <h1 class="article-title">${title}</h1>
        </div>
        <div class="content">${html}</div>
        <div class="hint-text">Tap to read</div>
    `;

    // Intercept links
    shadow.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (link) {
            const href = link.getAttribute("href");
            if (!href) return;

            // Resolve relative links against Wikipedia base
            // Wikipedia HTML usually has links like ./Article_Name
            try {
                const wikiBase = "https://en.wikipedia.org/wiki/";
                const url = new URL(href, wikiBase);

                if (url.hostname === "en.wikipedia.org" && url.pathname.startsWith("/wiki/")) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Extract title from /wiki/Title
                    const newTitle = decodeURIComponent(url.pathname.split("/wiki/")[1]);
                    createCard(newTitle, rawTitle, card);
                    return;
                }
            } catch (err) {
                console.error("Link resolution error:", err);
            }
        }

        // Toggle expansion if not intercepted or if clicking elsewhere
        card.classList.toggle("expanded");
    });

    if (insertAfterElement) {
        insertAfterElement.after(card);
        // Scroll to the new card
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        document.getElementById("div1").appendChild(card);
    }
}

(async function () {
    // Load 3 cards to start
    await createCard();
    await createCard();
    await createCard();
})();

window.addEventListener("scroll", () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        createCard();
    }
});