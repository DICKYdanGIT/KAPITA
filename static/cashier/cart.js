let cartTotal = 0;
let cartChange = 0;

function cartContent() {
    return {
        id: "cartPanel",
        css: "cart-panel",
        width: 400,
        rows: [
            {
                view: "toolbar",
                css: "cart-title",
                height: 56,
                cols: [
                    { view: "label", label: "Keranjang Belanja" }
                ]
            },

            {
                view: "datatable",
                id: "tableCart",
                css: "cart-table",
                header: false,
                scrollX: false,
                scrollY: true,
                borderless: true,
                rowHeight: 72,

                columns: [
                    {
                        id: "name",
                        fillspace: true,
                        template: function(obj) {
                            const tag = obj.is_free ? "<span class='tag-free'>Gratis</span>" : "";

                            const qtyControl = obj.is_free
                                ? `<span class="qty-num">${obj.qty}</span>`
                                : `<div class="qty-ctrl">
                                    <span class="qty-btn min">&minus;</span>
                                    <span class="qty-num">${obj.qty}</span>
                                    <span class="qty-btn max">+</span>
                                </div>`;

                            return `
                                <div class="cart-row">
                                    <div class="cart-line">
                                        <div class="cart-name">${webix.template.escape(obj.name)}${tag}</div>
                                        <div class="cart-calc">${obj.qty} x ${Number(obj.price).toLocaleString("id-ID")}</div>
                                    </div>
                                    <div class="cart-line cart-line-bottom">
                                        ${qtyControl}
                                        <div class="cart-sub">${Number(obj.subtotal).toLocaleString("id-ID")}</div>
                                    </div>
                                </div>`;
                        }
                    },
                    {
                        width: 40,
                        css: "cell-center",
                        template: function(obj) {
                            if (obj.is_free) return "";
                            return "<span class='cart-del mdi mdi-trash-can-outline del'></span>";
                        }
                    }
                ],
                onClick: {
                    "min": function(e, id) {
                        minQty(this.getItem(id).product_id);
                    },
                    "max": function(e, id) {
                        maxQty(this.getItem(id).product_id);
                    },
                    "del": function(e, id) {
                        deleteCartProduct(this.getItem(id).product_id);
                    }
                },

                data: []
            },

            {
                css: "cart-summary",
                padding: 16,
                margin: 6,
                rows: [
                    {
                        view: "select",
                        id: "promoSelect",
                        label: "Promo",
                        labelWidth: 65,
                        options: [{ id: "", value: "Tanpa Promo" }],
                        value: "",
                        on: {
                            onChange: function() {
                                cartUpdate();
                            }
                        }
                    },

                    {
                        height: 26,
                        cols: [
                            { view: "label", label: "Subtotal", css: "sum-label" },
                            { view: "label", id: "cartSubtotal", label: "Rp 0", align: "right", css: "sum-value" }
                        ]
                    },
                    {
                        height: 26,
                        cols: [
                            { view: "label", label: "Diskon", css: "sum-label" },
                            { view: "label", id: "cartDiscount", label: "Rp 0", align: "right", css: "sum-value" }
                        ]
                    },

                    { view: "template", template: "", height: 1, css: "cart-divider" },

                    {
                        height: 36,
                        cols: [
                            { view: "label", label: "TOTAL", css: "sum-total sum-label" },
                            { view: "label", id: "cartTotal", label: "Rp 0", align: "right", css: "sum-total sum-value" }
                        ]
                    },

                    {
                        view: "text",
                        id: "checkoutCash",
                        label: "Uang Diterima",
                        labelPosition: "top",
                        placeholder: "Masukkan nominal",
                        attributes: { type: "number", min: 0 },
                        on: {
                            onTimedKeyPress: function() {
                                cartUpdate();
                            },
                            onChange: function() {
                                cartUpdate();
                            }
                        }
                    },

                    {
                        view: "button",
                        css: "btn-checkout",
                        value: "Checkout",
                        height: 46,

                        click: function() {
                            const cash = Number($$("checkoutCash").getValue());
                            const total = cartTotal;

                            if (total == 0) {
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

                            $$("windowTotal").setValue("Rp " + cartTotal.toLocaleString("id-ID"));
                            $$("windowCash").setValue("Rp " + cash.toLocaleString("id-ID"));
                            $$("windowCashback").setValue("Rp " + cartChange.toLocaleString("id-ID"));

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
        css: "checkout-window",
        position: "center",
        modal: true,
        move: true,
        width: 400,
        height: 330,
        paddingX: 12,
        head: "Checkout",

        body: {
            padding: 20,
            margin: 8,
            rows: [
                {
                    height: 32,
                    cols: [
                        { view: "label", label: "Total Belanja", css: "sum-label" },
                        { view: "label", id: "windowTotal", label: "Rp 0", align: "right", css: "sum-total sum-value" }
                    ]
                },
                {
                    height: 32,
                    cols: [
                        { view: "label", label: "Uang Diterima", css: "sum-label" },
                        { view: "label", id: "windowCash", label: "Rp 0", align: "right", css: "sum-value" }
                    ]
                },

                { view: "template", template: "", height: 1, css: "cart-divider" },

                {
                    height: 44,
                    css: "checkout-change",
                    cols: [
                        { width: 16 },
                        { view: "label", label: "Kembalian", css: "sum-label" },
                        { view: "label", id: "windowCashback", label: "Rp 0", align: "right", css: "sum-total sum-value" },
                        { width: 16 },
                    ]
                },

                {},

                {
                    view: "button",
                    css: "btn-checkout",
                    value: "Selesai",
                    height: 46,
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
