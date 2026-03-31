const articleQueue = [];
let isRateLimited = false;
let language = localStorage.getItem("language") || "en";

async function fetchWikiAPI(params) {
    const url = new URL("https://" + language + ".wikipedia.org/w/api.php");
    url.search = new URLSearchParams({ ...params, format: "json", origin: "*" });

    const response = await fetch(url);
    if (response.status === 429) {
        isRateLimited = true;
        throw new Error("RATE_LIMITED");
    }
    return response.json();
}

async function fetchBatchRandomArticles(count) {
    try {
        // 1. Get random titles
        const randomData = await fetchWikiAPI({
            action: "query",
            list: "random",
            rnnamespace: 0,
            rnlimit: count
        });

        const titles = randomData.query.random.map(r => r.title);

        // 2. Get summaries and display titles for those titles
        const detailsData = await fetchWikiAPI({
            action: "query",
            prop: "extracts|pageprops",
            exintro: true,
            explaintext: true,
            titles: titles.join("|")
        });

        const pages = detailsData.query.pages;
        return Object.values(pages).map(p => ({
            displayText: p.title,
            internalTitle: p.title,
            summary: p.extract
        }));
    } catch (error) {
        console.error("Batch fetch failed:", error);
        if (error.message === "RATE_LIMITED" || isRateLimited) {
            isRateLimited = true;
            showRateLimitMessage();
        }
        return [];
    }
}

async function fetchWikipediaArticle(searchTitle = null, lang = language) {
    // This is now mainly for specific searches or getting the HTML
    const title = searchTitle || "Special:Random";

    const contentResponse = await fetch("https://" + lang + ".wikipedia.org/api/rest_v1/page/html/" + encodeURIComponent(title));
    if (contentResponse.status === 429) {
        isRateLimited = true;
        throw new Error("RATE_LIMITED");
    }
    const htmlContent = await contentResponse.text();

    return {
        html: htmlContent
    };
}

const BASE_PREFETCH_QUEUE_SIZE = 5;
const BASE_SCROLL_THRESHOLD = 1500;

const SPEED_SAMPLE_INTERVAL = 100;
const SPEED_DECAY = 0.85;
const MAX_MULTIPLIER = 5;

// language is now initialized at the top

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

let isFetchingBatch = false;
async function fillPrefetchQueue() {
    if (isFetchingBatch || isRateLimited) return;
    const target = getTargetQueueSize();
    if (articleQueue.length < target) {
        isFetchingBatch = true;
        const batch = await fetchBatchRandomArticles(Math.max(5, target - articleQueue.length));
        articleQueue.push(...batch);
        isFetchingBatch = false;
    }
}

async function getNextArticle(searchTitle = null) {
    if (searchTitle) {
        const { html } = await fetchWikipediaArticle(searchTitle);
        return { html, displayText: searchTitle, internalTitle: searchTitle };
    }

    // If queue is empty, wait for it to be filled
    if (articleQueue.length === 0) {
        await fillPrefetchQueue();
        // If still empty (e.g., fetch was already in progress), wait until it's done
        while (isFetchingBatch && articleQueue.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    const next = articleQueue.shift();
    fillPrefetchQueue(); // Refill in background

    if (next) {
        // Fetch HTML lazily
        let { html } = await fetchWikipediaArticle(next.internalTitle);

        html = html.replaceAll('src="//', 'src="https://');
        html = html.replaceAll('srcset="//', 'srcset="https://');
        html = html.replaceAll('href="//', 'href="https://');

        html = html.replaceAll('src="/', 'src="https://en.wikipedia.org/');
        html = html.replaceAll('href="/', 'href="https://en.wikipedia.org/');

        next.html = html;
        return next;
    }

    return null;
}

async function fetchCSSStyles() {
    if (fetchCSSStyles._cache) return fetchCSSStyles._cache;
    const stylesResponse = await fetch("styles_inject.css");
    fetchCSSStyles._cache = await stylesResponse.text();
    return fetchCSSStyles._cache;
}

async function renderNewArticleCard(searchTitle = null, sourceArticleTitle = null, anchorElement = null, lang = language, isShared = false) {
    if (isRateLimited) {
        showRateLimitMessage();
        return;
    }
    try {
        const [articleData, CSSStyles] = await Promise.all([
            getNextArticle(searchTitle),
            fetchCSSStyles()
        ]);

        if (!articleData) {
            if (isRateLimited) showRateLimitMessage();
            return;
        }

        const { html, displayText, internalTitle } = articleData;

        const articleCard = document.createElement("div");
        articleCard.className = "e2";
        if (isShared) articleCard.classList.add("fully-expanded");

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
        <div class="extension">
            <button class="ext-button share-button" title="Share">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
            </button>
            <button class="ext-button favourite-button" title="Favourite">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-633q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 49-15.5 93t-45.5 86.5Q789-428 723-362t-167 157l-76 65Z"/></svg>
            </button>
            <button class="ext-button wikipedia-button" title="Open in Wikipedia">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 312-312H540v-80h220v220h-80v-104L388-332Z"/></svg>
            </button>
        </div>
    `;

        // Initialize button states
        const favs = JSON.parse(localStorage.getItem("wikinfinity_favourites") || "[]");
        if (favs.includes(internalTitle)) {
            cardShadow.querySelector(".favourite-button").classList.add("favourited");
        }

        cardShadow.addEventListener("click", (event) => {
            const potentialLink = event.target.closest("a");
            const expandMoreButton = event.target.closest(".expand-more-button");

            // Extension Buttons
            const shareBtn = event.target.closest(".share-button");
            const favBtn = event.target.closest(".favourite-button");
            const wikiBtn = event.target.closest(".wikipedia-button");

            if (shareBtn) {
                event.stopPropagation();
                const currentBase = window.location.href.split('#')[0].replace(/\/$/, "").replace(/\/index\.html$/, "");
                const shareUrl = currentBase + '/share#' + encodeURIComponent(internalTitle);
                const shareData = {
                    title: displayText,
                    text: `Check out this article: ${displayText}`,
                    url: shareUrl
                };

                if (navigator.share && navigator.canShare(shareData)) {
                    navigator.share(shareData).catch(() => { });
                } else {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        shareBtn.classList.add("copied");
                        setTimeout(() => shareBtn.classList.remove("copied"), 2000);
                    });
                }
                return;
            }

            if (favBtn) {
                event.stopPropagation();
                let favs = JSON.parse(localStorage.getItem("wikinfinity_favourites") || "[]");
                if (favs.includes(internalTitle)) {
                    favs = favs.filter(f => f !== internalTitle);
                    favBtn.classList.remove("favourited");
                } else {
                    favs.push(internalTitle);
                    favBtn.classList.add("favourited");
                }
                localStorage.setItem("wikinfinity_favourites", JSON.stringify(favs));
                return;
            }

            if (wikiBtn) {
                event.stopPropagation();
                window.open("https://" + lang + ".wikipedia.org/wiki/" + encodeURIComponent(internalTitle), "_blank");
                return;
            }

            if (isShared) return;

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
                    if (innerContent && innerContent.scrollHeight > 4620) {
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
    } catch (error) {
        console.error("Failed to render article:", error);
        if (error.message === "RATE_LIMITED" || isRateLimited) {
            showRateLimitMessage();
        }
    }
}

function showRateLimitMessage() {
    if (document.getElementById("rate-limit-msg")) return;
    const msg = document.createElement("div");
    msg.id = "rate-limit-msg";
    msg.innerText = "Wikipedia has ratelimited you. Please try again later.";
    msg.style.cssText = "color: #888; text-align: center; padding: 60px 20px; font-family: sans-serif; font-size: 0.9em;";
    document.getElementById("div1").appendChild(msg);
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
    const hash = window.location.hash.substring(1);
    const sharedTitle = hash ? decodeURIComponent(hash) : null;

    if (sharedTitle) {
        await renderNewArticleCard(sharedTitle, null, null, language, true);
    }

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