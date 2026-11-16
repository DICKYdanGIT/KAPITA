function dashboardContent() {
    return {
        id: "dashboardContent",
        rows: [
            {
                view: "toolbar",
                css: "cart-title",
                height: 56,
                cols: [
                    { view: "label", label: "Dashboard" }
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
                                id: "totalSales", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Total Penjualan</div><div class="stat-value small">--</div><div class="stat-note">-</div></div>`
                            },
                            {
                                id: "totalTransactions", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Total Transaksi</div><div class="stat-value">--</div><div class="stat-note">-</div></div>`
                            },
                            {
                                id: "totalProducts", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Total Produk</div><div class="stat-value">--</div><div class="stat-note">-</div></div>`
                            },
                            {
                                id: "totalPromos", view: "template", borderless: true, css: "stat-wrap",
                                template: `<div class="stat-card"><div class="stat-label">Total Promo</div><div class="stat-value">--</div><div class="stat-note">-</div></div>`
                            }
                        ]
                    },

                    {
                        css: "panel-card",
                        padding: 16,
                        margin: 8,
                        gravity: 1.5,
                        minHeight: 260,
                        rows: [
                            {
                                view: "template",
                                css: "panel-head",
                                borderless: true,
                                height: 32,
                                template: "<div class='panel-title'>Grafik Penjualan Harian</div>"
                            },
                            {
                                view: "chart",
                                id: "dashboardSalesChart",
                                type: "bar",
                                borderless: true,
                                barWidth: 36,
                                padding: {
                                    left: 80,
                                    right: 20,
                                    top: 20,
                                    bottom: 40
                                },

                                xAxis: {
                                    template: "#day#"
                                },

                                yAxis: {
                                    start: 0,
                                    template: function(value) {
                                        return Number(value).toLocaleString("id-ID");
                                    }
                                },

                                eventRadius: 5,

                                series: [
                                    {
                                        alpha: 0.9,
                                        value: "#total#",
                                        color: "#49345F",
                                        tooltip: {
                                            template: function(obj) {
                                                return "Penjualan: Rp " +
                                                    Number(obj.total || 0).toLocaleString("id-ID");
                                            }
                                        }
                                    }
                                ],

                                data: []
                            }
                        ]
                    },

                    {
                        gravity: 1,
                        minHeight: 230,
                        margin: 14,
                        cols: [
                            {
                                css: "panel-card",
                                padding: 16,
                                margin: 8,
                                rows: [
                                    {
                                        view: "template",
                                        css: "panel-head",
                                        borderless: true,
                                        height: 32,
                                        template: "<div class='panel-title'>Produk Terlaris</div>"
                                    },
                                    {
                                        view: "list",
                                        id: "bestProducts",
                                        css: "rank-list",
                                        borderless: true,
                                        scroll: "y",
                                        select: false,
                                        type: {
                                            height: 52
                                        },
                                        template: `
                                            <div class="rank-row">
                                                <span class="rank-name">#name#</span>
                                                <span class="rank-meta">#total_sold# terjual</span>
                                            </div>
                                        `,
                                        url: "/transaction/best-products"
                                    }
                                ]
                            },

                            {
                                css: "panel-card",
                                padding: 16,
                                margin: 8,
                                rows: [
                                    {
                                        view: "template",
                                        css: "panel-head",
                                        borderless: true,
                                        height: 32,
                                        template: "<div class='panel-title'>Promo Terlaris</div>"
                                    },
                                    {
                                        view: "list",
                                        id: "bestPromos",
                                        css: "rank-list",
                                        borderless: true,
                                        scroll: "y",
                                        select: false,
                                        type: {
                                            height: 52
                                        },
                                        template: `
                                            <div class="rank-row">
                                                <div>
                                                    <div class="rank-name">#name#</div>
                                                    <div class="rank-sub">#code#</div>
                                                </div>
                                                <span class="rank-meta">#total_used# kali digunakan</span>
                                            </div>
                                        `,
                                        url: "/transaction/best-promos"
                                    }
                                ]
                            }
                        ]
                    }
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