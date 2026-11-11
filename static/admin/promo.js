function promoContent(){
    return{
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
                                value: "+ Tambah Promo",
                                width: 160,
                                css: "webix_primary",
                                click: function() {
                                    $$("promoWindow").show();
                                }
                            },
                            {},
                            {
                                view: "search",
                                placeholder: "Cari nama promo...",
                                width: 280,
                                on: {
                                    onTimedKeyPress: function () {
                                        // Fungsi pencarian
                                    }
                                }
                            },

                            {
                                view: "button",
                                value: "⚲ Filter",
                                width: 110,
                                click: function () {
                                    // Fungsi filter
                                }
                            }
                        ]
                    },

                    { height: 16 },

                    {
                        view: "datatable",
                        id: "tablePromo",
                        url: "/promo/",
                        select: "row",
                        columns: [
                            { id: "name", header: "Nama Promo", fillspace: 2 },
                            { id: "code", header: "Kode Promo", fillspace: 1 },
                            { id: "promo_category_id", header: "Kategori", fillspace: 1 },
                            { id: "quantity", header: "Quantity", fillspace: 1 },
                            {
                                id: "status",
                                header: "Status",
                                fillspace: 1,
                                template: function (obj) {
                                    return obj.status
                                        ? "<button class='promo_status'>Aktif</button>"
                                        : "<button class='promo_status'>Tidak Aktif</button>";
                                }
                            },
                            {
                                id: "edit",
                                header: "",
                                width: 60,
                                template: "<span class='webix_icon wxi-pencil'></span>"
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
                                    webix.message("Status promo berhasil diubah");
                                });

                                return false;
                            }
                        },
                        // on: {
                        //     onItemClick: function (id) {
                        //         const promo = this.getItem(id);

                        //         $$("promoDetailWindow").show();
                        //         $$("formPromoDetail").setValues(promo);
                        //     }
                        // },
                    }
                ]
            }
        ]
    };
};

function promoForm() {
    return {
        view: "window",
        id: "promoWindow",
        width: 650,
        height: 750,
        modal: true,
        close: true,
        position: "center",
        head: "Tambah Promo",

        body: {
            view: "form",
            id: "promoForm",
            scroll: true,

            elements: [
                {
                    cols: [
                        {
                            view: "button",
                            value: "Batal",
                            click: function() {
                                $$("promoWindow").hide();
                            }
                        },
                        {},
                        {
                            view: "button",
                            value: "Simpan Promo",
                            css: "webix_primary",
                            click: function() {
                                webix.message("Siap menyimpan promo");
                            }
                        }
                    ]
                },
                {
                    view: "select",
                    name: "promo_category_id",
                    label: "Tipe Promo",
                    value: 1,
                    options: [
                        { id: 1, value: "Buy X Get Y" },
                        { id: 2, value: "Buy X Get Discount (%)" },
                        { id: 3, value: "Minimum Purchase Discount (%)" },
                        { id: 4, value: "Minimum Purchase Discount (Nominal)" }
                    ],
                    on: {
                        onChange: function(value) {
                            updatePromoConfig(Number(value));
                        }
                    }
                },

                { height: 10 },

                { view: "text", name: "name", label: "Nama Promo" },
                { view: "text", name: "code", label: "Kode Promo" },
                { view: "text", name: "quantity", label: "Quantity" },

                {
                    cols: [
                        {
                            view: "checkbox",
                            name: "status",
                            label: "Aktif",
                            value: 1
                        },
                        {
                            view: "datepicker",
                            name: "start",
                            label: "Mulai",
                            timepicker: true,
                            format: "%m.%d.%Y"
                        }
                    ]
                },

                {
                    cols: [
                        {
                        },
                        {
                            view: "datepicker",
                            name: "end",
                            label: "Akhir",
                            timepicker: true,
                            format: "%m.%d.%Y"
                        }
                    ]
                },

                { height: 15 },

                {
                    view: "fieldset",
                    label: "Konfigurasi Promo",
                    body: {
                        rows: [
                            {
                                view: "multiview",
                                id: "promoConfigView",
                                animate: false,
                                cells: [
                                    promoConfigCategory1(),
                                    promoConfigCategory2(),
                                    promoConfigCategory3(),
                                    promoConfigCategory4()
                                ]
                            }
                        ]
                    }
                },
            ]
        }
    };
}

function createProductRow(type, number) {
    return {
        cols: [
            {
                view: "select",
                name: type + "_product_" + number,
                placeholder: "Pilih produk",
                options: "/product/",
                width: 350
            },
            {
                view: "counter",
                name: type + "_qty_" + number,
                value: 1,
                min: 1,
                width: 110
            },
            {
                view: "icon",
                icon: "wxi-trash",
                width: 35,
                click: function() {
                    const row = this.getParentView();
                    const container = row.getParentView();

                    container.removeView(row);
                }
            }
        ]
    };
}

function updatePromoConfig(category) {
    const configMap = {
        1: "promoConfig1",
        2: "promoConfig2",
        3: "promoConfig3",
        4: "promoConfig4"
    };

    $$("promoConfigView").setValue(configMap[category]);
}

function promoConfigCategory1() {
    return {
        id: "promoConfig1",
        rows: [
            { view: "label", label: "BUY - Produk yang harus dibeli" },

            {
                view: "layout",
                id: "buyProductRows",
                rows: [createProductRow("buy", 1)]
            },

            {
                view: "button",
                value: "+ Tambah Produk BUY",
                click: function() {
                    addProductRow("buy");
                }
            },

            { height: 15 },

            { view: "label", label: "GET - Produk yang didapat" },

            {
                view: "layout",
                id: "getProductRows",
                rows: [createProductRow("get", 1)]
            },

            {
                view: "button",
                value: "+ Tambah Produk GET",
                click: function() {
                    addProductRow("get");
                }
            }
        ]
    };
}

function promoConfigCategory2() {
    return {
        id: "promoConfig2",
        rows: [
            { view: "label", label: "BUY - Produk yang harus dibeli" },

            {
                view: "layout",
                id: "buyDiscountRows",
                rows: [createProductRow("buyDiscount", 1)]
            },

            {
                view: "button",
                value: "+ Tambah Produk BUY",
                click: function() {
                    addProductRow("buyDiscount");
                }
            },

            { height: 15 },

            { view: "text", name: "discount", label: "Diskon (%)" },
            { view: "text", name: "max_discount", label: "Maksimal Diskon (Rp)" }
        ]
    };
}

function promoConfigCategory3() {
    return {
        id: "promoConfig3",
        rows: [
            {
                view: "text",
                name: "minimum_purchase",
                label: "Minimum Pembelian (Rp)"
            },
            {
                view: "text",
                name: "discount",
                label: "Diskon (%)"
            },
            {
                view: "text",
                name: "max_discount",
                label: "Maksimal Diskon (Rp)"
            }
        ]
    };
}

function promoConfigCategory4() {
    return {
        id: "promoConfig4",
        rows: [
            {
                view: "text",
                name: "minimum_purchase",
                label: "Minimum Pembelian (Rp)"
            },
            {
                view: "text",
                name: "discount",
                label: "Diskon Nominal (Rp)"
            }
        ]
    };
}

function addProductRow(type) {
    const container = $$(type + "ProductRows") || $$(type + "Rows");

    if (!container) {
        webix.message("Container produk tidak ditemukan");
        return;
    }

    const count = container.getChildViews().length;

    if (count >= 10) {
        webix.message("Maksimal 10 produk");
        return;
    }

    container.addView(createProductRow(type, count + 1));
}

function promoDetailWindow() {
    return {
        view: "window",
        id: "promoDetailWindow",
        width: 500,
        height: 400,
        modal: true,
        close: true,
        head: "Detail Promo",

        body: {
            rows: [
                {
                    view: "form",
                    id: "formPromoDetail",
                    elements: [
                        {
                            view: "text",
                            name: "name",
                            label: "Nama Promo",
                            readonly: true
                        },
                        {
                            view: "text",
                            name: "code",
                            label: "Kode Promo",
                            readonly: true
                        },
                        {
                            view: "text",
                            name: "promo_category_id",
                            label: "Kategori",
                            readonly: true
                        },
                        {
                            view: "text",
                            name: "quantity",
                            label: "Quantity",
                            readonly: true
                        },
                        {
                            view: "text",
                            name: "status",
                            label: "Status",
                            readonly: true
                        }
                    ]
                }
            ]
        }
    };
};