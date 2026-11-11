from flask import render_template
from app.admin import admin_blueprint
from app.auth.decorator import login_required, role_required

@admin_blueprint.get("/")
@login_required
@role_required("admin")
def dashboard():
        return render_template("admin/index.html")