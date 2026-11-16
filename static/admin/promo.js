function promoContent() {
    return {
        id: "promoContent",
        rows: [
            {
                view: "toolbar",
                css: "cart-title",
                height: 56,
                cols: [
                    { view: "label", label: "Data Promo" }
                ]
            },

            {
                css: "cashier-main",
                padding: 20,
                margin: 14,
                rows: [
                    {
                        height: 110,
                        margin: 14,
                        cols: [
                            {
                                id: "totalPromosAdmin", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Jumlah Promo</div><div class="stat-value">--</div><div class="stat-note">Total promo terdaftar</div></div>`
                            },
                            {
                                id: "totalQuotaPromoAdmin", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Total Kuota Promo</div><div class="stat-value small">--</div><div class="stat-note">-</div></div>`
                            },
                            {
                                id: "totalPromoExpiredAdmin", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Promo Expired</div><div class="stat-value">--</div><div class="stat-note">-</div></div>`
                            },
                            {
                                id: "totalPromoActiveAdmin", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Total Promo Aktif</div><div class="stat-value">--</div><div class="stat-note">-</div></div>`
                            }
                        ]
                    },

                    {
                        view: "datatable",
                        id: "tablePromo",
                        css: "admin-table",
                        scroll: "y",
                        borderless: true,
                        rowHeight: 48,
                        headerRowHeight: 38,
                        hover: "row-hover",
                        url: "/promo/",

                        columns: [
                            {
                                id: "name",
                                header: "Nama Promo",
                                fillspace: 2,
                                template: function(obj) {
                                    return "<b>" + webix.template.escape(obj.name) + "</b>";
                                }
                            },
                            {
                                id: "code",
                                header: "Kode Promo",
                                fillspace: 1,
                                template: function(obj) {
                                    return "<span class='tag-promo'>" + webix.template.escape(obj.code) + "</span>";
                                }
                            },
                            { id: "promo_category_id", header: "Kategori", fillspace: 1 },
                            {
                                id: "quantity",
                                header: { text: "Quantity", css: "cell-right" },
                                css: "cell-right",
                                fillspace: 1,
                                template: function(obj) {
                                    return "<span class='money-strong'>" + Number(obj.quantity).toLocaleString("id-ID") + "</span>";
                                }
                            },
                            {
                                id: "status",
                                header: "Status",
                                fillspace: 1,
                                template: function(obj) {
                                    return obj.status
                                        ? "<button class='status-btn on promo_status'>Aktif</button>"
                                        : "<button class='status-btn off promo_status'>Tidak Aktif</button>";
                                }
                            }
                        ],

                        onClick: {
                            "promo_status": function (e, id) {
                                const promo = this.getItem(id);

                                webix.ajax().post(
                                    "/promo/switch-status/" + promo._id
                                ).then(function () {
                                    $$("tablePromo").clearAll();
                                    $$("tablePromo").load("/promo/");
                                    loadTotalPromoActiveAdmin();
                                    webix.message("Status promo berhasil diubah");
                                });

                                return false;
                            }
                        },

                        on: {
                            onItemClick: function (id) {
                                const promo = this.getItem(id);

                                webix.ajax().get(
                                    "/promo/display/" + promo._id
                                ).then(function (response) {
                                    const detail = response.json();

                                    $$("promoDetailHead").setValues(promo);

                                    $$("promoDetailRequirement").setHTML(
                                        detail.buy.length
                                            ? detail.buy.map(item => "<div class='promo-line'>" + webix.template.escape(item) + "</div>").join("")
                                            : "<span class='promo-empty'>-</span>"
                                    );

                                    $$("promoDetailBenefit").setHTML(
                                        detail.get.length
                                            ? detail.get.map(item => "<div class='promo-line get'>" + webix.template.escape(item) + "</div>").join("")
                                            : "<span class='promo-empty'>-</span>"
                                    );

                                    $$("promoDetailPeriod").setValues({
                                        start: detail.start,
                                        end: detail.end
                                    });

                                    $$("promoDetailWindow").show();

                                }).catch(function (error) {
                                    console.error("Gagal mengambil detail promo:", error);
                                    webix.message("Gagal memuat detail promo");
                                });
                            }
                        },

                        pager: "PagerPromoAdmin"
                    },

                    PagerPromoAdmin()
                ]
            }
        ]
    };
}

function PagerPromoAdmin() {
    return {
        height: 40,
        cols: [
            {},
            {
                view: "pager",
                id: "PagerPromoAdmin",
                css: "cashier-pager",
                size: 12,
                group: 5,
                template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                autosize: true
            },
            {}
        ]
    };
}


function promoDetailWindow() {
    return {
        view: "window",
        id: "promoDetailWindow",
        css: "promo-window",
        width: 460,
        height: 580,
        modal: true,
        close: true,
        move: true,
        position: "center",
        head: "Detail Promo",

        body: {
            css: "cashier-main",
            padding: 16,
            margin: 10,
            rows: [
                {
                    id: "promoDetailHead",
                    view: "template",
                    css: "detail-head",
                    borderless: true,
                    height: 84,
                    data: {},
                    template: function(obj) {
                        return `
                            <div class="detail-head-card">
                                <div class="detail-head-main">
                                    <div class="detail-head-name">${webix.template.escape(obj.name || "-")}</div>
                                    <span class="tag-promo">${webix.template.escape(obj.code || "-")}</span>
                                </div>
                                <div class="detail-head-qty">
                                    <div class="detail-info-label">Kuota</div>
                                    <div class="detail-info-value">${Number(obj.quantity || 0).toLocaleString("id-ID")}</div>
                                </div>
                            </div>
                        `;
                    }
                },

                {
                    view: "template",
                    css: "detail-label",
                    borderless: true,
                    height: 28,
                    template: "Syarat"
                },
                {
                    view: "template",
                    id: "promoDetailRequirement",
                    css: "detail-list",
                    borderless: true,
                    template: ""
                },

                {
                    view: "template",
                    css: "detail-label free",
                    borderless: true,
                    height: 28,
                    template: "Dapat"
                },
                {
                    view: "template",
                    id: "promoDetailBenefit",
                    css: "detail-list get",
                    borderless: true,
                    template: ""
                },

                {
                    id: "promoDetailPeriod",
                    view: "template",
                    css: "detail-info",
                    borderless: true,
                    height: 64,
                    data: {},
                    template: function(obj) {
                        return `
                            <div class="detail-info-grid">
                                <div class="detail-info-item">
                                    <div class="detail-info-label">Mulai</div>
                                    <div class="detail-info-value">${webix.template.escape(obj.start || "-")}</div>
                                </div>
                                <div class="detail-info-item">
                                    <div class="detail-info-label">Berakhir</div>
                                    <div class="detail-info-value">${webix.template.escape(obj.end || "-")}</div>
                                </div>
                            </div>
                        `;
                    }
                }
            ]
        }
    };
}


function promoFunc(){
    loadTotalPromosAdmin();
    loadTotalQuotaPromoAdmin();
    loadTotalPromoExpiredAdmin();
    loadTotalPromoActiveAdmin();
}


function loadTotalPromosAdmin() {
    webix.ajax().get("/promo/total-promos")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.total_promos, 
                "Jumlah Promo", 
                "Total promo terdaftar"
            )

            $$("totalPromosAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}


function loadTotalQuotaPromoAdmin() {
    webix.ajax().get("/promo/total-quota")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.total_quota, 
                "Total Kuota Promo", 
                "Total"
            )

            $$("totalQuotaPromoAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}


function loadTotalPromoExpiredAdmin() {
    webix.ajax().get("/promo/expired-promos")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.expired_promos, 
                "Total Promo Expired", 
                "Total"
            )

            $$("totalPromoExpiredAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}


function loadTotalPromoActiveAdmin() {
    webix.ajax().get("/promo/active-promos")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.active_promos, 
                "Total Promo Aktif", 
                "Total"
            )

            $$("totalPromoActiveAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}

