function promoContentWindow() {
    return {
        view: "window",
        id: "promoContentWindow",
        width: 1218,
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
            rows: [
                {
                    view: "dataview",
                    id: "promoList",
                    url: "/promo/display",
                    scroll: "y",
                    select: false,
                    borderless: true,


                    type: {
                        width: 400,
                        height: 350,

                        template: function(obj) {
                            const buy = Array.isArray(obj.buy)
                                ? obj.buy : [];

                            const get = Array.isArray(obj.get)
                                ? obj.get : [];

                            return `
                                <div style="
                                    box-sizing: border-box;
                                    height: 100%;
                                    padding: 18px;
                                    border: 1px solid #d9dfe5;
                                    border-radius: 8px;
                                    background: #ffffff;
                                    overflow: hidden;
                                ">
                                    <div style="
                                        font-size: 19px;
                                        font-weight: bold;
                                        color: #263746;
                                        margin-bottom: 5px;
                                    ">
                                        ${webix.template.escape(obj.name || "")}
                                    </div>

                                    <div style="
                                        font-size: 15px;
                                        color: #64748b;
                                        margin-bottom: 12px;
                                    ">
                                        ${webix.template.escape(obj.code || "")}
                                    </div>

                                    <hr style="
                                        border: none;
                                        border-top: 1px solid #d9dfe5;
                                    ">

                                    <div style="
                                        font-size: 15px;
                                        font-weight: bold;
                                        color: #334155;
                                        margin-top: 12px;
                                        margin-bottom: 6px;
                                    ">
                                        Beli
                                    </div>

                                    ${
                                        buy.length
                                        ? buy.map(item => `
                                            <div style="
                                                font-size: 15px;
                                                color: #475569;
                                                margin-bottom: 5px;
                                            ">
                                                ${webix.template.escape(item)}
                                            </div>
                                        `).join("")
                                        : `<div style="color:#94a3b8;">-</div>`
                                    }

                                    <div style="
                                        font-size: 15px;
                                        font-weight: bold;
                                        color: #334155;
                                        margin-top: 12px;
                                        margin-bottom: 6px;
                                    ">
                                        Dapat
                                    </div>

                                    ${
                                        get.length
                                        ? get.map(item => `
                                            <div style="
                                                font-size: 15px;
                                                color: #2563eb;
                                                margin-bottom: 5px;
                                            ">
                                                ${webix.template.escape(item)}
                                            </div>
                                        `).join("")
                                        : `<div style="color:#94a3b8;">-</div>`
                                    }

                                    <hr style="
                                        border: none;
                                        border-top: 1px solid #d9dfe5;
                                        margin-top: 12px;
                                    ">

                                    <div style="
                                        font-size: 14px;
                                        color: #64748b;
                                        margin-top: 10px;
                                    ">
                                        ${webix.template.escape(obj.start || "-")}
                                        -
                                        ${webix.template.escape(obj.end || "-")}
                                    </div>
                                </div>
                            `;
                        }
                    },
                },
            ]
        }
    };
}
