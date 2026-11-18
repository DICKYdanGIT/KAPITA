function promoContentWindow() {
    return {
        view: "window",
        id: "promoContentWindow",
        css: "promo-window",
        width: 1100,
        height: 720,
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
                            const buy = Array.isArray(obj.buy) && obj.buy.length
                                ? obj.buy.map(item =>
                                    `<div class="promo-line">${webix.template.escape(item)}</div>`
                                ).join("")
                                : `<div class="promo-empty">-</div>`;

                            const get = Array.isArray(obj.get) && obj.get.length
                                ? obj.get.map(item =>
                                    `<div class="promo-line get">${webix.template.escape(item)}</div>`
                                ).join("")
                                : `<div class="promo-empty">-</div>`;

                            return `
                                <div class="promo-card">
                                    <div class="promo-name">${webix.template.escape(obj.name)}</div>
                                    <div class="promo-code">${webix.template.escape(obj.code)}</div>

                                    <div class="promo-section">
                                        <div class="promo-label">Beli</div>
                                        <div class="promo-items">${buy}</div>
                                    </div>

                                    <div class="promo-section">
                                        <div class="promo-label">Dapat</div>
                                        <div class="promo-items">${get}</div>
                                    </div>

                                    <div class="promo-date">
                                        ${webix.template.escape(obj.start || "-")} sampai ${webix.template.escape(obj.end || "-")}
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