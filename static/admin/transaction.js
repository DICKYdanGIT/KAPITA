function transactionContent() {
    return {
        id: "transactionContent",
        rows: [
            {
                view: "toolbar",
                height: 56,
                css: "webix_header",
                cols: [
                    {
                        view: "label",
                        label: "Data Transaksi"
                    }
                ]
            },

            {
                padding: 22,
                rows: [
                    {
                        cols: [
                            {
                                id: "totalTransactionsAdmin",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">
                                            Jumlah Transaksi
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
                                id: "totalDicountAdmin",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">
                                            Total Penggunaan Promo
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
                                id: "averageTotalPurchasedAdmin",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">
                                            Rata-rata Total Pembelian
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
                                id: "totalPurchasedAdmin",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">
                                            Kasir Terbaik
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
                        id: "tableTransaction",
                        url: "/transaction/data",
                        scroll: false,
                        select: "row",

                        columns: [
                            { id: "cashier_name", header: "Kasir", fillspace: 1 },
                            { id: "cash", header: "Uang", fillspace: 0.7,
                                template: function(obj) {
                                    return Number(obj.cash).toLocaleString("id-ID");
                                }
                            },
                            { id: "total", header: "Total", fillspace: 0.7,
                                template: function(obj) {
                                    return Number(obj.total).toLocaleString("id-ID");
                                }
                            },
                            { id: "change", header: "Kembalian", fillspace: 0.7,
                                template: function(obj) {
                                    return Number(obj.change).toLocaleString("id-ID");
                                }
                            },
                            { id: "total_discount", header: "Diskon", fillspace: 0.7,
                                template: function(obj) {
                                    return Number(obj.total_discount).toLocaleString("id-ID");
                                }
                            },
                            { id: "promos", header: "Promo", fillspace: 0.7, 
                                template: function(obj) {
                                    if (!obj.promos || obj.promos.length === 0) {
                                        return "-";
                                    }

                                    return obj.promos.map(promo => {
                                        return webix.template.escape(promo.name);
                                    }).join(", ");
                                }
                            },
                            { id: "final_total", header: "Grand Total", fillspace: 0.7,
                                template: function(obj) {
                                    return Number(obj.final_total).toLocaleString("id-ID");
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

                                $$("transactionDetailBuy").clearAll();
                                $$("transactionDetailBuy").parse(bought);

                                $$("transactionDetailFree").clearAll();
                                $$("transactionDetailFree").parse(free);

                                $$("transactionDetailWindow").show();
                                }
                        },
                        pager:"PagerTransactionAdmin",
                    },
                    PagerTransactionAdmin()
                ]
            }
        ]
    };
}

function PagerTransactionAdmin() {
    return {
        view: "pager",
        id: "PagerTransactionAdmin",
        size: 12,
        group: 5,
        template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
        autosize: false
    };
}


function transactionDetailWindow() {
    return {
        view: "window",
        id: "transactionDetailWindow",
        width: 650,
        height: 550,
        modal: true,
        close: true,
        position: "center",
        head: "Detail Transaksi",

        body: {
            padding: 15,
            rows: [
                {
                    view: "label",
                    label: "Produk Dibeli",
                    css: "webix_strong"
                },
                {
                    view: "datatable",
                    id: "transactionDetailBuy",
                    height: 180,
                    select: false,
                    columns: [
                        {
                            id: "name",
                            header: "Nama Produk",
                            fillspace: 2
                        },
                        {
                            id: "price",
                            header: "Harga Satuan",
                            fillspace: 1,
                            template: function(obj) {
                                return Number(obj.price).toLocaleString("id-ID");
                            }
                        },
                        {
                            id: "qty",
                            header: "Jumlah",
                            fillspace: 0.7
                        },
                        {
                            id: "subtotal",
                            header: "Subtotal",
                            fillspace: 1,
                            template: function(obj) {
                                return Number(obj.subtotal).toLocaleString("id-ID");
                            }
                        }
                    ]
                },

                { height: 15 },

                {
                    view: "label",
                    label: "Produk Didapat (Gratis)",
                    css: "webix_strong"
                },
                {
                    view: "datatable",
                    id: "transactionDetailFree",
                    height: 180,
                    select: false,
                    columns: [
                        {
                            id: "name",
                            header: "Nama Produk",
                            fillspace: 2
                        },
                        {
                            id: "qty",
                            header: "Jumlah",
                            fillspace: 0.7
                        },
                    ]
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



