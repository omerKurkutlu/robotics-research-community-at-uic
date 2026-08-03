fetch("data/seminars.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Could not load seminar data.");
        }

        return response.json();
    })
    .then(seminars => {
        const seminarList = document.getElementById("seminar-list");

        seminars.forEach(seminar => {
            const card = document.createElement("div");

            card.className = "col-md-6 col-lg-4";

            card.innerHTML = `
                <article class="seminar-card">
                    <div class="seminar-date">${seminar.date}</div>

                    <h3>${seminar.title}</h3>

                    <p class="seminar-speaker">
                        Speaker: ${seminar.speaker}
                    </p>

                    <div class="seminar-details">
                        <span>🕚 ${seminar.time}</span>
                        <span>📍 ${seminar.location}</span>
                    </div>
                </article>
            `;

            seminarList.appendChild(card);
        });
    })
    .catch(error => {
        console.error(error);

        document.getElementById("seminar-list").innerHTML = `
            <p>Seminar information is currently unavailable.</p>
        `;
    });