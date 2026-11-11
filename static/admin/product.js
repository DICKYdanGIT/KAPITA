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
                    },
                ]
            },

            {
                padding: 22,
                rows: [
                    {
                        cols: [
                            {
                                view: "button",
                                value: "+ Tambah Product",
                                width: 160,
                                css: "webix_primary",
                                click: function () {
                                    $$("productWindow").show();
                                }
                            },

                            {},

                            {
                                view: "search",
                                placeholder: "Cari nama produk...",
                                width: 280,
                                on: {
                                    onTimedKeyPress: function () {
                                        
                                    }
                                }
                            },

                            {
                                view: "button",
                                value: "⚲ Filter",
                                width: 110,
                                click: function () {
                                    
                                }
                            }
                        ]
                    },

                    { height: 16 },

                    {
                        view: "datatable",
                        id: "tableProduct",
                        url: "/product/",
                        columns: [
                            { id: "name", header: "Nama Produk", fillspace: 2 },
                            { id: "price", header: "Harga Produk", fillspace: 1 },
                            { id: "product_category_id", header: "Kategori", fillspace: 1 },
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
                            }
                        ],

                        onClick: {
                            "product_status": function (e, id) {
                                const product = this.getItem(id);

                                webix.ajax().post(
                                    "/product/switch-status/" + product._id
                                ).then(function () {
                                    $$("tableProduct").clearAll();
                                    $$("tableProduct").load("/product/");
                                    webix.message("Status product berhasil diubah");
                                });

                                return false;
                            }
                        }
                    }
                ]
            }
        ]
    };
};


function productForm() {
    return {
        view: "window",
        id: "productWindow",
        width: 650,
        height: 400,
        modal: true,
        close: true,
        position: "center",
        head: "Tambah Produk",

        body: {
            view: "form",
            id: "productForm",
            padding: 20,
            scroll: true,
            autoheight: true,
            autowidth: true,
            elements: [
                {
                    view: "text",
                    name: "name",
                    label: "Nama Produk",
                    required: true,
                    labelWidth: 120,
                },
                {
                    view: "text",
                    name: "harga",
                    label: "Harga",
                    required: true,
                    labelWidth: 120,
                    
                },
                {
                    view: "text",
                    name: "stock",
                    label: "Stok",
                    required: true,
                    labelWidth: 120,
                },
                {
                    view: "checkbox",
                    name: "status",
                    label: "Aktif",
                    value: 0,
                    labelWidth: 120,
                },
                {
                    view: "template",
                    template: "* Jika aktif product akan langsung tersedia di kasir",
                },
                {
                    cols: [
                        {
                            view: "button",
                            value: "Batal",
                            click: function() {
                                $$("productWindow").hide();
                                $$("productForm").clear();
                            }
                        },
                        {},
                        {
                            view: "button",
                            value: "Tambah Produk",
                            css: "webix_primary",
                            click: function() {
                                const data = $$("productForm");
                                if (!data.validate()) {
                                    webix.message({
                                        type: "error",
                                        text: "Data tidak valid. Silakan periksa kembali."
                                    });
                                }

                                console.log(data);

                                webix.ajax()
                                    .headers({
                                        "Content-Type": "application/json"
                                    })
                                    .post("/product/create", JSON.stringify(data))
                                    .then(function (response) {
                                        const result = response.json();

                                        console.log(result);
                                        webix.message(result.message || "Data berhasil ditambahkan");

                                        $$("tableProductCashier").clearAll();
                                        $$("tableProductCashier").load("/product");

                                    }, function (error) {
                                        console.log("Status:", error.status);
                                        console.log("Response:", error.responseText);

                                        webix.message({
                                            type: "error",
                                            text: "Transaksi gagal: " + error.status
                                        });
                                    });
                            }
                        }
                    ]
                },
            ]
        }
    };
}