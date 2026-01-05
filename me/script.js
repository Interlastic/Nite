document.querySelectorAll('.hiText').forEach((hiText) => {
    hiText.addEventListener('click', () => {
        const nextSection = document.getElementById('bot');
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});