from flask import render_template, request, jsonify, session
from app.auth import auth_blueprint
from app.auth.models import get_user
from werkzeug.security import check_password_hash


@auth_blueprint.get("/login")
def login():
    return render_template("index.html")

@auth_blueprint.post("/login")
def proses_login():

    data = request.get_json()

    if not data:
        return jsonify({"error": "Request JSON tidak valid"}), 400

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username dan password wajib diisi"}), 400

    user = get_user(username)

    if not user:
        return jsonify({"error": "Username atau password salah"}), 401

    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Username atau password salah"}), 401

    if user["role"] not in ["cashier", "admin"]:
        return jsonify({"error": "Role tidak diketahui"}), 403

    session.clear()

    session["user_id"] = str(user["_id"])
    session["username"] = user["username"]
    session["role"] = user["role"]

    if user["role"] == "cashier":
        return jsonify({"message": "Login Kasir berhasil", "redirect": "/cashier"}), 200

    elif user["role"] == "admin":
        return jsonify({"message": "Login Admin berhasil", "redirect": "/admin"}), 200

@auth_blueprint.post("/logout")
def logout():
    session.clear()
    return jsonify({"message": "Logout berhasil", "redirect": "/auth/login"}), 200