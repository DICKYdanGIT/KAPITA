from functools import wraps
from flask import session, redirect, url_for, jsonify

def login_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("auth.login"))
        return view(*args, **kwargs)
    return wrapper

def role_required(required_role):
    def decorator(view):
        @wraps(view)
        def wrapper(*args, **kwargs):
            if session.get("role") != required_role:
                return jsonify({"error": "Akses ditolak"}), 403
            return view(*args, **kwargs)
        return wrapper
    return decorator