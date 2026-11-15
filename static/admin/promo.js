function promoContent() {
    return {
        id: "promoContent",
        rows: [
            {
                view: "toolbar",
                height: 56,
                css: "webix_header",
                cols: [
                    {
                        view: "label",
                        label: "Data Promo"
                    }
                ]
            },

            {
                padding: 22,
                rows: [
                    {
                        cols: [
                            {
                                id: "totalPromosAdmin",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">
                                            Jumlah Promo
                                        </div>
                                        <div style="font-size:27px; font-weight:700; margin-top:12px; color:#1e293b;">
                                            --
                                        </div>
                                        <div style="font-size:11px; color:#94a3b8; margin-top:5px;">
                                            Total promo terdaftar
                                        </div>
                                    </div>
                                `
                            },
                            {
                                id: "totalQuotaPromoAdmin",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">
                                            Total Kuota Promo
                                        </div>
                                        <div style="font-size:21px; font-weight:700; margin-top:12px; color:#1e293b;">
                                            --
                                        </div>
                                        <div style="font-size:11px; color:#94a3b8; margin-top:5px;">
                                            -
                                        </div>
                                    </div>
                                `
                            },
                            {
                                id: "totalPromoExpiredAdmin",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">
                                            Promo Expired
                                        </div>
                                        <div style="font-size:27px; font-weight:700; margin-top:12px; color:#1e293b;">
                                            --
                                        </div>
                                        <div style="font-size:11px; color:#94a3b8; margin-top:5px;">
                                            -
                                        </div>
                                    </div>
                                `
                            },
                            {
                                id: "totalPromoActiveAdmin",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">
                                            Total Promo Aktif
                                        </div>
                                        <div style="font-size:27px; font-weight:700; margin-top:12px; color:#1e293b;">
                                            --
                                        </div>
                                        <div style="font-size:11px; color:#94a3b8; margin-top:5px;">
                                            -
                                        </div>
                                    </div>
                                `
                            }
                        ]
                    },

                    { height: 20 },

                    {
                        view: "datatable",
                        id: "tablePromo",
                        scroll: false,
                        url: "/promo/",
                        select: "row",

                        columns: [
                            {
                                id: "name",
                                header: "Nama Promo",
                                fillspace: 2
                            },
                            {
                                id: "code",
                                header: "Kode Promo",
                                fillspace: 1
                            },
                            {
                                id: "promo_category_id",
                                header: "Kategori",
                                fillspace: 1
                            },
                            {
                                id: "quantity",
                                header: "Quantity",
                                fillspace: 1
                            },
                            {
                                id: "status",
                                header: "Status",
                                fillspace: 1,
                                template: function (obj) {
                                    return obj.status
                                        ? "<button class='promo_status'>Aktif</button>"
                                        : "<button class='promo_status'>Tidak Aktif</button>";
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
                                    loadTotalPromoActiveAdmin() 
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
                                    
                                    $$("promoDetailRequirement").setHTML(
                                        detail.buy.map(item =>
                                            webix.template.escape(item)
                                        ).join("<br>")
                                    );

                                    $$("promoDetailBenefit").setHTML(
                                        detail.get.map(item =>
                                            webix.template.escape(item)
                                        ).join("<br>")
                                    );

                                    $$("promoDetailPeriod").setValue(
                                        "Periode: " + detail.start +
                                        " sampai " + detail.end
                                    );

                                    $$("promoDetailWindow").show();

                                }).catch(function (error) {
                                    console.error("Gagal mengambil detail promo:", error);
                                    webix.message("Gagal memuat detail promo");
                                });
                            }
                        },
                        pager:"PagerPromoAdmin",
                    },
                    PagerPromoAdmin()
                ]
            }
        ]
    };
}

function PagerPromoAdmin() {
    return {
        view: "pager",
        id: "PagerPromoAdmin",
        size: 12,
        group: 5,
        template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
        autosize: false
    };
}


function promoDetailWindow() {
    return {
        view: "window",
        id: "promoDetailWindow",
        width: 400,
        height: 600,
        modal: true,
        close: true,
        position: "center",
        head: "Detail Promo",

        body: {
            padding: 15,
            rows: [
                {
                    view: "label",
                    label: "Syarat",
                    css: "webix_strong"
                },
                {
                    view: "template",
                    id: "promoDetailRequirement",
                    height: 100,
                    borderless: true,
                    template: ""
                },

                {
                    view: "label",
                    label: "Dapat",
                    css: "webix_strong"
                },
                {
                    view: "template",
                    id: "promoDetailBenefit",
                    height: 100,
                    borderless: true,
                    template: ""
                },

                {
                    view: "label",
                    id: "promoDetailPeriod",
                    label: "Periode: -"
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

