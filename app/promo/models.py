from flask import current_app
from datetime import datetime
from bson import ObjectId


def get_promo():
    db = current_app.config["MONGO_DB"]
    return db["promo"]


def get_all_promo():
    return list(get_promo().find())


def switch_promo_status(promo_id):
    collection = get_promo()

    if not ObjectId.is_valid(promo_id):
        return False

    promo = collection.find_one({"_id": ObjectId(promo_id)})
    if not promo:
        return False

    result = collection.update_one(
        {"_id": ObjectId(promo_id)}, [{"$set": {"status": {"$not": "$status"}}}]
    )

    return result.modified_count > 0


def use_promo_ticket(promo_id):
    result = get_promo().update_one(
        {"_id": ObjectId(promo_id), "status": True, "quantity": {"$gt": 0}},
        {"$inc": {"quantity": -1}},
    )
    return result.modified_count == 1


def validate_promo(promo, now):
    if promo.get("status") is not True:
        return False
    if promo.get("quantity", 0) <= 0:
        return False

    period = promo.get("period", {})
    if period.get("start") and now < period["start"]:
        return False
    if period.get("end") and now > period["end"]:
        return False

    return True


def check_promo(cart_items):
    promos = get_all_promo()
    promo_list = []
    now = datetime.utcnow()
    cart_total = sum(item["price"] * item["qty"] for item in cart_items)
    cart_products = {}
    
    for item in cart_items:
        product_id = str(item["product_id"])
        data = cart_products.setdefault(product_id, {"qty": 0, "price": item["price"]})
        data["qty"] += item["qty"]

    for promo in promos:
        if not validate_promo(promo, now):
            continue

        category = promo.get("promo_category_id")
        buy = promo.get("buy", {})
        get = promo.get("get", {})

        promo_count = 1
        free_items = []
        discount_amount = 0

        if category in [1, 2]:
            if not isinstance(buy, list) or not buy:
                continue

            counts = []

            for requirement in buy:
                product_id = str(requirement["product_id"])
                required_qty = requirement["quantity"]

                if required_qty <= 0:
                    counts = []
                    break

                cart_qty = cart_products.get(product_id, {}).get("qty", 0)
                counts.append(cart_qty // required_qty)

            if not counts:
                continue

            promo_count = min(counts)

            if promo_count < 1:
                continue

            if category == 1:
                if not isinstance(get, list) or not get:
                    continue

                free_items = [
                    {
                        "product_id": str(item["product_id"]),
                        "quantity": item["quantity"] * promo_count,
                    }
                    for item in get
                ]

            else:
                if not isinstance(get, dict) or not get:
                    continue

                eligible_total = sum(
                    cart_products.get(str(req["product_id"]), {}).get("price", 0)
                    * min(
                        cart_products.get(str(req["product_id"]), {}).get("qty", 0),
                        req["quantity"] * promo_count,
                    )
                    for req in buy
                )

                discount_amount = min(
                    eligible_total * get.get("discount", 0),
                    get.get("max_discount", 0),
                )

                promo_count = 1

        elif category in [3, 4]:
            if not isinstance(buy, dict):
                continue

            minimum_total = buy.get("total", 0)

            if minimum_total <= 0 or cart_total < minimum_total:
                continue

            if not isinstance(get, dict) or not get:
                continue

            if category == 3:
                discount_amount = min(
                    cart_total * get.get("discount", 0),
                    get.get("max_discount", 0),
                )
            else:
                discount_amount = get.get("discount", 0)

        else:
            continue

        promo_list.append(
            {
                "promo_id": str(promo["_id"]),
                "name": promo["name"],
                "code": promo["code"],
                "promo_category_id": category,
                "promo_count": promo_count,
                "is_eligible": True,
                "benefit": {
                    "items": free_items,
                    "discount_amount": discount_amount,
                },
            }
        )

    return promo_list
