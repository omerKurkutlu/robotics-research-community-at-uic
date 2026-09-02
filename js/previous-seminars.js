const gallery = document.getElementById('previous-seminars-gallery');

if (gallery) {
    // Image list comes from a manifest file. GitHub Pages does not serve
    // directory listings, so the folder cannot be scraped at runtime.
    // To add a photo: drop it in "images/previous seminars/" and add an
    // entry to data/previous-seminars.json.
    fetch('data/previous-seminars.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Could not load previous seminar images.');
            }

            return response.json();
        })
        .then(manifest => {
            const folderUrl = manifest.folder || 'images/previous seminars/';
            const entries = (manifest.images || [])
                .map(item => (typeof item === 'string' ? { file: item } : item))
                .filter(item => item && item.file);

            if (entries.length === 0) {
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

            const encodePath = file =>
                `${folderUrl}${file}`.split('/').map(encodeURIComponent).join('/');

            entries.forEach((entry, index) => {
                const safeFilePath = encodePath(entry.file);
                const caption = entry.caption
                    || entry.file.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');

                const item = document.createElement('a');
                item.href = safeFilePath;
                item.target = '_blank';
                item.rel = 'noopener noreferrer';
                item.className = 'gallery-item';
                item.setAttribute('aria-label', `Open previous seminar image: ${caption}`);
                item.innerHTML = `
                    <img src="${safeFilePath}" alt="${caption}" loading="lazy">
                    <div class="gallery-caption">${caption}</div>
                `;

                const thumb = document.createElement('img');
                thumb.src = safeFilePath;
                thumb.alt = `Thumbnail: ${caption}`;
                thumb.loading = 'lazy';
                thumb.className = `thumb ${index === 0 ? 'active' : ''}`;
                thumb.addEventListener('click', () => {
                    currentIndex = index;
                    updateSlide(currentIndex);
                    resetAutoSlide();
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
            let autoSlide;

            const resetAutoSlide = () => {
                clearInterval(autoSlide);
                autoSlide = setInterval(() => {
                    currentIndex = (currentIndex + 1) % entries.length;
                    updateSlide(currentIndex);
                }, 5000);
            };

            stage.addEventListener('mouseenter', () => clearInterval(autoSlide));
            stage.addEventListener('mouseleave', resetAutoSlide);
            window.addEventListener('resize', () => updateSlide(currentIndex));

            updateSlide(0);
            resetAutoSlide();
        })
        .catch(() => {
            gallery.innerHTML = `
                <div class="empty-state">
                    Previous seminar images are currently unavailable.
                </div>
            `;
        });
}
