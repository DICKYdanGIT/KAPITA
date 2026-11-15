from flask import current_app

from bson import ObjectId
import re


def get_category():
    db = current_app.config["MONGO_DB"]
    return db["product_category"]

def get_all_category():
    return list(get_category().find()) 



#############################

def get_product():
    db = current_app.config["MONGO_DB"]
    return db["master_products"]


def get_all_products():
    products = list(get_product().find())
    category = list(get_category().find())

    category_map = {
        category["_id"]: category["name"]
        for category in category
    }

    for product in products:
        category_id = product.get("product_category_id")
        product["category_name"] = category_map.get(
            category_id,
            "Kategori tidak ditemukan"
        )
    return products


def get_all_products_with_margin():
    products = get_all_products()

    for product in products:
        price = product.get("price", 0)
        cost_price = product.get("cost_price", 0)

        if price <= 0:
            product["margin"] = 0
            product["margin_status"] = "Invalid"
            continue

        margin = ((price - cost_price) / price) * 100

        product["margin"] = round(margin, 2)

    return products


def switch_product_status(product_id):
    collection = get_product()
    if not ObjectId.is_valid(product_id):
        return False

    product = collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        return False

    result = collection.update_one(
        {"_id": ObjectId(product_id)}, [{"$set": {"status": {"$not": "$status"}}}]
    )
    return result.modified_count > 0


def min_product(product_id, qty):
    collection = get_product()

    result = collection.update_one(
        {"_id": ObjectId(product_id), "stock": {"$gte": qty}}, {"$inc": {"stock": -qty}}
    )
    return result.modified_count > 0


def search_product(keyword):
    collection = get_product()

    return list(collection.find({
        "name": {
            "$regex": re.escape(keyword),
            "$options": "i"
        }
    }))


def get_total_product():
    collection = get_product()

    return collection.count_documents({})


def get_total_stock():
    collection = get_product()

    result = collection.aggregate([
        {
            "$group": {
                "_id": None,
                "total_stock": {
                    "$sum": "$stock"
                }
            }
        }
    ])

    data = next(result, None)

    if data is None:
        return 0

    return data["total_stock"]


def get_average_margin():
    products = get_all_products_with_margin()

    valid_margins = [
        product["margin"]
        for product in products
        if product.get("price", 0) > 0
    ]

    if not valid_margins:
        return 0

    return round(sum(valid_margins) / len(valid_margins), 2)