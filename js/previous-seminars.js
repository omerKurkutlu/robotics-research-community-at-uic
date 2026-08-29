const gallery = document.getElementById('previous-seminars-gallery');

if (gallery) {
    const folderUrl = 'images/previous%20seminars/';

    fetch(folderUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Could not load previous seminar images.');
            }

            return response.text();
        })
        .then(html => {
            const links = [...html.matchAll(/href=["']([^"']+)["']/g)]
                .map(match => match[1])
                .filter(href => {
                    const lower = href.toLowerCase();
                    return !href.startsWith('/') &&
                        !href.startsWith('..') &&
                        !href.startsWith('?') &&
                        !href.endsWith('/') &&
                        /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(lower);
                });

            const files = [...new Set(links.map(link => decodeURIComponent(link)))];

            if (files.length === 0) {
                gallery.innerHTML = `
                    <div class="empty-state">
                        No previous seminar images have been added yet.
                    </div>
                `;
                return;
            }

            const stage = document.createElement('div');
            stage.className = 'gallery-stage';

            const track = document.createElement('div');
            track.className = 'gallery-track';

            const thumbs = document.createElement('div');
            thumbs.className = 'gallery-thumbs';

            files.forEach((file, index) => {
                const safeFilePath = `${folderUrl}${encodeURIComponent(file)}`;

                const item = document.createElement('a');
                item.href = safeFilePath;
                item.target = '_blank';
                item.rel = 'noopener noreferrer';
                item.className = 'gallery-item';
                item.setAttribute('aria-label', `Open previous seminar image ${file}`);
                item.innerHTML = `
                    <img src="${safeFilePath}" alt="Previous seminar ${file}">
                    <div class="gallery-caption">${file.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')}</div>
                `;

                const thumb = document.createElement('img');
                thumb.src = safeFilePath;
                thumb.alt = `Thumbnail for ${file}`;
                thumb.className = `thumb ${index === 0 ? 'active' : ''}`;
                thumb.addEventListener('click', () => {
                    const cards = [...track.children];
                    const target = cards[index];
                    if (target) {
                        const offset = target.offsetLeft;
                        track.parentElement.scrollTo({ left: offset, behavior: 'smooth' });
                    }
                    [...thumbs.children].forEach((button, buttonIndex) => {
                        button.classList.toggle('active', buttonIndex === index);
                    });
                });

                track.appendChild(item);
                thumbs.appendChild(thumb);
            });

            stage.appendChild(track);
            gallery.appendChild(stage);
            gallery.appendChild(thumbs);

            const updateSlide = (index) => {
                const cardWidth = track.children[0]?.getBoundingClientRect().width || 0;
                const step = cardWidth + 16;
                track.style.transform = `translateX(-${index * step}px)`;
                [...thumbs.children].forEach((button, buttonIndex) => {
                    button.classList.toggle('active', buttonIndex === index);
                });
            };

            let currentIndex = 0;
            let autoSlide = setInterval(() => {
                currentIndex = (currentIndex + 1) % files.length;
                updateSlide(currentIndex);
            }, 5000);

            stage.addEventListener('mouseenter', () => clearInterval(autoSlide));
            stage.addEventListener('mouseleave', () => {
                autoSlide = setInterval(() => {
                    currentIndex = (currentIndex + 1) % files.length;
                    updateSlide(currentIndex);
                }, 5000);
            });

            window.addEventListener('resize', () => updateSlide(currentIndex));
            updateSlide(0);
        })
        .catch(() => {
            gallery.innerHTML = `
                <div class="empty-state">
                    Previous seminar images are currently unavailable.
                </div>
            `;
        });
}
