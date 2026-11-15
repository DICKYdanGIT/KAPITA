from flask import current_app

from bson import ObjectId
from bson.errors import InvalidId

from app.product.models import get_product
from app.promo.models import check_promo

def get_transaction():
    db = current_app.config["MONGO_DB"]
    return db["transactions"]


def get_all_transactions():
    collection = get_transaction()

    transactions = list(
        collection.find().sort("created_at", -1)
    )

    db = current_app.config["MONGO_DB"]
    users = db["users"]

    for transaction in transactions:
        cashier_id = transaction.get("cashier_id")

        if cashier_id and ObjectId.is_valid(cashier_id):
            user = users.find_one({
                "_id": ObjectId(cashier_id)
            })

            transaction["cashier_name"] = (
                user["username"] if user else "Tidak diketahui"
            )
        else:
            transaction["cashier_name"] = "Tidak diketahui"

    return transactions


def save_transaction(data):
    collection = get_transaction()
    result = collection.insert_one(data)
    return result.inserted_id


def calculate(data):
    if not isinstance(data, dict):
        return False

    cart = data.get("cart")
    promo_id = data.get("promo_id") or None
    cash = data.get("cash", 0)

    if type(cash) not in (int, float) or cash < 0:
        return False

    if not isinstance(cart, list):
        return False

    if promo_id is not None and not ObjectId.is_valid(promo_id):
        return False

    if not cart:
        return {
            "items": [],
            "promos": [],
            "promo_valid": True,
            "subtotal": 0,
            "discount_amount": 0,
            "total": 0,
            "change": 0
        }

    product_ids = []
    cart_qty = {}

    for item in cart:
        if not isinstance(item, dict):
            return False

        product_id = item.get("product_id")
        qty = item.get("qty")

        if not product_id or type(qty) is not int or qty <= 0:
            return False

        try:
            object_id = ObjectId(product_id)
        except (InvalidId, TypeError):
            return False

        if object_id in cart_qty:
            return False

        product_ids.append(object_id)
        cart_qty[object_id] = qty

    products = list(get_product().find({
        "_id": {"$in": product_ids}
    }))

    if len(products) != len(product_ids):
        return False

    products_map = {
        product["_id"]: product
        for product in products
    }

    items = []
    cart_items = []
    subtotal = 0

    for object_id in product_ids:
        product = products_map[object_id]
        qty = cart_qty[object_id]
        price = product["price"]
        item_subtotal = price * qty

        items.append({
            "product_id": str(product["_id"]),
            "name": product["name"],
            "price": price,
            "qty": qty,
            "subtotal": item_subtotal,
            "is_free": False
        })

        cart_items.append({
            "product_id": str(product["_id"]),
            "price": price,
            "qty": qty
        })

        subtotal += item_subtotal

    promos = check_promo(cart_items)

    discount_amount = 0
    promo_valid = True
    free_items = []

    if promo_id is not None:
        selected_promo = next(
            (promo for promo in promos if promo["promo_id"] == promo_id),
            None
        )

        if selected_promo is None:
            promo_valid = False
        else:
            discount_amount = selected_promo["benefit"]["discount_amount"]
            discount_amount = min(discount_amount, subtotal)

            free_items = selected_promo["benefit"]["items"]

    for item in free_items:
        product = get_product().find_one({
            "_id": ObjectId(item["product_id"])
        })

        if not product:
            return False
        
        qty = item["quantity"]

        items.append({
            "product_id": str(product["_id"]),
            "name": product["name"],
            "price": 0,
            "qty": qty,
            "subtotal": 0,
            "is_free": True
        })

    total = subtotal - discount_amount
    change = max(cash - total, 0)

    return {
        "items": items,
        "promos": promos,
        "promo_valid": promo_valid,
        "subtotal": subtotal,
        "discount_amount": discount_amount,
        "total": total,
        "change": change
    }


def get_total_sales():
    collection = get_transaction()

    result = collection.aggregate([
        {
            "$group": {
                "_id": None,
                "total_sales": {
                    "$sum": "$final_total"
                }
            }
        }
    ])

    data = next(result, None)

    if data is None:
        return 0

    return data["total_sales"]


def get_total_transactions():
    collection = get_transaction()

    return collection.count_documents({})


def get_daily_sales():
    collection = get_transaction()

    result = collection.aggregate([
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$created_at"
                    }
                },
                "total": {
                    "$sum": "$final_total"
                }
            }
        },
        {
            "$sort": {
                "_id": 1
            }
        }
    ])

    sales = []

    for data in result:
        sales.append({
            "day": data["_id"],
            "total": data["total"]
        })

    return sales


def get_best_products():
    collection = get_transaction()

    result = collection.aggregate([
        {
            "$unwind": "$items"
        },
        {
            "$group": {
                "_id": "$items.product_id",
                "name": {
                    "$first": "$items.name"
                },
                "total_sold": {
                    "$sum": "$items.qty"
                }
            }
        },
        {
            "$sort": {
                "total_sold": -1
            }
        },
        {
            "$limit": 3
        },
        {
            "$project": {
                "_id": 0,
                "product_id": "$_id",
                "name": 1,
                "total_sold": 1
            }
        }
    ])

    return list(result)


def get_best_promos():
    collection = get_transaction()

    result = collection.aggregate([
        {
            "$unwind": "$promos"
        },
        {
            "$group": {
                "_id": "$promos.promo_id",
                "name": {
                    "$first": "$promos.name"
                },
                "code": {
                    "$first": "$promos.code"
                },
                "total_used": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort": {
                "total_used": -1
            }
        },
        {
            "$limit": 3
        },
        {
            "$project": {
                "_id": 0,
                "promo_id": "$_id",
                "name": 1,
                "code": 1,
                "total_used": 1
            }
        }
    ])

    return list(result)


def get_total_discount():
    collection = get_transaction()

    return collection.count_documents({
        "promos.0": {"$exists": True}
    })


def get_average_purchase():
    collection = get_transaction()

    result = collection.aggregate([
        {
            "$group": {
                "_id": None,
                "average_purchase": {
                    "$avg": "$final_total"
                }
            }
        }
    ])

    data = next(result, None)

    if data is None:
        return 0

    return round(data["average_purchase"], 2)