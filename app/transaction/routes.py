from flask import request, jsonify, session
from datetime import datetime

from app.transaction import transaction_blueprint
from app.transaction.models import(
    save_transaction, 
    get_all_transactions, 
    get_total_sales, 
    calculate, 
    get_total_transactions, 
    get_daily_sales, 
    get_best_products, 
    get_best_promos,
    get_total_discount,
    get_average_purchase
)
from app.product.models import min_product
from app.promo.models import use_promo_ticket
from app.auth.decorator import login_required, role_required


@transaction_blueprint.post("/")
@login_required
@role_required("cashier", "admin")
def transaction_cart():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "Data tidak valid"}), 400

    result = calculate(data)

    if result is False:
        return jsonify({"error": "Data tidak valid"}), 400

    if not result["items"]:
        return jsonify({"error": "Keranjang kosong"}), 400

    if not result["promo_valid"]:
        return jsonify({"error": "Promo tidak valid"}), 400

    cash = data.get("cash", 0)

    if type(cash) not in (int, float) or cash < result["total"]:
        return jsonify({"error": "Uang pembayaran tidak cukup"}), 400

    for item in result["items"]:
        success = min_product(
            item["product_id"],
            item["qty"]
        )

        if not success:
            return jsonify({
                "error": "Stok produk tidak mencukupi"
            }), 400

    promo_id = data.get("promo_id")

    if promo_id:
        success = use_promo_ticket(promo_id)

        if not success:
            return jsonify({
                "error": "Kuota promo sudah habis"
            }), 400

    change = cash - result["total"]

    transaction = {
        "cashier_id": session.get("user_id"),
        "items": result["items"],
        "total": result["subtotal"],
        "total_discount": result["discount_amount"],
        "final_total": result["total"],
        "cash": cash,
        "change": change,
        "promos": [
            promo for promo in result["promos"]
            if promo["promo_id"] == promo_id
        ] if promo_id else [],
        "created_at": datetime.now()
    }

    transaction_id = save_transaction(transaction)

    return (
        jsonify({
            "message": "Pembayaran Berhasil",
            "transaction_id": str(transaction_id),
            "total": result["subtotal"],
            "total_discount": result["discount_amount"],
            "final_total": result["total"]
        }),
        201
    )

@transaction_blueprint.post("/calculate")
@login_required
@role_required("cashier", "admin")
def calculate_cart():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "Data tidak valid"}), 400

    result = calculate(data)

    if result is False:
        return jsonify({"error": "Data tidak valid"}), 400

    return jsonify(result), 200


@transaction_blueprint.get("/data")
@login_required
@role_required("admin")
def get_transactions():
    transactions = get_all_transactions()

    for transaction in transactions:
        transaction["_id"] = str(transaction["_id"])

        if transaction.get("cashier_id") is not None:
            transaction["cashier_id"] = str(transaction["cashier_id"])

        if transaction.get("created_at"):
            transaction["created_at"] = transaction["created_at"].strftime(
                "%d-%m-%Y %H:%M:%S"
            )

    return jsonify(transactions), 200


@transaction_blueprint.get("/total-sales")
@login_required
@role_required("admin")
def total_sales():
    total = get_total_sales()

    return jsonify({
        "total_sales": total
    }), 200


@transaction_blueprint.get("/total-transactions")
@login_required
@role_required("admin")
def total_transactions():
    total = get_total_transactions()

    return jsonify({
        "total_transactions": total
    }), 200


@transaction_blueprint.get("/daily-sales")
@login_required
@role_required("admin")
def daily_sales():
    sales = get_daily_sales()
    return jsonify(sales), 200


@transaction_blueprint.get("/best-products")
@login_required
@role_required("admin")
def best_products():
    products = get_best_products()
    return jsonify(products), 200


@transaction_blueprint.get("/best-promos")
@login_required
@role_required("admin")
def best_promos():
    promos = get_best_promos()
    return jsonify(promos), 200


@transaction_blueprint.get("/total-discount")
@login_required
@role_required("admin")
def total_discount():
    return jsonify({
        "total_discount": get_total_discount()
    })

@transaction_blueprint.get("/average-purchase")
@login_required
@role_required("admin")
def average_purchase():
    return jsonify({
        "average_purchase": get_average_purchase()
    })