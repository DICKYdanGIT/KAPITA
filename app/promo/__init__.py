from flask import Blueprint

promo_blueprint = Blueprint("promo", __name__, url_prefix="/promo")

from app.promo import routes