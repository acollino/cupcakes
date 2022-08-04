"""Flask app for Cupcakes"""
from flask import Flask, jsonify, request, render_template
from models import Cupcake, db, connect_db
import os

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev_default")
uri = os.getenv("DATABASE_URL", "postgresql:///desserts")
if uri.startswith("postgres://"):  # since heroku uses 'postgres', not 'postgresql'
    uri = uri.replace("postgres://", "postgresql://", 1)
app.config["SQLALCHEMY_DATABASE_URI"] = uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True
app.debug = True

connect_db(app)


@app.route("/")
def display_home():
    """Display the home page of the cupcakes site."""
    return render_template("index.html")


@app.route("/api/cupcakes")
def display_all_cupcakes():
    """Gets data about all cupcakes in the table."""
    cupcakes_all = Cupcake.query.order_by(Cupcake.id).all()
    cupcake_list = [cupcake.serialize() for cupcake in cupcakes_all]
    return jsonify(cupcakes=cupcake_list)


@app.route("/api/cupcakes/<cupcake_id>")
def display_single_cupcake(cupcake_id):
    """Gets data about a single cupcake in the table."""
    cupcake_single = Cupcake.query.get_or_404(cupcake_id)
    return jsonify(cupcake=cupcake_single.serialize())


@app.route("/api/cupcakes", methods=["POST"])
def create_cupcake():
    """Create a cupcake with flavor, size, rating and image data from the request."""
    cupcake_new = Cupcake(**request.json)
    db.session.add(cupcake_new)
    db.session.commit()
    return (jsonify(cupcake=cupcake_new.serialize()), 201)


@app.route("/api/cupcakes/<cupcake_id>", methods=["PATCH"])
def update_cupcake(cupcake_id):
    """Updates data for a specified cupcake in the table."""
    cupcake_to_update = Cupcake.query.get_or_404(cupcake_id)
    for key in request.json.keys():
        setattr(cupcake_to_update, key, request.json.get(key, None))
    db.session.commit()
    return jsonify(cupcake=cupcake_to_update.serialize())


@app.route("/api/cupcakes/<cupcake_id>", methods=["DELETE"])
def delete_cupcake(cupcake_id):
    """Deletes a specified cupcake from the table."""
    cupcake_to_delete = Cupcake.query.get_or_404(cupcake_id)
    db.session.delete(cupcake_to_delete)
    db.session.commit()
    return jsonify({"message": "deleted"})
