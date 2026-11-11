from flask import jsonify, request
from bson import ObjectId
from bson.errors import InvalidId

from app.promo import promo_blueprint
from app.promo.models import get_all_promo, check_promo, switch_promo_status
from app.product.models import get_product


@promo_blueprint.get("/")
def get_promos():
    promos = get_all_promo()
    for promo in promos:
        promo["_id"] = str(promo["_id"])

        for item in promo.get("buy", []) if isinstance(promo.get("buy"), list) else []:
            item["product_id"] = str(item["product_id"])

        for item in promo.get("get", []) if isinstance(promo.get("get"), list) else []:
            item["product_id"] = str(item["product_id"])

    return jsonify(promos), 200


@promo_blueprint.post("/switch-status/<promo_id>")
def switch_status(promo_id):
    new_status = switch_promo_status(promo_id)
    return jsonify({"status": new_status})


@promo_blueprint.post("/check")
def promo_check():
    data = request.get_json() or {}
    items = data.get("items", [])

    if not isinstance(items, list) or not items:
        return jsonify({"promos": []}), 200

    products = get_product()
    cart_items = []

    for item in items:
        product_id = item.get("product_id")
        qty = item.get("qty")

        if not product_id or type(qty) is not int or qty <= 0:
            return jsonify({"error": "Data produk tidak valid"}), 400

        try:
            product = products.find_one({"_id": ObjectId(product_id)})
        except (InvalidId, TypeError):
            return jsonify({"error": "ID produk tidak valid"}), 400

        if not product:
            return jsonify({"error": "Produk tidak ditemukan"}), 404

        cart_items.append(
            {"product_id": str(product["_id"]), "qty": qty, "price": product["price"]}
        )

    promos = check_promo(cart_items)

    return jsonify({"promos": promos}), 200
