function promoContentWindow() {
    const esc = webix.template.escape;

    const lines = (list, cls) =>
        Array.isArray(list) && list.length
            ? list.map(item => `<div class="promo-line ${cls}">${esc(item)}</div>`).join("")
            : `<div class="promo-empty">-</div>`;

    return {
        view: "window",
        id: "promoContentWindow",
        css: "promo-window",
        width: Math.min(1100, window.innerWidth - 32),
        height: Math.min(720, window.innerHeight - 32),
        position: "center",
        modal: true,
        move: true,
        close: true,
        head: "Promo Tersedia",

        on: {
            onHide: function() {
                $$("cashierSidebar").select("cashier");
            }
        },

        body: {
            padding: 12,
            rows: [
                {
                    view: "dataview",
                    id: "promoList",
                    css: "promo-grid",
                    url: "/promo/display",
                    scroll: "y",
                    select: false,
                    borderless: true,
                    xCount: 3,

                    type: {
                        width: "auto",
                        height: 400,
                        css: "promo-item",

                        template: function(obj) {
                            return `
                                <div class="promo-card">
                                    <div class="promo-name">${esc(obj.name || "")}</div>
                                    <div class="promo-code">${esc(obj.code || "")}</div>

                                    <div class="promo-section">
                                        <div class="promo-label">Beli</div>
                                        <div class="promo-items">${lines(obj.buy, "")}</div>
                                    </div>

                                    <div class="promo-section">
                                        <div class="promo-label">Dapat</div>
                                        <div class="promo-items">${lines(obj.get, "get")}</div>
                                    </div>

                                    <div class="promo-date">
                                        ${esc(obj.start || "-")} sampai ${esc(obj.end || "-")}
                                    </div>
                                </div>
                            `;
                        }
                    }
                }
            ]
        }
    };
}
