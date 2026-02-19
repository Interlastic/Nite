async function fetchWikipediaArticle(searchTitle = null) {
    let summaryEndpoint = "https://en.wikipedia.org/api/rest_v1/page/random/summary";
    if (searchTitle) {
        summaryEndpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTitle)}`;
    }

    const summaryResponse = await fetch(summaryEndpoint);
    const summaryData = await summaryResponse.json();
    const displayTitle = summaryData.displaytitle;
    const canonicalTitle = summaryData.titles.canonical;

    const contentResponse = await fetch("https://en.wikipedia.org/api/rest_v1/page/html/" + encodeURIComponent(canonicalTitle));
    let htmlContent = await contentResponse.text();

    htmlContent = htmlContent.replaceAll('src="//', 'src="https://');
    htmlContent = htmlContent.replaceAll('srcset="//', 'srcset="https://');
    htmlContent = htmlContent.replaceAll('href="//', 'href="https://');

    htmlContent = htmlContent.replaceAll('src="/', 'src="https://en.wikipedia.org/');
    htmlContent = htmlContent.replaceAll('href="/', 'href="https://en.wikipedia.org/');

    return {
        html: htmlContent,
        displayText: displayTitle,
        internalTitle: summaryData.title
    };
}

async function renderNewArticleCard(searchTitle = null, sourceArticleTitle = null, anchorElement = null) {
    const { html, displayText, internalTitle } = await fetchWikipediaArticle(searchTitle);
    const stylesResponse = await fetch("styles_inject.css");
    const CSSStyles = await stylesResponse.text();

    const articleCard = document.createElement("div");
    articleCard.className = "e2";

    const cardShadow = articleCard.attachShadow({ mode: "open" });

    cardShadow.innerHTML = `
        <style>${CSSStyles}</style>
        ${sourceArticleTitle ? `<div class="source-badge">Linked from: ${sourceArticleTitle}</div>` : ""}
        <div class="article-header">
            <h1 class="article-title">${displayText}</h1>
        </div>
        <div class="content">${html}</div>
        <div class="hint-text">Tap to read</div>
    `;

    cardShadow.addEventListener("click", (event) => {
        const potentialLink = event.target.closest("a");
        if (potentialLink) {
            const linkHref = potentialLink.getAttribute("href");
            if (!linkHref) return;

            try {
                const wikipediaBase = "https://en.wikipedia.org/wiki/";
                const resolvedUrl = new URL(linkHref, wikipediaBase);

                if (resolvedUrl.hostname === "en.wikipedia.org" && resolvedUrl.pathname.startsWith("/wiki/")) {
                    event.preventDefault();
                    event.stopPropagation();

                    const newArticleTitle = decodeURIComponent(resolvedUrl.pathname.split("/wiki/")[1]);
                    renderNewArticleCard(newArticleTitle, internalTitle, articleCard);
                    return;
                }
            } catch (error) {
                console.error("Failed to resolve Wikipedia link:", error);
            }
        }

        articleCard.classList.toggle("expanded");
    });

    if (anchorElement) {
        anchorElement.after(articleCard);
        articleCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        document.getElementById("div1").appendChild(articleCard);
    }
}

(async function startFeed() {
    await renderNewArticleCard();
    await renderNewArticleCard();
    await renderNewArticleCard();
})();

window.addEventListener("scroll", () => {
    let hasReachedBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500;
    if (hasReachedBottom) {
        renderNewArticleCard();
    }
});