function cardHtml(value, label, note) {
    return `
        <div class="stat-card">
            <div class="stat-label">${label}</div>
            <div class="stat-value">${Number(value).toLocaleString("id-ID")}</div>
            <div class="stat-note">${note}</div>
        </div>`;
}