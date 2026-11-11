from flask import current_app
from bson import ObjectId

def get_product():
    db = current_app.config["MONGO_DB"]
    return db["products"]

def get_all_products():
    return list(get_product().find())


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
        {
            "_id": ObjectId(product_id),
            "stock": {"$gte": qty}
        },
        {
            "$inc": {"stock": -qty}
        }
    )

    return result.modified_count > 0

