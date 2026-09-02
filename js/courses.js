// Robotics-related courses at UIC, grouped by department.
// To add a course, append an object to data/courses.json — no changes here.
// Fields: code, title, department (BME|CS|ECE|MIE), level, hours,
//         tier ("core" | "related"), description, crosslist (optional).

const DEPARTMENT_ORDER = ["BME", "CS", "ECE", "MIE"];

const DEPARTMENT_NAMES = {
    BME: "Biomedical Engineering",
    CS: "Computer Science",
    ECE: "Electrical & Computer Engineering",
    MIE: "Mechanical & Industrial Engineering"
};

const catalogUrl = code =>
    `https://catalog.uic.edu/search/?P=${encodeURIComponent(code)}`;

const groupByDepartment = courses => {
    const groups = {};
    courses.forEach(course => {
        const dept = course.department || "Other";
        (groups[dept] = groups[dept] || []).push(course);
    });

    const ordered = [];
    DEPARTMENT_ORDER.forEach(dept => {
        if (groups[dept]) {
            ordered.push([dept, groups[dept]]);
            delete groups[dept];
        }
    });
    Object.keys(groups).sort().forEach(dept => ordered.push([dept, groups[dept]]));
    return ordered;
};

const sortCourses = courses =>
    [...courses].sort((a, b) => {
        if (a.tier !== b.tier) return a.tier === "core" ? -1 : 1;
        return a.code.localeCompare(b.code, undefined, { numeric: true });
    });

const courseCard = course => {
    const badge = course.tier === "core"
        ? `<span class="course-badge course-badge-core">Core robotics</span>`
        : `<span class="course-badge">Related</span>`;

    const crosslist = course.crosslist
        ? `<span class="course-crosslist">Same as ${course.crosslist}</span>`
        : "";

    return `
        <article class="course-card">
            <div class="course-head">
                <span class="course-code">${course.code}</span>
                <span class="course-hours">${course.hours} hrs</span>
            </div>
            <h3 class="course-title">${course.title}</h3>
            <div class="course-meta">
                ${badge}
                <span class="course-level">${course.level}</span>
                ${crosslist}
            </div>
            <p class="course-desc">${course.description}</p>
            <a class="course-link" href="${catalogUrl(course.code)}" target="_blank" rel="noopener noreferrer">
                UIC Catalog →
            </a>
        </article>
    `;
};

fetch("data/courses.json")
    .then(response => {
        if (!response.ok) throw new Error("Could not load course data.");
        return response.json();
    })
    .then(courses => {
        const container = document.getElementById("courses-directory");
        const countEl = document.getElementById("course-count");
        if (!container) return;

        if (countEl) {
            const core = courses.filter(c => c.tier === "core").length;
            countEl.textContent =
                `${courses.length} courses across ${groupByDepartment(courses).length} departments · ${core} core robotics`;
        }

        container.innerHTML = "";

        groupByDepartment(courses).forEach(([dept, deptCourses]) => {
            const block = document.createElement("section");
            block.className = "directory-group";

            const full = DEPARTMENT_NAMES[dept];
            block.innerHTML = `
                <h2 class="directory-dept">${full ? `${dept} · ${full}` : dept}</h2>
                <div class="course-grid">
                    ${sortCourses(deptCourses).map(courseCard).join("")}
                </div>
            `;

            container.appendChild(block);
        });
    })
    .catch(error => {
        console.error(error);
        const container = document.getElementById("courses-directory");
        if (container) {
            container.innerHTML = `<p class="empty-state">Course information is currently unavailable.</p>`;
        }
    });
