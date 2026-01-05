document.querySelectorAll('.hiText').forEach((hiText) => {
    hiText.addEventListener('click', () => {
        const sections = Array.from(document.querySelectorAll('.page'));
        const currentSection = hiText.closest('.page');
        const currentIndex = sections.indexOf(currentSection);

        if (currentIndex !== -1 && currentIndex < sections.length - 1) {
            sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const animateCounters = () => {
    const counters = document.querySelectorAll('.statValue');
    const duration = 2000;

    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let startTime = null;

        const easeOutQuad = (t) => 1 - Math.pow(1 - t, 3.23);

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = easeOutQuad(progress);

            const currentValue = Math.floor(easedProgress * target);
            counter.innerText = currentValue + '+'

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                counter.innerText = target + '+';
            }
        };

        window.requestAnimationFrame(step);
    });
};
const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const botSection = document.getElementById('bot');
if (botSection) {
    observer.observe(botSection);
}

// Modal Logic
const modal = document.getElementById('infoModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const closeBtn = document.querySelector('.close-btn');

document.querySelectorAll('.box').forEach(box => {
    box.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering other click events
        const title = box.getAttribute('data-title');
        const desc = box.getAttribute('data-desc');

        modalTitle.innerText = title;
        modalDesc.innerHTML = desc;

        modal.classList.add('show');
    });
});

const closeModal = () => {
    modal.classList.remove('show');
};

closeBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Prevent modal content clicks from closing the modal
document.querySelector('.modal-content').addEventListener('click', (e) => {
    e.stopPropagation();
});