let cartTotal = 0;
let cartChange = 0;

function cartContent() {
    return {
        width: 400,
        rows: [
            {
                view: "toolbar",
                height: 55,
                cols: [
                    {
                        view: "label",
                        label: "Keranjang Belanja"
                    }
                ]
            },

            {
                view: "datatable",
                id: "tableCart",
                scrollX: false,
                scrollY: true,
                borderless: true,

                columns: [
                    {
                        id: "name",
                        header: "Produk",
                        fillspace: 2,
                        template: function(obj) {
                            if (obj.is_free) {
                                return obj.name + " (Gratis)";
                            }
                            return obj.name;
                        }
                    },
                    {
                        width: 30,
                        template: function(obj) {
                            if (obj.is_free) {
                                return "<span></span>";
                            }
                            return "<span class='min'>--</span>";
                        }
                    },
                    {
                        id: "qty",
                        header: "Qty",
                        width: 45
                    },
                    {
                        width: 30,
                        template: function(obj) {
                            if (obj.is_free) {
                                return "<span></span>";
                            }
                            return "<span class='max'>++</span>";
                        }
                    },
                    {
                        id: "price",
                        header: "Harga",
                        width: 90,
                        template: function(obj) {
                            return Number(obj.price).toLocaleString("id-ID");
                        }
                    },
                    {
                        id: "subtotal",
                        header: "Subtotal",
                        width: 105,
                        template: function(obj) {
                            return Number(obj.subtotal).toLocaleString("id-ID");
                        }
                    },
                    {
                        width: 30,
                        template: function(obj) {
                            if (obj.is_free) {
                                return "<span></span>";
                            }
                            return "<span class='del'>-|-</span>";
                        }
                    },
                ],

                onClick: {
                    "min": function(e, id) {
                        const item = this.getItem(id);
                        minQty(item.product_id);
                    },

                    "max": function(e, id) {
                        const item = this.getItem(id);
                        maxQty(item.product_id);
                    },
                    "del": function(e, id) {
                        const item = this.getItem(id);
                        deleteCartProduct(item.product_id);
                    }
                },

                data: []
            },

            {
                padding: 15,
                rows: [
                    {
                        view: "select",
                        id: "promoSelect",
                        label: "Promo",
                        labelWidth: 65,

                        options: [
                            { id: "", value: "Tanpa Promo" }
                        ],
                        value: "",

                        on: {
                            onChange: function() {
                                cartUpdate();
                            }
                        }
                    },

                    { height: 15 },

                    {
                        cols: [
                            {
                                view: "label",
                                label: "Subtotal"
                            },
                            {
                                view: "label",
                                id: "cartSubtotal",
                                label: "Rp 0",
                                align: "right"
                            }
                        ]
                    },

                    {
                        cols: [
                            {
                                view: "label",
                                label: "Diskon"
                            },
                            {
                                view: "label",
                                id: "cartDiscount",
                                label: "Rp 0",
                                align: "right"
                            }
                        ]
                    },

                    {
                        view: "template",
                        template: "<hr></hr>",
                        height: 2
                    },

                    {
                        cols: [
                            {
                                view: "label",
                                label: "TOTAL"
                            },
                            {
                                view: "label",
                                id: "cartTotal",
                                label: "Rp 0",
                                align: "right"
                            }
                        ]
                    },

                    { height: 15 },

                    {
                        view: "text",
                        id: "checkoutCash",
                        label: "Uang Diterima",
                        labelWidth: 120,
                        placeholder: "Masukkan nominal",
                        attributes: {
                            type: "number",
                            min: 0
                        },
                        on: {
                            onChange: function() {
                                cartUpdate();
                            }
                        }
                    },

                    { height: 15 },

                    {
                        view: "button",
                        value: "Checkout",
                        height: 45,

                        click: function() {
                            const cash = Number($$("checkoutCash").getValue());
                            const total = cartTotal;

                            if(total == 0){
                                webix.message("Keranjang tidak boleh kosong");
                                return;
                            }

                            if (!cash || cash <= 0) {
                                webix.message("Masukkan uang pembayaran");
                                return;
                            }

                            if (cash < total) {
                                webix.message("Uang pembayaran kurang");
                                return;
                            }
                            
                            $$("windowTotal").setValue(
                                "Rp " + cartTotal.toLocaleString("id-ID")
                            );

                            $$("windowCash").setValue(
                                "Rp " + cash.toLocaleString("id-ID")
                            );
                            
                            $$("windowCashback").setValue(
                                "Rp " + cartChange.toLocaleString("id-ID")
                            );
                            
                            $$("cartWindow").show();
                        }
                    }
                ]
            }
        ]
    };
}


function maxQty(productId) {
    const table = $$("tableCart");

    const product = table.find(function(item) {
        return String(item.product_id) === String(productId);
    }, true);

    if (!product) return;

    product.qty += 1;

    table.updateItem(product.id, product);

    cartUpdate();
}


function minQty(productId) {
    const table = $$("tableCart");

    const product = table.find(function(item) {
        return String(item.product_id) === String(productId);
    }, true);

    if (!product) return;

    product.qty -= 1;

    if (product.qty <= 0) {
        table.remove(product.id);
    } else {
        table.updateItem(product.id, product);
    }

    cartUpdate();
}


function deleteCartProduct(productId) {
    const table = $$("tableCart");

    const product = table.find(function(item) {
        return String(item.product_id) === String(productId);
    }, true);

    if (!product) return;

    table.remove(product.id);

    cartUpdate();
}


function cartUpdate() {
    const table = $$("tableCart");
    const promoSelect = $$("promoSelect");
    const cart = table.serialize()
        .filter(function(item) {
            return item.is_free !== true;
        })
        .map(function(item) {
            return {
                product_id: item.product_id,
                qty: item.qty
            };
        });

    webix.ajax()
        .headers({
            "Content-Type": "application/json"
        })
        .post("/transaction/calculate", JSON.stringify({
            cart: cart,
            promo_id: promoSelect.getValue() || null,
            cash : Number($$("checkoutCash").getValue()) || 0
        }))
        .then(function(response) {
            const result = response.json();

            cartTotal = result.total;
            cartChange = result.change;
            
            table.clearAll();
            table.parse(result.items);

            const options = [
                { id: "", value: "Tanpa Promo" }
            ];

            result.promos.forEach(function(promo) {
                options.push({
                    id: promo.promo_id,
                    value: promo.name
                });
            });

            promoSelect.define("options", options);
            promoSelect.refresh();

            $$("cartSubtotal").setValue(
                "Rp " + result.subtotal.toLocaleString("id-ID")
            );

            $$("cartDiscount").setValue(
                "Rp " + result.discount_amount.toLocaleString("id-ID")
            );

            $$("cartTotal").setValue(
                "Rp " + result.total.toLocaleString("id-ID")
            );
        })
        .catch(handleAjaxError);
}


function cartWindow() {
    return {
        view: "window",
        id: "cartWindow",
        position: "center",
        modal: true,
        move: true,
        width: 400,
        height: 300,
        head: "Checkout",

        body: {
            padding: 20,
            rows: [
                {
                    view: "label",
                    label: "Total Belanja",
                    height: 25
                },
                {
                    view: "label",
                    label: "Rp 0",
                    id: "windowTotal",
                    height: 35,
                },
                {
                    view: "label",
                    label: "Uang Diterima",
                    height: 25
                },
                {
                    view: "label",
                    label: "Rp 0",
                    id: "windowCash",
                    height: 35
                },
                {
                    view: "template",
                    template: "<hr></hr>",
                },
                {
                    view: "label",
                    label: "Kembalian",
                    height: 25
                },
                {
                    view: "label",
                    label: "Rp 0",
                    id: "windowCashback",
                },
                {
                    view: "button",
                    value: "Selesai",
                    height: 40,
                    click: function() {
                        checkout();
                    }
                }
            ]
        }
    };
}


function checkout() {
    const table = $$("tableCart");
    const promoSelect = $$("promoSelect");
    const cart = table.serialize()
        .filter(function(item) {
            return item.is_free !== true;
        })
        .map(function(item) {
            return {
                product_id: item.product_id,
                qty: item.qty
            };
        });

    webix.ajax()
        .headers({
            "Content-Type": "application/json"
        })
        .post("/transaction/", JSON.stringify({
            cart: cart,
            promo_id: promoSelect.getValue() || null,
            cash: Number($$("checkoutCash").getValue()) || 0
        }))
        .then(function(response) {
            const result = response.json();

            webix.message({
                type: "success",
                text: result.message
            });

            table.clearAll();
            promoSelect.setValue("");
            $$("checkoutCash").setValue("");

            $$("cartSubtotal").setValue("Rp 0");
            $$("cartDiscount").setValue("Rp 0");
            $$("cartTotal").setValue("Rp 0");

            cartTotal = 0;
            cartChange = 0;

            $$("tableProductCashier").clearAll();
            $$("tableProductCashier").load("/product");
            $$("cartWindow").hide();
        })
        .catch(handleAjaxError);
}
