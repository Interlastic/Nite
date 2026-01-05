document.querySelectorAll('.hiText').forEach((hiText) => {
    hiText.addEventListener('click', () => {
        const nextSection = document.getElementById('bot');
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const animateCounters = () => {
    const counters = document.querySelectorAll('.statValue');
    const duration = 2000;

    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let startTime = null;

        const easeOutQuad = (t) => 1 - Math.pow(1 - t, 4);

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