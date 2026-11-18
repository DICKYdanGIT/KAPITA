function cashierContent() {
    return {
        css: "cashier-main",
        padding: 20,
        margin: 12,
        rows: [
            {
                height: 42,
                cols: [
                    {
                        id: "search",
                        view: "search",
                        placeholder: "Cari nama produk...",
                        gravity: 3,
                        minWidth: 160,
                        maxWidth: 420,
                        on: {
                            onTimedKeyPress: function() {
                                searchProductCashier();
                            }
                        }
                    },
                    {},
                    {
                        view: "select",
                        id: "sortPrice",
                        width: 190,
                        value: "default",
                        options: [
                            { id: "default", value: "Urutan Default" },
                            { id: "asc", value: "Harga Termurah" },
                            { id: "desc", value: "Harga Termahal" }
                        ],
                        on: {
                            onChange: function(id) {
                                sortProduct(id);
                            }
                        }
                    }
                ]
            },

            {
                view: "label",
                id: "productCount",
                css: "product-count",
                label: "0 Produk",
                height: 22
            },

            {
                view: "dataview",
                id: "tableProductCashier",
                css: "product-grid",
                scroll: false,
                url: "/product/",
                xCount: 4,

                type: {
                    width: "auto",
                    height: 150,
                    css: "product-item",
                    template: function(obj) {
                        const stock = Number(obj.stock);
                        const stockClass = stock <= 0 ? "empty" : stock <= 5 ? "low" : "";
                        const stockText = stock <= 0 ? "Stok habis" : "Stok: " + stock;

                        return `
                            <div class="product-card">
                                <div class="product-name">${webix.template.escape(obj.name || "")}</div>
                                <div class="product-price">Rp ${Number(obj.price).toLocaleString("id-ID")}</div>
                                <div class="product-stock ${stockClass}">${webix.template.escape(stockText)}</div>
                            </div>
                        `;
                    }
                },

                on: {
                    onAfterLoad: function() {
                        $$("productCount").setValue(this.count() + " Produk");
                    },

                    onAfterRender: function() {
                        $$("productCount").setValue(this.count() + " Produk");
                    },

                    onItemClick: function(id) {
                        const product = this.getItem(id);
                        addToCart(product);
                    }
                },

                pager: "PagerProductCashier"
            },

            PagerProductCashier()
        ]
    };
}

function PagerProductCashier() {
    return {
        height: 40,
        cols: [
            {},
            {
                view: "pager",
                id: "PagerProductCashier",
                css: "cashier-pager",
                size: 16,
                group: 5,
                template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                autosize: true
            },
            {}
        ]
    };
}


function addToCart(product) {
    const table = $$("tableCart");

    const stock = Number(product.stock);
    const price = Number(product.price);

    if (!Number.isFinite(stock) || stock <= 0) {
        webix.message({
            type: "error",
            text: "Produk habis"
        });
        return;
    }

    const productInCart = table.find(function(item) {
        return (
            String(item.product_id) === String(product._id) &&
            item.is_free !== true
        );
    }, true);

    const currentQty = productInCart
        ? Number(productInCart.qty)
        : 0;

    const newQty = currentQty + 1;

    if (newQty > stock) {
        webix.message({
            type: "error",
            text: "Stok tidak mencukupi"
        });
        return;
    }

    if (productInCart) {
        productInCart.qty = newQty;
        productInCart.subtotal = newQty * price;

        table.updateItem(productInCart.id, productInCart);
    } else {
        table.add({
            product_id: String(product._id),
            name: product.name,
            qty: 1,
            price: price,
            subtotal: price,
            is_free: false
        });
    }

    cartUpdate();
}

function searchProductCashier() {
    table = $$("tableProductCashier")
    const keyword = $$("search").getValue();

    if (keyword.trim() == "") {
        table.clearAll();
        table.load("/product");
        return;
    }

    webix.ajax()
        .get("/product/search?s=" + encodeURIComponent(keyword))
        .then(function(response) {
            const result = response.json();

            table.clearAll();
            table.parse(result);
        })
        .catch(function(error) {
            console.error("Search error:", error);

            webix.message({
                type: "error",
                text: "Gagal mencari produk"
            });
        });
}


function sortProduct(id) {
    const data = $$("tableProductCashier");

    if (id === "asc") {
        data.sort("price", "asc", "int");
    }
    else if (id === "desc") {
        data.sort("price", "desc", "int");
    }
    else {
        data.sort("id", "asc");
    }
}