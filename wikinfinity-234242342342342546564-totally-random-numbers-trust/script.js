async function fetchWikipediaArticle(searchTitle = null, language = "en") {
    let summaryEndpoint = "https://" + language + ".wikipedia.org/api/rest_v1/page/random/summary";
    if (searchTitle) {
        summaryEndpoint = "https://" + language + ".wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(searchTitle);
    };

    const summaryResponse = await fetch(summaryEndpoint);
    const summaryData = await summaryResponse.json();
    const displayTitle = summaryData.displaytitle;
    const canonicalTitle = summaryData.titles.canonical;

    const contentResponse = await fetch("https://" + language + ".wikipedia.org/api/rest_v1/page/html/" + encodeURIComponent(canonicalTitle));
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

const BASE_PREFETCH_QUEUE_SIZE = 3;
const BASE_SCROLL_THRESHOLD = 1500;

const SPEED_SAMPLE_INTERVAL = 100;
const SPEED_DECAY = 0.85;
const MAX_MULTIPLIER = 5;

language = localStorage.getItem("language") || "en";

const prefetchQueue = [];

let lastScrollY = window.scrollY;
let lastScrollTime = performance.now();
let smoothedSpeed = 0;

function getScrollMultiplier() {
    return Math.min(1 + smoothedSpeed / 800, MAX_MULTIPLIER);
}

function updateScrollSpeed() {
    const now = performance.now();
    const elapsed = now - lastScrollTime;
    if (elapsed >= SPEED_SAMPLE_INTERVAL) {
        const delta = Math.abs(window.scrollY - lastScrollY);
        const instantSpeed = delta / elapsed * 1000;
        smoothedSpeed = smoothedSpeed * SPEED_DECAY + instantSpeed * (1 - SPEED_DECAY);
        lastScrollY = window.scrollY;
        lastScrollTime = now;
        fillPrefetchQueue();
    }
}

function getTargetQueueSize() {
    return Math.ceil(BASE_PREFETCH_QUEUE_SIZE * getScrollMultiplier());
}

function fillPrefetchQueue() {
    const target = getTargetQueueSize();
    while (prefetchQueue.length < target) {
        prefetchQueue.push(fetchWikipediaArticle(null, language));
    }
}

async function getNextArticle(searchTitle = null) {
    if (searchTitle) {
        return fetchWikipediaArticle(searchTitle, language);
    }
    if (prefetchQueue.length > 0) {
        const next = prefetchQueue.shift();
        fillPrefetchQueue();
        return next;
    }
    return fetchWikipediaArticle(null, language);
}

async function fetchCSSStyles() {
    if (fetchCSSStyles._cache) return fetchCSSStyles._cache;
    const stylesResponse = await fetch("styles_inject.css");
    fetchCSSStyles._cache = await stylesResponse.text();
    return fetchCSSStyles._cache;
}

async function renderNewArticleCard(searchTitle = null, sourceArticleTitle = null, anchorElement = null, lang = language) {
    const [{ html, displayText, internalTitle }, CSSStyles] = await Promise.all([
        getNextArticle(searchTitle),
        fetchCSSStyles()
    ]);

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
        <div class="expand-more-container">
            <button class="expand-more-button">Read Full Article</button>
        </div>
        <div class="hint-text">Tap to read</div>
    `;

    cardShadow.addEventListener("click", (event) => {
        const potentialLink = event.target.closest("a");
        const expandMoreButton = event.target.closest(".expand-more-button");

        if (expandMoreButton) {
            articleCard.classList.add("fully-expanded");
            event.stopPropagation();
            return;
        }

        if (potentialLink) {
            const linkHref = potentialLink.getAttribute("href");
            if (!linkHref) return;

            try {
                const wikipediaBase = "https://" + lang + ".wikipedia.org/wiki/";
                const resolvedUrl = new URL(linkHref, wikipediaBase);

                if (resolvedUrl.hostname === lang + ".wikipedia.org" && resolvedUrl.pathname.startsWith("/wiki/")) {
                    event.preventDefault();
                    event.stopPropagation();

                    const newArticleTitle = decodeURIComponent(resolvedUrl.pathname.split("/wiki/")[1]);
                    renderNewArticleCard(newArticleTitle, internalTitle, articleCard, lang);
                    return;
                }
            } catch (error) {
                console.error("Failed to resolve Wikipedia link:", error);
            }
        }

        if (!articleCard.classList.contains("expanded")) {
            articleCard.classList.add("expanded");
            setTimeout(() => {
                const innerContent = cardShadow.querySelector(".content");
                if (innerContent && innerContent.scrollHeight > 4500) {
                    articleCard.classList.add("is-cut-off");
                }
            }, 400);
        } else if (articleCard.classList.contains("fully-expanded")) {
            articleCard.classList.remove("fully-expanded");
            articleCard.classList.remove("expanded");
        } else {
            articleCard.classList.remove("expanded");
            articleCard.classList.remove("is-cut-off");
        }
    });

    if (anchorElement) {
        anchorElement.after(articleCard);
        articleCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        document.getElementById("div1").appendChild(articleCard);
    }
}

let appendingCount = 0;

async function appendCards(count) {
    const slots = Math.max(0, count - appendingCount);
    if (slots === 0) return;
    appendingCount += slots;
    await Promise.all(
        Array.from({ length: slots }, () =>
            renderNewArticleCard(null, null, null, language).finally(() => { appendingCount--; })
        )
    );
}

fillPrefetchQueue();

(async function startFeed() {
    await Promise.all([
        renderNewArticleCard(null, null, null, language),
        renderNewArticleCard(null, null, null, language),
        renderNewArticleCard(null, null, null, language)
    ]);
})();

window.addEventListener("scroll", () => {
    updateScrollSpeed();

    const multiplier = getScrollMultiplier();
    const dynamicThreshold = BASE_SCROLL_THRESHOLD * multiplier;
    const hasReachedBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - dynamicThreshold;

    if (hasReachedBottom) {
        appendCards(Math.ceil(multiplier));
    }
});