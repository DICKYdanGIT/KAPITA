from flask import render_template
from app.cashier import cashier_blueprint
from app.auth.decorator import login_required, role_required

@cashier_blueprint.get("/")
@login_required
@role_required("cashier")
def dashboard():
    return render_template("cashier/index.html")