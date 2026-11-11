from flask import current_app

def get_transaction():
    db = current_app.config["MONGO_DB"]
    return db["transactions"]

def save_transaction(data):
    collection = get_transaction()
    result = collection.insert_one(data)
    return result.inserted_id
