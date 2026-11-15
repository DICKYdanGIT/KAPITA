function cashierContent(){
    return{
        padding: 22,
        rows: [
            { height: 20 },

            {
                padding: 10,
                cols: [
                    {
                        id: "search",
                        view: "search",
                        placeholder: "Cari nama produk...",
                        width: 400,
                        on: {
                            onTimedKeyPress: function() {
                                searchProductCashier();
                            }
                        }
                    },
                    {}
                ]
            },
            {
                cols: [
                    {
                        view: "label",
                        id: "productCount",
                        label: "0 Produk",
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

            { height: 10 },

            {
                view: "dataview",
                id: "tableProductCashier",
                scroll: false,
                url: "/product",
                type: {
                    width: 150,
                    height: 200,
                    template: `
                        <div class="product-card">
                            <div class="product-name">#name#</div>
                            <div class="product-price">Rp #price#</div>
                            <div class="product-stock">Stok: #stock#</div>
                        </div>
                    `
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
    }   
}


function PagerProductCashier() {
    return {
        view: "pager",
        id: "PagerProductCashier",
        size: 12,
        group: 5,
        template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
        autosize: false
    };
}



function addToCart(product) {
    const table = $$("tableCart");

    const productInCart = table.find(function(item) {
        return String(item.product_id) === String(product._id);
    }, true);

    if (productInCart) {
        productInCart.qty += 1;
        table.updateItem(productInCart.id, productInCart);
    } else {
        table.add({
            product_id: String(product._id),
            name: product.name,
            qty: 1,
            price: product.price,
            subtotal: product.price
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