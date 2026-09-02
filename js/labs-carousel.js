// Homepage "Featured Research Labs" carousel.
// Pulls the same data/labs.json used by the full Faculty & Research Labs page,
// so adding a lab there automatically adds it here.

fetch("data/labs.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Could not load lab data.");
        }

        return response.json();
    })
    .then(labs => {
        const viewport = document.querySelector(".lab-carousel-viewport");
        const track = document.getElementById("lab-carousel-track");
        const prevButton = document.querySelector(".lab-carousel-prev");
        const nextButton = document.querySelector(".lab-carousel-next");

        if (!viewport || !track) {
            return;
        }

        labs.forEach(lab => {
            const card = document.createElement("a");
            card.className = "lab-card lab-card-link";
            card.href = lab.link;
            card.target = "_blank";
            card.rel = "noopener noreferrer";

            const directors = Array.isArray(lab.directors) ? lab.directors : [];
            const directorLabel = directors.length > 1 ? "Faculty directors" : "Faculty director";
            const directorMarkup = directors.length
                ? `<p class="lab-lead">${directorLabel}: ${directors.join(", ")}</p>`
                : "";

            card.innerHTML = `
                <div class="lab-tags">
                    <span>${lab.department}</span>
                </div>
                <h3>${lab.name}</h3>
                ${directorMarkup}
                <span class="lab-link">Visit Lab →</span>
            `;

            track.appendChild(card);
        });

        const scrollByStep = direction => {
            const firstCard = track.querySelector(".lab-card");
            const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0") || 0;
            const step = firstCard ? firstCard.getBoundingClientRect().width + gap : viewport.clientWidth;
            viewport.scrollBy({ left: step * direction, behavior: "smooth" });
        };

        const updateButtons = () => {
            const maxScroll = track.scrollWidth - viewport.clientWidth - 1;
            const atStart = viewport.scrollLeft <= 0;
            const atEnd = viewport.scrollLeft >= maxScroll;

            if (prevButton) {
                prevButton.disabled = atStart;
            }

            if (nextButton) {
                nextButton.disabled = atEnd;
            }
        };

        if (prevButton) {
            prevButton.addEventListener("click", () => scrollByStep(-1));
        }

        if (nextButton) {
            nextButton.addEventListener("click", () => scrollByStep(1));
        }

        viewport.addEventListener("scroll", updateButtons, { passive: true });
        window.addEventListener("resize", updateButtons);
        updateButtons();
    })
    .catch(error => {
        console.error(error);

        const track = document.getElementById("lab-carousel-track");
        if (track) {
            track.innerHTML = `<p class="lab-carousel-empty">Research lab information is currently unavailable.</p>`;
        }
    });
