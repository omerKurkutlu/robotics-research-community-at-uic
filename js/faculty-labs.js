// Full "Faculty & Research Labs" directory.
// Renders labs and faculty grouped by department in a fixed order.
// To add an entry, append an object to data/labs.json or data/faculty.json —
// no changes needed here.

const DEPARTMENT_ORDER = ["BME", "CS", "ECE", "MIE"];

const DEPARTMENT_NAMES = {
    BME: "Biomedical Engineering",
    CS: "Computer Science",
    ECE: "Electrical & Computer Engineering",
    MIE: "Mechanical & Industrial Engineering"
};

const groupByDepartment = entries => {
    const groups = {};

    entries.forEach(entry => {
        const dept = entry.department || "Other";
        (groups[dept] = groups[dept] || []).push(entry);
    });

    const ordered = [];
    DEPARTMENT_ORDER.forEach(dept => {
        if (groups[dept]) {
            ordered.push([dept, groups[dept]]);
            delete groups[dept];
        }
    });

    // Any department not in the known order still gets rendered, alphabetically.
    Object.keys(groups)
        .sort()
        .forEach(dept => ordered.push([dept, groups[dept]]));

    return ordered;
};

const departmentHeading = dept => {
    const full = DEPARTMENT_NAMES[dept];
    return full ? `${dept} · ${full}` : dept;
};

const renderLabs = labs => {
    const container = document.getElementById("labs-directory");
    if (!container) {
        return;
    }

    container.innerHTML = "";

    groupByDepartment(labs).forEach(([dept, deptLabs]) => {
        const block = document.createElement("section");
        block.className = "directory-group";

        const cards = deptLabs
            .map(lab => {
                const directors = Array.isArray(lab.directors) ? lab.directors : [];
                const directorLabel = directors.length > 1 ? "Faculty directors" : "Faculty director";
                const directorMarkup = directors.length
                    ? `<p class="lab-lead">${directorLabel}: ${directors.join(", ")}</p>`
                    : "";

                return `
                    <a class="lab-card lab-card-link" href="${lab.link}" target="_blank" rel="noopener noreferrer">
                        <h3>${lab.name}</h3>
                        ${directorMarkup}
                        <span class="lab-link">Visit Lab →</span>
                    </a>
                `;
            })
            .join("");

        block.innerHTML = `
            <h2 class="directory-dept">${departmentHeading(dept)}</h2>
            <div class="directory-grid">${cards}</div>
        `;

        container.appendChild(block);
    });
};

const renderFaculty = faculty => {
    const container = document.getElementById("faculty-directory");
    if (!container) {
        return;
    }

    container.innerHTML = "";

    groupByDepartment(faculty).forEach(([dept, deptFaculty]) => {
        const block = document.createElement("section");
        block.className = "directory-group";

        const items = deptFaculty
            .map(person => `
                <li>
                    <a class="faculty-link" href="${person.link}" target="_blank" rel="noopener noreferrer">
                        ${person.name}
                    </a>
                </li>
            `)
            .join("");

        block.innerHTML = `
            <h2 class="directory-dept">${departmentHeading(dept)}</h2>
            <ul class="faculty-list">${items}</ul>
        `;

        container.appendChild(block);
    });
};

Promise.all([
    fetch("data/labs.json").then(r => {
        if (!r.ok) throw new Error("Could not load lab data.");
        return r.json();
    }),
    fetch("data/faculty.json").then(r => {
        if (!r.ok) throw new Error("Could not load faculty data.");
        return r.json();
    })
])
    .then(([labs, faculty]) => {
        renderLabs(labs);
        renderFaculty(faculty);
    })
    .catch(error => {
        console.error(error);

        ["labs-directory", "faculty-directory"].forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `<p class="empty-state">This information is currently unavailable.</p>`;
            }
        });
    });
