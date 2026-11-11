from flask import Blueprint

transaction_blueprint = Blueprint("transaction", __name__, url_prefix="/transaction")

from app.transaction import routes