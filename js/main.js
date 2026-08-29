fetch("data/seminars.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Could not load seminar data.");
        }

        return response.json();
    })
    .then(seminars => {
        const comingTalkList = document.getElementById("coming-talk-list");

        const slides = seminars.slice(0, 5).map(seminar => {
            const slide = document.createElement("article");
            slide.className = "talk-slide";
            slide.setAttribute("aria-live", "polite");

            const imageMarkup = seminar.image
                ? `<img src="${seminar.image}" alt="${seminar.speaker} portrait" class="speaker-photo">`
                : `<div class="talk-photo-placeholder"><span>Photo coming soon</span></div>`;

            slide.innerHTML = `
                <div class="talk-photo" aria-label="Speaker photo">
                    ${imageMarkup}
                </div>

                <div class="talk-body">
                    <p class="talk-date">${seminar.date}</p>
                    <h3>${seminar.title}</h3>
                    <p class="talk-speaker">${seminar.speaker}</p>

                    <div class="talk-bio-box">
                        <strong>Speaker bio</strong>
                        <p>${seminar.speakerBio || "Speaker details will be announced soon."}</p>
                    </div>

                    <div class="talk-bio-box">
                        <strong>About the talk</strong>
                        <p>${seminar.topic || "Robotics research and community discussion."}</p>
                    </div>

                    <div class="seminar-details talk-meta">
                        <span>🕚 ${seminar.time}</span>
                        <span>📍 ${seminar.location}</span>
                    </div>
                </div>
            `;

            return slide;
        });

        slides.forEach(slide => comingTalkList.appendChild(slide));

        const track = document.querySelector(".talk-track");
        const prevButton = document.querySelector(".talk-slider-prev");
        const nextButton = document.querySelector(".talk-slider-next");
        const dotsContainer = document.getElementById("talk-slider-dots");

        if (track && prevButton && nextButton && slides.length > 0) {
            let currentIndex = 0;
            let autoAdvanceTimer;

            const createDots = () => {
                slides.forEach((_, index) => {
                    const dot = document.createElement("button");
                    dot.type = "button";
                    dot.className = `talk-dot ${index === currentIndex ? "active" : ""}`;
                    dot.setAttribute("aria-label", `Go to speaker ${index + 1}`);
                    dot.addEventListener("click", () => {
                        currentIndex = index;
                        updateSlider();
                        resetAutoAdvance();
                    });
                    dotsContainer.appendChild(dot);
                });
            };

            const updateSlider = () => {
                const sliderWidth = track.parentElement?.clientWidth || track.clientWidth;
                const offset = sliderWidth * currentIndex;
                track.style.transform = `translateX(-${offset}px)`;

                if (dotsContainer) {
                    const dots = dotsContainer.querySelectorAll(".talk-dot");
                    dots.forEach((dot, index) => {
                        dot.classList.toggle("active", index === currentIndex);
                    });
                }
            };

            const resetAutoAdvance = () => {
                if (autoAdvanceTimer) {
                    clearInterval(autoAdvanceTimer);
                }

                autoAdvanceTimer = setInterval(() => {
                    currentIndex = (currentIndex + 1) % slides.length;
                    updateSlider();
                }, 5000);
            };

            prevButton.addEventListener("click", () => {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateSlider();
                resetAutoAdvance();
            });

            nextButton.addEventListener("click", () => {
                currentIndex = (currentIndex + 1) % slides.length;
                updateSlider();
                resetAutoAdvance();
            });

            createDots();
            window.addEventListener("resize", updateSlider);
            resetAutoAdvance();
            updateSlider();
        }
    })
    .catch(error => {
        console.error(error);

        if (document.getElementById("coming-talk-list")) {
            document.getElementById("coming-talk-list").innerHTML = `
                <p>Upcoming seminar information is currently unavailable.</p>
            `;
        }
    });