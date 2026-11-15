function dashboardContent() {
    return {
        id: "dashboardContent",
        rows: [
            {
                view: "toolbar",
                height: 56,
                css: "webix_header",
                cols: [
                    {
                        view: "label",
                        label: "Dashboard"
                    }
                ]
            },

            {
                padding: 22,
                rows: [
                    {
                        cols: [
                            {
                                id: "totalSales",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">Total Penjualan</div>
                                        <div style="font-size:27px; font-weight:700; margin-top:12px; color:#1e293b;">--</div>
                                        <div style="font-size:11px; color:#94a3b8; margin-top:5px;">-</div>
                                    </div>
                                `
                            },
                            {
                                id: "totalTransactions",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">Total Transaksi</div>
                                        <div style="font-size:27px; font-weight:700; margin-top:12px; color:#1e293b;">--</div>
                                        <div style="font-size:11px; color:#94a3b8; margin-top:5px;">-</div>
                                    </div>
                                `
                            },
                            {
                                id: "totalProducts",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">Total Produk</div>
                                        <div style="font-size:27px; font-weight:700; margin-top:12px; color:#1e293b;">--</div>
                                        <div style="font-size:11px; color:#94a3b8; margin-top:5px;">-</div>
                                    </div>
                                `
                            },
                            {
                                id: "totalPromos",
                                view: "template",
                                height: 110,
                                borderless: true,
                                template: `
                                    <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
                                        <div style="color:#64748b; font-size:13px;">Total Promo</div>
                                        <div style="font-size:27px; font-weight:700; margin-top:12px; color:#1e293b;">--</div>
                                        <div style="font-size:11px; color:#94a3b8; margin-top:5px;">-</div>
                                    </div>
                                `
                            }
                        ]
                    },

                    { height: 22 },

                    {
                        view: "template",
                        template: "<h3 style='margin:0;'>Grafik Penjualan Harian</h3>",
                        height: 40,
                        borderless: true
                    },

                    {
                        view: "chart",
                        id: "dashboardSalesChart",
                        type: "bar",
                        height: 280,
                        padding: {
                            left: 100,
                            top: 30
                        },

                        xAxis: {
                            template: "#day#"
                        },

                        yAxis: {
                            start: 0,
                        },

                        legend: {
                            values: [
                                {
                                    text: "Penjualan Harian",
                                    color: "#e776e1"
                                }
                            ],
                            valign: "middle",
                            align: "right",
                            width: 100,
                            layout: "y"
                        },

                        eventRadius: 5,

                        series: [
                            {
                                alpha: 0.7,
                                value: "#total#",
                                color: "#e776e1",
                                tooltip: {
                                    template: function(obj) {
                                        return "Penjualan: Rp " +
                                            Number(obj.total || 0).toLocaleString("id-ID");
                                    }
                                }
                            }
                        ],

                        data: []
                    },

                    { height: 22 },

                    {
                        height: 210,
                        cols: [
                            {
                                rows: [
                                    {
                                        view: "template",
                                        template: "<h4 style='padding:10px 0px; margin:0;'>Produk Terlaris</h4>",
                                        height: 50,
                                        borderless: true
                                    },

                                    {
                                        view: "list",
                                        id: "bestProducts",
                                        scroll: false,
                                        height: 180,
                                        template: `
                                            <div style="padding:5px 15px; display:flex; justify-content:space-between; align-items:center;">
                                                <span style="color:#334155;">
                                                    #name#
                                                </span>
                                                <span style="color:#64748b;">
                                                    #total_sold# terjual
                                                </span>
                                            </div>
                                        `,
                                        type: {
                                            height: 55
                                        },
                                        url: "/transaction/best-products"
                                    }
                                ]
                            },
                            {
                                width: 22,
                            },
                            {
                                rows: [
                                    {
                                        view: "template",
                                        template: "<h4 style='padding:10px 0px; margin:0;'>Promo Terlaris</h4>",
                                        height: 50,
                                        borderless: true
                                    },

                                    {
                                        view: "list",
                                        id: "bestPromos",
                                        scroll: false,
                                        height: 180,
                                        template: `
                                            <div style="padding:12px 15px; display:flex; justify-content:space-between; align-items:center;">
                                                <div>
                                                    <div style="font-weight:600; color:#334155;">
                                                        #name#
                                                    </div>
                                                    <div style="font-size:12px; color:#64748b;">
                                                        #code#
                                                    </div>
                                                </div>
                                                <span style="color:#64748b;">
                                                    #total_used# kali digunakan
                                                </span>
                                            </div>
                                        `,
                                        type: {
                                            height: 55
                                        },
                                        url: "/transaction//best-promos"
                                    }
                                ]
                            },
                        ]
                    },
                ]
            }
        ]
    };
}


function dashboardFunc(){
    loadTotalSales();
    loadTotalTransactions();
    loadTotalProducts();
    loadTotalPromos();
    loadDailySales();
}


function loadTotalSales() {
    webix.ajax().get("/transaction/total-sales")
        .then(function(response) {
            const data = response.json();
            const html = cardHtml(data.total_sales, "Total Penjualan", "")
            
            $$("totalSales").setHTML(html);
        })
    .catch(handleAjaxError);
}


function loadTotalTransactions() {
    webix.ajax().get("/transaction/total-transactions")
    .then(function(response) {
        const data = response.json();
        const html = cardHtml(data.total_transactions, "Total Transaksi", "")
        
        $$("totalTransactions").setHTML(html);
    })
    .catch(handleAjaxError);
}


function loadTotalProducts() {
    webix.ajax().get("/product/total-products")
    .then(function(response) {
        const data = response.json();
        const html = cardHtml(data.total_products, "Total Produk", "")
        
        $$("totalProducts").setHTML(html);
    })
    .catch(handleAjaxError);
}


function loadTotalPromos() {
    webix.ajax().get("/promo/total-promos")
    .then(function(response) {
        const data = response.json();
        const html = cardHtml(data.total_promos, "Total Promo", "")

            $$("totalPromos").setHTML(html);
        })
    .catch(handleAjaxError);
}


function loadDailySales() {
    webix.ajax().get("/transaction/daily-sales")
        .then(function(response) {
            const data = response.json();

            const maxSales = Math.max(
                ...data.map(item => Number(item.total))
            );

            const maxAxis = Math.ceil(maxSales * 1.3 / 100000) * 100000;

            $$("dashboardSalesChart").define("yAxis", {
                start: 0,
                end: maxAxis,
                step: maxAxis / 5,
                template: value => Number(value).toLocaleString("id-ID")
            });

            $$("dashboardSalesChart").clearAll();
            $$("dashboardSalesChart").parse(data);
        })
        .catch(handleAjaxError);
}