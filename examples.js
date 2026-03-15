const CSV_PATH = "examples.csv";
const AUDIO_BASE_PATH = "./audio/esr_map";

async function loadText(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Could not load ${path}`);
    }
    return await response.text();
}

function parseSemicolonCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(";").map(h => h.trim());

    return lines.slice(1).map(line => {
        const values = line.split(";").map(v => v.trim());
        const row = {};

        headers.forEach((header, i) => {
            row[header] = values[i] ?? "";
        });

        row.lfo_freq_hz = Number(row.lfo_freq_hz);
        row.feedback = Number(row.feedback);
        row.seen = Number(row.seen);

        return row;
    });
}

function groupBy(array, keyFn) {
    const map = new Map();
    for (const item of array) {
        const key = keyFn(item);
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key).push(item);
    }
    return map;
}

function sortRows(rows) {
    return [...rows].sort((a, b) => {
        if (a.lfo_freq_hz !== b.lfo_freq_hz) {
            return a.lfo_freq_hz - b.lfo_freq_hz;
        }
        return a.feedback - b.feedback;
    });
}

function createAudioCell(fileName) {
    const cell = document.createElement("div");

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "none";
    audio.src = `${AUDIO_BASE_PATH}/${fileName}`;

    cell.appendChild(audio);

    return cell;
}

function renderSection(container, title, className, rows) {
    const section = document.createElement("section");

    const sectionTitle = document.createElement("h3");
    sectionTitle.className = `section-title ${className}`;
    sectionTitle.textContent = title;

    section.appendChild(sectionTitle);

    if (rows.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No examples found.";
        section.appendChild(empty);
        container.appendChild(section);
        return;
    }

    const byLfo = groupBy(sortRows(rows), row => row.lfo_freq_hz);
    const sortedLfoKeys = [...byLfo.keys()].sort((a, b) => a - b);

    const grid = document.createElement("div");
    grid.className = "lfo-grid";

    for (const lfo of sortedLfoKeys) {
        const lfoRows = byLfo.get(lfo);

        const block = document.createElement("div");
        block.className = "lfo-block";

        const lfoTitle = document.createElement("h3");
        lfoTitle.textContent = `LFO rate = ${lfo} Hz`;

        block.appendChild(lfoTitle);

        const table = document.createElement("div");
        table.className = "table";

        const header = document.createElement("div");
        header.className = "table-header";
        header.innerHTML = `
            <div>Feedback</div>
            <div><p class="audio-title input", style="width:86.5%; background-color: #39394f">Target</p></div>
            <div><p class="audio-title input", style="width:86.5%; background-color: #5f7079">Predicted</p></div>
        `;

        table.appendChild(header);

        for (const row of lfoRows) {
            const tr = document.createElement("div");
            tr.className = "table-row";

            const feedbackCell = document.createElement("div");
            feedbackCell.textContent = `${(row.feedback * 100).toFixed(0)} %`;

            tr.appendChild(feedbackCell);
            tr.appendChild(createAudioCell(row.target_file));
            tr.appendChild(createAudioCell(row.pred_file));

            table.appendChild(tr);
        }

        block.appendChild(table);
        grid.appendChild(block);
    }

    section.appendChild(grid);
    container.appendChild(section);
}

async function init() {
    const container = document.getElementById("examples");

    if (!container) {
        console.error("No #examples container found.");
        return;
    }

    try {
        const csvText = await loadText(CSV_PATH);
        const rows = parseSemicolonCSV(csvText);

        const seenRows = rows.filter(r => r.seen === 1 && r.unseen === "none");
        const unseenRows = rows.filter(r => r.seen === 0);

        renderSection(container, "Seen Values", "seen", seenRows);
        renderSection(container, "Unseen Values", "unseen", unseenRows);
    }
    catch (error) {
        container.innerHTML = `<p>${error.message}</p>`;
        console.error(error);
    }
}

init();