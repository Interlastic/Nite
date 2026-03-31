const div1 = document.getElementById("div1");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");

let allFavourites = JSON.parse(localStorage.getItem("wikinfinity_favourites") || "[]");

function renderFavourites() {
    div1.innerHTML = "";

    let filtered = allFavourites.filter(f =>
        f.title.toLowerCase().includes(searchInput.value.toLowerCase())
    );

    const sortType = sortSelect.value;
    filtered.sort((a, b) => {
        if (sortType === "newest") return b.date - a.date;
        if (sortType === "oldest") return a.date - b.date;
        if (sortType === "az") return a.title.localeCompare(b.title);
        if (sortType === "za") return b.title.localeCompare(a.title);
        return 0;
    });

    if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        if (allFavourites.length === 0) {
            empty.innerText = "You have no favourites. Favourite an article for it to show up here!";
        } else {
            empty.innerText = "No matches found.";
        }
        div1.appendChild(empty);
        return;
    }

    filtered.forEach(f => {
        const placeholder = document.createElement("div");
        placeholder.className = "e2 placeholder-card";
        placeholder.style.height = "440px";
        placeholder.style.background = "#fff";
        placeholder.style.display = "flex";
        placeholder.style.flexDirection = "column";
        placeholder.style.justifyContent = "center";
        placeholder.style.alignItems = "center";
        placeholder.style.color = "#eee";
        placeholder.style.border = "1px solid #f0f0f0";
        placeholder.innerHTML = `<h2 style="color: #f5f5f5;">${f.title}</h2>`;

        div1.appendChild(placeholder);

        // Intersection Observer for Lazy Loading
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                observer.unobserve(placeholder);
                loadArticle(f.title, placeholder);
            }
        }, { rootMargin: "200px" });

        observer.observe(placeholder);
    });
}

async function loadArticle(title, placeholder) {
    // We use the existing renderNewArticleCard logic but inject into the placeholder
    // Since renderNewArticleCard creates its own div, we'll refactor it slightly or just use it

    const tempContainer = document.createElement("div");
    // renderNewArticleCard appends to div1 if anchor is null, so we need a workaround
    // or we update script.js to allow passing a target container

    // For now, let's just replace the placeholder
    await renderNewArticleCard(title, null, placeholder, language, false, false);
    placeholder.remove();
}

searchInput.addEventListener("input", renderFavourites);
sortSelect.addEventListener("change", renderFavourites);

// Initialize
renderFavourites();
