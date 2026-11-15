from functools import wraps
from flask import session, redirect, url_for, jsonify, request


def get_role_home():
    role = session.get("role")
    if role == "admin":
        return "/admin"
    elif role == "cashier":
        return "/cashier"
    return url_for("auth.login")


def login_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({
                "error": "Belum login",
                "redirect": url_for("auth.login")
            }), 401
            
        return view(*args, **kwargs)

    return wrapper


def role_required(*required_roles):
    def decorator(view):
        @wraps(view)
        def wrapper(*args, **kwargs):

            current_role = session.get("role")

            if current_role not in required_roles:

                redirect_url = get_role_home()

                if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                    return jsonify({
                        "error": "Akses ditolak",
                        "redirect": redirect_url
                    }), 403

                return redirect(redirect_url)

            return view(*args, **kwargs)

        return wrapper
    return decorator
