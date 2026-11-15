function productContent() {
    return {
        id: "productContent",
        rows: [
            {
                view: "toolbar",
                height: 56,
                css: "webix_header",
                cols: [
                    {
                        view: "label",
                        label: "Data Produk"
                    }
                ]
            },

            {
                padding: 22,
                rows: [
                    {
                        cols: [
                            {
                                id: "totalProductsAdmin",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">
                                            Jumlah Produk
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
                                id: "bestProductAdmin",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">
                                            Produk Terlaris
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
                                id: "totalStockProductAdmin",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">
                                            Total Stok
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
                                id: "AverageMarginProductAdmin",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">
                                            Rata-rata Margin
                                        </div>
                                        <div style="font-size:27px; font-weight:700; margin-top:12px; color:#1e293b;">
                                            --%
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
                        id: "tableProduct",
                        scroll: false,
                        url: "/product/allMargin",

                        columns: [
                            { id: "name", header: "Nama Produk", fillspace: 2 },
                            { id: "cost_price", header: "HPP", fillspace: 1,
                                template: function(obj) {
                                    return Number(obj.cost_price).toLocaleString("id-ID");
                                }
                            },
                            { id: "price", header: "Harga Produk", fillspace: 1,
                                template: function(obj) {
                                    return Number(obj.price).toLocaleString("id-ID");
                                }
                            },
                            { id: "margin", header: "Margin", fillspace: 1,
                                template: obj => obj.margin + "%"
                            },
                            { id: "category_name", header: "Kategori", fillspace: 1 },
                            { id: "stock", header: "Stock", fillspace: 1 },
                            {
                                id: "status",
                                header: "Status",
                                fillspace: 1,
                                template: function (obj) {
                                    return obj.status
                                        ? "<button class='product_status'>Aktif</button>"
                                        : "<button class='product_status'>Tidak Aktif</button>";
                                }
                            },
                        ],

                        onClick: {
                            "product_status": function (e, id) {
                                const product = this.getItem(id);

                                webix.ajax().post(
                                    "/product/switch-status/" + product._id
                                ).then(function () {
                                    $$("tableProduct").clearAll();
                                    $$("tableProduct").load("/product/allMargin");
                                    webix.message("Status product berhasil diubah");
                                });

                                return false;
                            }
                        },
                        pager:"PagerProductAdmin",
                    },
                    PagerProductAdmin()
                ]
            }
        ]
    };
}

function PagerProductAdmin() {
    return {
        view: "pager",
        id: "PagerProductAdmin",
        size: 12,
        group: 5,
        template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
        autosize: false
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
                product.name, 
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

