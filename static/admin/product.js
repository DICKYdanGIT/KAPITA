function productContent() {
    return {
        id: "productContent",
        rows: [
            {
                view: "toolbar",
                css: "cart-title",
                height: 56,
                cols: [
                    { view: "label", label: "Data Produk" }
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
                                id: "totalProductsAdmin", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Jumlah Produk</div><div class="stat-value">--</div><div class="stat-note">-</div></div>`
                            },
                            {
                                id: "bestProductAdmin", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Produk Terlaris</div><div class="stat-value small">--</div><div class="stat-note">-</div></div>`
                            },
                            {
                                id: "totalStockProductAdmin", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Total Stok</div><div class="stat-value">--</div><div class="stat-note">-</div></div>`
                            },
                            {
                                id: "AverageMarginProductAdmin", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Rata-rata Margin</div><div class="stat-value">--%</div><div class="stat-note">-</div></div>`
                            }
                        ]
                    },

                    {
                        view: "datatable",
                        id: "tableProduct",
                        css: "admin-table",
                        scroll: "y",
                        borderless: true,
                        rowHeight: 48,
                        headerRowHeight: 38,
                        hover: "row-hover",
                        url: "/product/allMargin",

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
                                id: "cost_price",
                                header: { text: "HPP", css: "cell-right" },
                                css: "cell-right",
                                fillspace: 1,
                                template: function(obj) {
                                    return Number(obj.cost_price).toLocaleString("id-ID");
                                }
                            },
                            {
                                id: "price",
                                header: { text: "Harga Produk", css: "cell-right" },
                                css: "cell-right",
                                fillspace: 1,
                                template: function(obj) {
                                    return Number(obj.price).toLocaleString("id-ID");
                                }
                            },
                            {
                                id: "margin",
                                header: { text: "Margin", css: "cell-right" },
                                css: "cell-right",
                                fillspace: 1,
                                template: obj => obj.margin + "%"
                            },
                            {
                                id: "category_name",
                                header: "Kategori",
                                fillspace: 1,
                                template: function(obj) {
                                    return webix.template.escape(obj.category_name || "");
                                }
                            },
                            {
                                id: "stock",
                                header: { text: "Stock", css: "cell-right" },
                                css: "cell-right",
                                fillspace: 1
                            },
                            {
                                id: "status",
                                header: "Status",
                                fillspace: 1,
                                template: function(obj) {
                                    return obj.status
                                        ? "<button class='status-btn on product_status'>Aktif</button>"
                                        : "<button class='status-btn off product_status'>Tidak Aktif</button>";
                                }
                            }
                        ],

                        onClick: {
                            "product_status": function (e, id) {
                                const product = this.getItem(id);

                                webix.ajax().post(
                                    "/product/switch-status/" + product._id
                                ).then(function () {
                                    $$("tableProduct").clearAll();
                                    $$("tableProduct").load("/product/allMargin");
                                });

                                return false;
                            }
                        },

                        pager: "PagerProductAdmin"
                    },

                    PagerProductAdmin()
                ]
            }
        ]
    };
}

function PagerProductAdmin() {
    return {
        height: 40,
        cols: [
            {},
            {
                view: "pager",
                id: "PagerProductAdmin",
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


function productFunc(){
    loadTotalProductsAdmin();
    loadBestProductsAdmin();
    loadTotalStocksAdmin();
    averageMarginAdmin();
}


function loadTotalProductsAdmin() {
    webix.ajax().get("/product/total-products")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(data.total_products, "Jumlah Produk", "Total produk terdaftar")

            $$("totalProductsAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}


function loadBestProductsAdmin() {
    webix.ajax().get("/transaction/best-products")
        .then(function(response) {
            const data = response.json();
            const product = data[0];
            const html = cardHtml(
                product ? product.total_sold : 0, 
                "Produk Terlaris",
                webix.template.escape(product.name)
            )

            $$("bestProductAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}


function loadTotalStocksAdmin() {
    webix.ajax().get("/product/total-stock")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.total_stock, 
                "Total Stok",
                "Stok", 
            )

            $$("totalStockProductAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}


function averageMarginAdmin() {
    webix.ajax().get("/product/average-margin")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(
                data.average_margin, 
                "Rata-rata Margin",
                "Persen (%)", 
            )

            $$("AverageMarginProductAdmin").setHTML(html);
        })
        .catch(handleAjaxError);
}

