import os

from flask import Flask, redirect, url_for
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

def create_app():
    app = Flask(
        __name__,
        static_folder="../static",
        template_folder="../templates",
    )

    MONGO_URI = os.getenv("MONGO_URI")
    MONGO_DB = os.getenv("MONGO_DB")
    SECRET_KEY = os.getenv("SECRET_KEY")

    if not MONGO_URI:
        print("MONGO URI Tidak Ada!")
        raise ValueError("MONGO URI Tidak Ada!")
    if not MONGO_DB:
        print("MONGO DB Tidak Ada!")
        raise ValueError("MONGO DB Tidak Ada!")
    if not SECRET_KEY:
        print("SECRET KEY Tidak Ada!")
        raise ValueError("SECRET KEY Tidak Adat!")

    print("\nMONGO URI, MONGO DB dan SECRET KEY ada")

    app.config["SECRET_KEY"] = SECRET_KEY

    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]

    try:
        client.admin.command("ping")
        print("\nBerhasil terhubung ke MongoDB!")
    except Exception as e:
        client.close()
        raise RuntimeError("Gagal terhubung ke MongoDB: ") from e
    
    app.config["MONGO_CLIENT"] = client
    app.config["MONGO_DB"] = db


    from app.auth import auth_blueprint
    from app.cashier import cashier_blueprint
    from app.admin import admin_blueprint
    from app.product import product_blueprint
    from app.transaction import transaction_blueprint
    from app.promo import promo_blueprint

    app.register_blueprint(auth_blueprint)
    app.register_blueprint(cashier_blueprint)
    app.register_blueprint(admin_blueprint)
    app.register_blueprint(product_blueprint)
    app.register_blueprint(transaction_blueprint)
    app.register_blueprint(promo_blueprint)

    @app.get("/")
    def index():
        return redirect(url_for("auth.login"))

    return app