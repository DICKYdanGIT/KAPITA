from flask import jsonify
from app.product import product_blueprint
from app.product.models import get_all_products, switch_product_status


@product_blueprint.get("/")
def product_data():
    products = get_all_products()
    for product in products:
        product["_id"] = str(product["_id"])
    return jsonify(products), 200


@product_blueprint.post("/switch-status/<product_id>")
def switch_status(product_id):
    new_status = switch_product_status(product_id)
    return jsonify({"status": new_status})
