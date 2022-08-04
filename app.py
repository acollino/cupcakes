"""Flask app for Cupcakes"""
from flask import Flask, jsonify, request, render_template
from models import Cupcake, db, connect_db
import os

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")
uri = os.getenv("DATABASE_URL")
if uri.startswith("postgres://"):  # since heroku uses 'postgres', not 'postgresql'
    uri = uri.replace("postgres://", "postgresql://", 1)
app.config["SQLALCHEMY_DATABASE_URI"] = uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True

connect_db(app)

@app.before_first_request
def setup_table():
    """Creates the cupcakes table before the page is first accessed."""
    db.drop_all() #  If this was a real site hosted on heroku, dropping all every time the dynos started up
    db.create_all()# would cause data loss, but this keeps the tables clean on this demo project.
    seed_cupcakes = [
        Cupcake(
            flavor="Cookie Dough",
            size="Medium",
            rating=8.1,
            image="https://cdn.pixabay.com/photo/2017/03/27/14/20/cupcakes-2179039_960_720.jpg",
        ),
        Cupcake(
            flavor="Chocolate",
            size="Small",
            rating=8.5,
            image="https://cdn.pixabay.com/photo/2020/05/01/09/13/cupcakes-5116009_960_720.jpg",
        ),
        Cupcake(
            flavor="Hazelnut",
            size="Large",
            rating=9,
            image="https://cdn.pixabay.com/photo/2013/04/15/14/08/cupcake-104654_960_720.jpg",
        ),
    ]
    db.session.add_all(seed_cupcakes)
    db.session.commit()


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
