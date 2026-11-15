from flask import jsonify

from bson import ObjectId

from app.promo import promo_blueprint
from app.promo.models import(
    get_all_promo, 
    switch_promo_status, 
    get_promo_true, 
    get_promo, 
    get_total_promo,
    get_total_promo_quota,
    get_expired_promos,
    get_total_promo_true
)
from app.product.models import get_product
from app.auth.decorator import login_required, role_required

@promo_blueprint.get("/")
@login_required
@role_required("cashier", "admin")
def get_promos():
    promos = get_all_promo()

    product_ids = set()

    for promo in promos:
        for field in ["buy", "get"]:
            items = promo.get(field, [])

            if isinstance(items, list):
                for item in items:
                    if isinstance(item, dict) and item.get("product_id"):
                        product_ids.add(item["product_id"])

    products = get_product().find({
        "_id": {"$in": list(product_ids)}
    })

    product_map = {
        product["_id"]: product["name"]
        for product in products
    }

    result = []

    for promo in promos:
        buy = []
        get = []

        for item in promo.get("buy", []):
            if isinstance(item, dict) and item.get("product_id"):
                buy.append({
                    "name": product_map.get(
                        item["product_id"],
                        "Produk tidak ditemukan"
                    ),
                    "quantity": item.get("quantity", 0)
                })

        for item in promo.get("get", []):
            if isinstance(item, dict) and item.get("product_id"):
                get.append({
                    "name": product_map.get(
                        item["product_id"],
                        "Produk tidak ditemukan"
                    ),
                    "quantity": item.get("quantity", 0)
                })

        period = promo.get("period", {})

        result.append({
            "_id": str(promo["_id"]),
            "name": promo.get("name", ""),
            "code": promo.get("code", ""),
            "promo_category_id": promo.get("promo_category_id"),
            "quantity": promo.get("quantity", 0),
            "status": promo.get("status", False),
            "buy": buy,
            "get": get,
            "start": (
                period["start"].strftime("%d-%m-%Y")
                if period.get("start") else "-"
            ),
            "end": (
                period["end"].strftime("%d-%m-%Y")
                if period.get("end") else "-"
            )
        })

    return jsonify(result), 200


@promo_blueprint.post("/switch-status/<promo_id>")
@login_required
@role_required("admin")
def switch_status(promo_id):
    new_status = switch_promo_status(promo_id)
    return jsonify({"status": new_status})


@promo_blueprint.get("/display")
@login_required
@role_required("cashier", "admin")
def promo_for_display():
    promos = get_promo_true()

    product_ids = set()

    for promo in promos:
        for field in ["buy", "get"]:
            items = promo.get(field, [])

            if isinstance(items, list):
                for item in items:
                    product_ids.add(item["product_id"])

    products = get_product().find({
        "_id": {"$in": list(product_ids)}
    })

    product_map = {
        product["_id"]: product["name"]
        for product in products
    }

    result = []

    for promo in promos:
        buy_text = []
        get_text = []

        buy = promo.get("buy", [])
        get = promo.get("get", [])

        if isinstance(buy, list):
            for item in buy:
                name = product_map.get(
                    item["product_id"],
                    "Produk tidak ditemukan"
                )

                buy_text.append(
                    f'{name} x {item["quantity"]}'
                )

        elif isinstance(buy, dict):
            if buy.get("total"):
                buy_text.append(
                    f'Minimal transaksi Rp {buy["total"]:,.0f}'
                )

        if isinstance(get, list):
            for item in get:
                name = product_map.get(
                    item["product_id"],
                    "Produk tidak ditemukan"
                )

                get_text.append(
                    f'{name} x {item["quantity"]}'
                )

        elif isinstance(get, dict):
            if get.get("discount-cut"):
                get_text.append(
                    f'Rp {get["discount-cut"]:,.0f}'
                )

            elif get.get("discount"):
                get_text.append(
                    f'Diskon {get["discount"] * 100:g}%'
                )

        period = promo.get("period", {})

        result.append({
            "name": promo.get("name", ""),
            "code": promo.get("code", ""),
            "buy": buy_text or ["-"],
            "get": get_text or ["-"],
            "start": period["start"].strftime("%d-%m-%Y") if period.get("start") else "-",
            "end": period["end"].strftime("%d-%m-%Y") if period.get("end") else "-"
        })

    return jsonify(result)



@promo_blueprint.get("/display/<promo_id>")
@login_required
@role_required("admin")
def promo_detail_display(promo_id):
    if not ObjectId.is_valid(promo_id):
        return jsonify({"message": "ID promo tidak valid"}), 400

    promo = get_promo().find_one({
        "_id": ObjectId(promo_id)
    })

    if not promo:
        return jsonify({"message": "Promo tidak ditemukan"}), 404

    buy = promo.get("buy", [])
    get = promo.get("get", [])

    product_ids = set()

    for items in [buy, get]:
        if isinstance(items, list):
            for item in items:
                if isinstance(item, dict) and item.get("product_id"):
                    product_ids.add(item["product_id"])

        elif isinstance(items, dict) and items.get("product_id"):
            product_ids.add(items["product_id"])

    products = get_product().find({
        "_id": {"$in": list(product_ids)}
    })

    product_map = {
        product["_id"]: product["name"]
        for product in products
    }

    if (
        isinstance(buy, list)
        and len(buy) == 1
        and isinstance(buy[0], dict)
        and "total" in buy[0]
    ):
        buy = buy[0]

    if (
        isinstance(get, list)
        and len(get) == 1
        and isinstance(get[0], dict)
        and ("discount" in get[0] or "discount-cut" in get[0])
    ):
        get = get[0]

    buy_text = []
    get_text = []

    if isinstance(buy, list):
        for item in buy:
            if not isinstance(item, dict):
                continue

            if item.get("product_id"):
                name = product_map.get(
                    item["product_id"],
                    "Produk tidak ditemukan"
                )

                buy_text.append(
                    f'{name} x {item.get("quantity", 0)}'
                )

    elif isinstance(buy, dict):
        if buy.get("total") is not None:
            buy_text.append(
                f'Minimal transaksi Rp {buy["total"]:,.0f}'
            )
            
    if isinstance(get, list):
        for item in get:
            if not isinstance(item, dict):
                continue

            if item.get("product_id"):
                name = product_map.get(
                    item["product_id"],
                    "Produk tidak ditemukan"
                )

                get_text.append(
                    f'{name} x {item.get("quantity", 0)}'
                )

    elif isinstance(get, dict):
        if get.get("discount-cut") is not None:
            get_text.append(
                f'Diskon Rp {get["discount-cut"]:,.0f}'
            )

        elif get.get("discount") is not None:
            discount = get["discount"] * 100

            text = f'Diskon {discount:g}%'

            if get.get("max_discount") is not None:
                text += (
                    f' (Maks. Rp {get["max_discount"]:,.0f})'
                )

            get_text.append(text)

    period = promo.get("period", {})

    result = {
        "_id": str(promo["_id"]),
        "name": promo.get("name", ""),
        "code": promo.get("code", ""),
        "promo_category_id": promo.get("promo_category_id"),
        "quantity": promo.get("quantity", 0),
        "status": promo.get("status", False),
        "buy": buy_text or ["-"],
        "get": get_text or ["-"],
        "start": (
            period["start"].strftime("%d-%m-%Y")
            if period.get("start") else "-"
        ),
        "end": (
            period["end"].strftime("%d-%m-%Y")
            if period.get("end") else "-"
        )
    }

    return jsonify(result), 200


@promo_blueprint.get("/total-promos")
@login_required
@role_required("admin")
def total_transactions():
    total = get_total_promo()

    return jsonify({
        "total_promos": total
    }), 200


@promo_blueprint.get("/total-quota")
@login_required
@role_required("admin")
def total_promo_quota():
    return jsonify({
        "total_quota": get_total_promo_quota()
    })


@promo_blueprint.get("/expired-promos")
@login_required
@role_required("admin")
def expired_promos():
    return jsonify({
        "expired_promos": get_expired_promos()
    })


@promo_blueprint.get("/active-promos")
@login_required
@role_required("admin")
def active_promos():
    return jsonify({
        "active_promos": get_total_promo_true()
    })