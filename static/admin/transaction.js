function transactionContent() {
    return {
        id: "transactionContent",
        rows: [
            {
                view: "toolbar",
                css: "cart-title",
                height: 56,
                cols: [
                    { view: "label", label: "Data Transaksi" }
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
                                id: "totalTransactionsAdmin", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Jumlah Transaksi</div><div class="stat-value">--</div><div class="stat-note">-</div></div>`
                            },
                            {
                                id: "totalDicountAdmin", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Total Penggunaan Promo</div><div class="stat-value small">--</div><div class="stat-note">-</div></div>`
                            },
                            {
                                id: "averageTotalPurchasedAdmin", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Rata-rata Total Pembelian</div><div class="stat-value">--</div><div class="stat-note">-</div></div>`
                            },
                            {
                                id: "totalPurchasedAdmin", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Kasir Terbaik</div><div class="stat-value small">--</div><div class="stat-note">-</div></div>`
                            }
                        ]
                    },

                    {
                        view: "datatable",
                        id: "tableTransaction",
                        css: "admin-table",
                        url: "/transaction/data",
                        scroll: "y",
                        select: "row",
                        borderless: true,
                        rowHeight: 48,
                        headerRowHeight: 38,
                        hover: "row-hover",

                        columns: [
                            {
                                id: "cashier_name",
                                header: "Kasir",
                                fillspace: 1,
                                template: function(obj) {
                                    return webix.template.escape(obj.cashier_name || "");
                                }
                            },
                            {
                                id: "created_at",
                                header: "Tanggal Transaksi",
                                fillspace: 1.5,
                                template: function(obj) {
                                    if (!obj.created_at) return "-";

                                    const [date, time] = obj.created_at.split(" ");

                                    const [day, month, year] = date.split("-");

                                    const bulan = [
                                        "Januari", "Februari", "Maret",
                                        "April", "Mei", "Juni",
                                        "Juli", "Agustus", "September",
                                        "Oktober", "November", "Desember"
                                    ];

                                    return `${day} ${bulan[Number(month) - 1]} ${year}, ${time}`;
                                }
                            },
                            {
                                id: "promos",
                                header: "Promo",
                                fillspace: 0.7,
                                template: function(obj) {
                                    if (!obj.promos || obj.promos.length === 0) {
                                        return "<span class='promo-empty'>-</span>";
                                    }

                                    return obj.promos.map(promo => {
                                        return "<span class='tag-promo'>" + webix.template.escape(promo.name) + "</span>";
                                    }).join("");
                                }
                            },
                            {
                                id: "total",
                                header: { text: "Total", css: "cell-right" },
                                css: "cell-right",
                                fillspace: 0.9,
                                template: function(obj) {
                                    return Number(obj.total).toLocaleString("id-ID");
                                }
                            },
                            {
                                id: "total_discount",
                                header: { text: "Diskon", css: "cell-right" },
                                css: "cell-right",
                                fillspace: 0.8,
                                template: function(obj) {
                                    return obj.total_discount > 0
                                        ? "<span class='money-discount'>- " + Number(obj.total_discount).toLocaleString("id-ID") + "</span>"
                                        : "<span class='money-muted'>0</span>";
                                }
                            },
                            {
                                id: "final_total",
                                header: { text: "Grand Total", css: "cell-right" },
                                css: "cell-right",
                                fillspace: 1,
                                template: function(obj) {
                                    return "<span class='money-strong'>" + Number(obj.final_total).toLocaleString("id-ID") + "</span>";
                                }
                            },
                            {
                                id: "cash",
                                header: { text: "Uang", css: "cell-right" },
                                css: "cell-right",
                                fillspace: 0.9,
                                template: function(obj) {
                                    return Number(obj.cash).toLocaleString("id-ID");
                                }
                            },
                            {
                                id: "change",
                                header: { text: "Kembalian", css: "cell-right" },
                                css: "cell-right",
                                fillspace: 0.9,
                                template: function(obj) {
                                    return Number(obj.change).toLocaleString("id-ID");
                                }
                            }
                        ],

                        on: {
                            onItemClick: function (id) {
                                const transaction = this.getItem(id);

                                const bought = transaction.items.filter(
                                    item => !item.is_free
                                );

                                const free = transaction.items.filter(
                                    item => item.is_free
                                );

                                $$("transactionDetailInfo").setValues(transaction);
                                $$("transactionDetailSummary").setValues(transaction);

                                $$("transactionDetailBuy").clearAll();
                                $$("transactionDetailBuy").parse(bought);

                                $$("transactionDetailFree").clearAll();
                                $$("transactionDetailFree").parse(free);

                                // bagian gratis hanya tampil kalau ada produk gratis
                                if (free.length) {
                                    $$("transactionDetailFreeSection").show();
                                } else {
                                    $$("transactionDetailFreeSection").hide();
                                }

                                $$("transactionDetailWindow").show();
                            }
                        },

                        pager: "PagerTransactionAdmin"
                    },

                    PagerTransactionAdmin()
                ]
            }
        ]
    };
}


function PagerTransactionAdmin() {
    return {
        height: 40,
        cols: [
            {},
            {
                view: "pager",
                id: "PagerTransactionAdmin",
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


function transactionDetailWindow() {
    return {
        view: "window",
        id: "transactionDetailWindow",
        css: "checkout-window",
        width: 680,
        height: 680,
        modal: true,
        close: true,
        position: "center",
        head: "Detail Transaksi",

        body: {
            css: "cashier-main",
            padding: 16,
            margin: 10,
            rows: [
                {
                    id: "transactionDetailInfo",
                    view: "template",
                    css: "detail-info",
                    borderless: true,
                    height: 64,
                    data: {},
                    template: function(obj) {
                        const promos = (obj.promos || []).map(promo => promo.name).join(", ") || "-";

                        let tanggal = "-";
                        if (obj.created_at) {
                            const [date, time] = obj.created_at.split(" ");
                            const [day, month, year] = date.split("-");

                            const bulan = [
                                "Januari", "Februari", "Maret",
                                "April", "Mei", "Juni",
                                "Juli", "Agustus", "September",
                                "Oktober", "November", "Desember"
                            ];

                            tanggal = `${day} ${bulan[Number(month) - 1]} ${year}, ${time}`;
                        }

                        return `
                            <div class="detail-info-grid">
                                <div class="detail-info-item wide">
                                    <div class="detail-info-label">Tanggal</div>
                                    <div class="detail-info-value">${webix.template.escape(tanggal)}</div>
                                </div>
                                <div class="detail-info-item">
                                    <div class="detail-info-label">Kasir</div>
                                    <div class="detail-info-value">${webix.template.escape(obj.cashier_name || "-")}</div>
                                </div>
                                <div class="detail-info-item">
                                    <div class="detail-info-label">Promo</div>
                                    <div class="detail-info-value">${webix.template.escape(promos)}</div>
                                </div>
                            </div>
                        `;
                    }
                },

                { view: "template", template: "Produk Dibeli", css: "detail-label", borderless: true, height: 28 },
                {
                    view: "datatable",
                    id: "transactionDetailBuy",
                    css: "admin-table",
                    borderless: true,
                    select: false,
                    scroll: "y",
                    rowHeight: 42,
                    headerRowHeight: 36,
                    columns: [
                        {
                            id: "name",
                            header: "Nama Produk",
                            fillspace: 2,
                            template: function(obj) {
                                return webix.template.escape(obj.name || "");
                            }
                        },
                        {
                            id: "price",
                            header: { text: "Harga Satuan", css: "cell-right" },
                            css: "cell-right",
                            fillspace: 1,
                            template: function(obj) {
                                return Number(obj.price).toLocaleString("id-ID");
                            }
                        },
                        {
                            id: "qty",
                            header: { text: "Jumlah", css: "cell-right" },
                            css: "cell-right",
                            fillspace: 0.7
                        },
                        {
                            id: "subtotal",
                            header: { text: "Subtotal", css: "cell-right" },
                            css: "cell-right",
                            fillspace: 1,
                            template: function(obj) {
                                return Number(obj.subtotal).toLocaleString("id-ID");
                            }
                        }
                    ]
                },

                {
                    id: "transactionDetailFreeSection",
                    height: 170,
                    rows: [
                        { view: "template", template: "Produk Didapat (Gratis)", css: "detail-label free", borderless: true, height: 28 },
                        {
                            view: "datatable",
                            id: "transactionDetailFree",
                            css: "admin-table",
                            borderless: true,
                            select: false,
                            scroll: "y",
                            rowHeight: 42,
                            headerRowHeight: 36,
                            columns: [
                                {
                                    id: "name",
                                    header: "Nama Produk",
                                    fillspace: 2,
                                    template: function(obj) {
                                        return webix.template.escape(obj.name || "");
                                    }
                                },
                                {
                                    id: "qty",
                                    header: { text: "Jumlah", css: "cell-right" },
                                    css: "cell-right",
                                    fillspace: 0.7
                                }
                            ]
                        }
                    ]
                },

                {
                    id: "transactionDetailSummary",
                    view: "template",
                    css: "detail-summary",
                    borderless: true,
                    height: 170,
                    data: {},
                    template: function(obj) {
                        return `
                            <div class="detail-summary-card">
                                <div class="sum-row"><span>Total</span><b>${Number(obj.total || 0).toLocaleString("id-ID")}</b></div>
                                <div class="sum-row discount"><span>Diskon</span><b>- ${Number(obj.total_discount || 0).toLocaleString("id-ID")}</b></div>
                                <div class="sum-row"><span>Uang</span><b>${Number(obj.cash || 0).toLocaleString("id-ID")}</b></div>
                                <div class="sum-row"><span>Kembalian</span><b>${Number(obj.change || 0).toLocaleString("id-ID")}</b></div>
                                <div class="sum-row total"><span>Grand Total</span><b>${Number(obj.final_total || 0).toLocaleString("id-ID")}</b></div>
                            </div>
                        `;
                    }
                }
            ]
        }
    };
}


function transactionFunc(){
    loadTotalTransactionsAdmin();
    loadTotalDicountAdmin();
    loadAverageTotalPurchasedAdmin();
    loadTotalPurchasedAdmin();
}


function loadTotalTransactionsAdmin() {
    webix.ajax().get("/transaction/total-transactions")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.total_transactions, 
                "Jumlah Transaksi", 
                "Total transaksi terdaftar")

            $$("totalTransactionsAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}


function loadTotalDicountAdmin() {
    webix.ajax().get("/transaction/total-discount")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.total_discount,
                "Total Penggunaan Promo", 
                "Promo")

            $$("totalDicountAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}


function loadAverageTotalPurchasedAdmin() {
    webix.ajax().get("/transaction/average-purchase")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.average_purchase,
                "Rata-rata Total Pembelian", 
                "Rupiah")

            $$("averageTotalPurchasedAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}


function loadTotalPurchasedAdmin() {
    webix.ajax().get("/transaction/total-sales")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.total_sales,
                "Total Pembelian", 
                "Rupiah")

            $$("totalPurchasedAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}


function transactionFunc(){
    loadTotalTransactionsAdmin();
    loadTotalDicountAdmin();
    loadAverageTotalPurchasedAdmin();
    loadTotalPurchasedAdmin();
}


function loadTotalTransactionsAdmin() {
    webix.ajax().get("/transaction/total-transactions")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.total_transactions, 
                "Jumlah Transaksi", 
                "Total transaksi terdaftar")

            $$("totalTransactionsAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}


function loadTotalDicountAdmin() {
    webix.ajax().get("/transaction/total-discount")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.total_discount,
                "Total Penggunaan Promo", 
                "Promo")

            $$("totalDicountAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}


function loadAverageTotalPurchasedAdmin() {
    webix.ajax().get("/transaction/average-purchase")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.average_purchase,
                "Rata-rata Total Pembelian", 
                "Rupiah")

            $$("averageTotalPurchasedAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}


function loadTotalPurchasedAdmin() {
    webix.ajax().get("/transaction/total-sales")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.total_sales,
                "Total Pembelian", 
                "Rupiah")

            $$("totalPurchasedAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}



