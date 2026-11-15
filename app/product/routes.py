from flask import jsonify,request

from app.product import product_blueprint
from app.product.models import (
    get_all_products, 
    switch_product_status, 
    search_product, 
    get_all_products_with_margin, 
    get_total_product, 
    get_total_stock,
    get_average_margin
)
from app.auth.decorator import login_required, role_required

@product_blueprint.get("/")
@login_required
@role_required("cashier", "admin")
def product_data():
    products = get_all_products()
    for product in products:
        product["_id"] = str(product["_id"])
    return jsonify(products), 200


@product_blueprint.get("/allMargin")
@login_required
@role_required("admin")
def product_margin():
    products = get_all_products_with_margin()

    for product in products:
        product["_id"] = str(product["_id"])

    return jsonify(products), 200


@product_blueprint.get("/search")
@login_required
@role_required("cashier")
def search_product_route():
    keyword = request.args.get("s", "").strip()

    if not keyword:
        return jsonify([]), 200

    products = search_product(keyword)

    for product in products:
        product["_id"] = str(product["_id"])

    return jsonify(products), 200


@product_blueprint.post("/switch-status/<product_id>")
@login_required
@role_required("admin")
def switch_status(product_id):
    new_status = switch_product_status(product_id)
    return jsonify({"status": new_status})


@product_blueprint.get("/total-products")
@login_required
@role_required("admin")
def total_transactions():
    total = get_total_product()

    return jsonify({
        "total_products": total
    }), 200


@product_blueprint.get("/total-stock")
@login_required
@role_required("admin")
def total_stock():
    total = get_total_stock()

    return jsonify({
        "total_stock": total
    })

@product_blueprint.get("/average-margin")
@login_required
@role_required("admin")
def average_margin():
    return jsonify({
        "average_margin": get_average_margin()
    })