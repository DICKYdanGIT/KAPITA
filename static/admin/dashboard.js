
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
                                view: "template",
                                template: `
                                    <div style="padding:15px">
                                        <div>Total Penjualan</div>
                                        <h2>Rp 5.250.000</h2>
                                    </div>
                                `,
                                height: 100,
                                css: "webix_shadow_small"
                            },
                            {
                                view: "template",
                                template: `
                                    <div style="padding:15px">
                                        <div>Total Transaksi</div>
                                        <h2>125</h2>
                                    </div>
                                `,
                                height: 100,
                                css: "webix_shadow_small"
                            },
                            {
                                view: "template",
                                template: `
                                    <div style="padding:15px">
                                        <div>Total Produk</div>
                                        <h2>48</h2>
                                    </div>
                                `,
                                height: 100,
                                css: "webix_shadow_small"
                            },
                            {
                                view: "template",
                                template: `
                                    <div style="padding:15px">
                                        <div>Promo Aktif</div>
                                        <h2>8</h2>
                                    </div>
                                `,
                                height: 100,
                                css: "webix_shadow_small"
                            }
                        ]
                    },

                    { height: 20 },

                    {
                        view: "template",
                        template: "<h3>Grafik Penjualan Mingguan</h3>",
                        height: 45,
                        borderless: true
                    },

                    {
                        view: "chart",
                        type: "bar",
                        value: "#total#",
                        height: 300,
                        data: [
                            { bulan: "Senin", total: 500000 },
                            { bulan: "Selasa", total: 750000 },
                            { bulan: "Rabu", total: 400000 },
                            { bulan: "Kamis", total: 900000 },
                            { bulan: "Jumat", total: 650000 },
                            { bulan: "Sabtu", total: 1200000 },
                            { bulan: "Minggu", total: 850000 }
                        ],
                        xAxis: {
                            template: "#bulan#"
                        },
                        yAxis: {
                            template: function(value) {
                                return (value / 1000) + "K";
                            }
                        },
                        tooltip: {
                            template: function(obj) {
                                return "Rp " + obj.total.toLocaleString("id-ID");
                            }
                        },
                        bar: {
                            color: "#1293f8",
                            radius: 4
                        }
                    }
                ]
            }
        ]
    };
}
