"""Flask app for Cupcakes"""
from crypt import methods
from flask import Flask, jsonify, request, render_template, redirect
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
    pass


# Part Two: Listing, Getting & Creating Cupcakes
# Make routes for the following:

# GET /api/cupcakes
# Get data about all cupcakes.
# Respond with JSON like: {cupcakes: [{id, flavor, size, rating, image}, ...]}.
# The values should come from each cupcake instance.
@app.route("/api/cupcakes")
def display_all_cupcakes():
    """Gets data about all cupcakes in the table."""
    cupcakes_all = Cupcake.query.all()
    cupcake_list = [cupcake.serialize() for cupcake in cupcakes_all]
    return jsonify(cupcakes=cupcake_list)


# GET /api/cupcakes/[cupcake-id]
# Get data about a single cupcake.
# Respond with JSON like: {cupcake: {id, flavor, size, rating, image}}.
# This should raise a 404 if the cupcake cannot be found.
@app.route("/api/cupcakes/<cupcake_id>")
def display_single_cupcake(cupcake_id):
    """Gets data about a single cupcake in the table."""
    cupcake_single = Cupcake.query.get_or_404(cupcake_id)
    return jsonify(cupcake=cupcake_single.serialize())


# POST /api/cupcakes
# Create a cupcake with flavor, size, rating and image data from the body of the request.
# Respond with JSON like: {cupcake: {id, flavor, size, rating, image}}.
@app.route("/api/cupcakes", methods=["POST"])
def create_cupcake():
    """Create a cupcake with flavor, size, rating and image data from the request."""
    cupcake_new = Cupcake(**request.json)
    db.session.add(cupcake_new)
    db.session.commit()
    return (jsonify(cupcake=cupcake_new.serialize()), 201)


# Part Three: Update & Delete Cupcakes
# Make routes for the following:

# PATCH /api/cupcakes/[cupcake-id]
# Update a cupcake with the id passed in the URL and flavor, size, rating and image data from the body of the request. 
# You can always assume that the entire cupcake object will be passed to the backend.
# This should raise a 404 if the cupcake cannot be found.
# Respond with JSON of the newly-updated cupcake, like this: {cupcake: {id, flavor, size, rating, image}}.
@app.route("/api/cupcakes/<cupcake_id>", methods=["PATCH"])
def update_cupcake(cupcake_id):
    """Updates data for a specified cupcake in the table."""
    cupcake_to_update = Cupcake.query.get_or_404(cupcake_id)
    for key in request.json.keys():
        setattr(cupcake_to_update, key, request.json.get(key, None))
    db.session.commit()
    return jsonify(cupcake=cupcake_to_update.serialize())

# DELETE /api/cupcakes/[cupcake-id]
# This should raise a 404 if the cupcake cannot be found.
# Delete cupcake with the id passed in the URL. Respond with JSON like {message: "Deleted"}.
@app.route("/api/cupcakes/<cupcake_id>", methods=["DELETE"])
def delete_cupcake(cupcake_id):
    """Deletes a specified cupcake from the table."""
    cupcake_to_delete = Cupcake.query.get_or_404(cupcake_id)
    db.session.delete(cupcake_to_delete)
    db.session.commit()
    return jsonify({"message":"deleted"})

# Test these routes in Insomnia.

# Part Four: Write More Tests
# Add tests for the PATCH and DELETE routes.
