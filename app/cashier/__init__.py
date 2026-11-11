from flask import Blueprint

cashier_blueprint = Blueprint("cashier", __name__, url_prefix="/cashier")

from app.cashier import routes