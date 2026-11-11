from flask import current_app

def get_user(username):
    db = current_app.config["MONGO_DB"]
    user = db["users"].find_one({"username": username})

    return user