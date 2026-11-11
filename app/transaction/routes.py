from flask import request, jsonify, session
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId

from app.transaction import transaction_blueprint
from app.transaction.models import save_transaction
from app.product.models import get_product, min_product
from app.promo.models import check_promo, use_promo_ticket


@transaction_blueprint.post("/")
def create_transaction():
    data = request.get_json()
    items = data.get("items")

    if not isinstance(items, list) or not items:
        return jsonify({"error": "Data produk tidak valid"}), 400

    products = get_product()
    transaction_items = []
    total = 0

    for item in items:
        id_product = item.get("productId")
        qty = item.get("qty")

        if not id_product or type(qty) is not int or qty <= 0:
            return jsonify({"error": "Data produk atau jumlah tidak valid"}), 400

        try:
            product = products.find_one({"_id": ObjectId(id_product)})
        except (InvalidId, TypeError):
            return jsonify({"error": "ID produk tidak valid"}), 400

        if not product:
            return jsonify({"error": "Produk tidak ditemukan"}), 404

        if qty > product.get("stock", 0):
            return jsonify({"error": f"Stok {product['name']} tidak mencukupi"}), 400

        price = product["price"]
        subtotal = price * qty
        total += subtotal

        transaction_items.append(
            {
                "product_id": str(product["_id"]),
                "name": product["name"],
                "price": price,
                "qty": qty,
                "subtotal": subtotal,
            }
        )

    cart_items = [
        {"product_id": item["product_id"], "qty": item["qty"], "price": item["price"]}
        for item in transaction_items
    ]

    promos = check_promo(cart_items)
    selected_promo_id = data.get("promo_id")

    promos = [
        promo for promo in promos
        if promo["promo_id"] == selected_promo_id
    ]

    for promo in promos:
        for free in promo["benefit"]["items"]:
            id_product = free["product_id"]
            qty = free["quantity"]

            product = products.find_one({"_id": ObjectId(id_product)})

            if not product:
                return jsonify({"error": "Produk gratis tidak ditemukan"}), 404

            if qty > product.get("stock", 0):
                return (
                    jsonify(
                        {
                            "error": f"Stok produk gratis {product['name']} tidak mencukupi"
                        }
                    ),
                    400,
                )

            transaction_items.append(
                {
                    "product_id": str(product["_id"]),
                    "name": product["name"] + " (GRATIS)",
                    "price": 0,
                    "qty": qty,
                    "subtotal": 0,
                }
            )

    total_discount = sum(promo["benefit"]["discount_amount"] for promo in promos)
    final_total = total - total_discount

    payment_amount = data.get("payment_amount", 0)
    if type(payment_amount) not in (int, float) or payment_amount < final_total:
        return jsonify({"error": "Uang pembayaran tidak mencukupi"}), 400

    for promo in promos:
        success = use_promo_ticket(promo["promo_id"])
        if not success:
            return jsonify({"error": "Tiket promo sudah habis atau tidak tersedia"}), 400
            
    for item in transaction_items:
        success = min_product(item["product_id"], item["qty"])
        if not success:
            return jsonify({"error": f"Gagal mengurangi stok {item['name']}"}), 400

    transaction = {
        "cashier_id": session.get("user_id"),
        "items": transaction_items,
        "total": total,
        "total_discount": total_discount,
        "final_total": final_total,
        "promos": promos,
        "created_at": datetime.now(),
    }

    transaction_id = save_transaction(transaction)
    
    return (
        jsonify(
            {
                "message": "Pembayaran Berhasil",
                "transaction_id": str(transaction_id),
                "total": total,
                "total_discount": total_discount,
                "final_total": final_total,
            }
        ),
        201,
    )
