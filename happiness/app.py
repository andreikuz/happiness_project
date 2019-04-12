# import modules
import os
from flask import Flask, render_template, redirect, jsonify
import pymongo
import pandas as pd
import json
from factors import factors_data
from script import happiness_data

##### Initialize MongoDB #####
# Create connection variable
# conn = os.environ.get('MONGODB_URI')
conn = 'mongodb://localhost:27017'
# Pass connection to the pymongo instance.
client = pymongo.MongoClient(conn)
# Connect to a database. Will create one if not already available.
db = client.happiness_db
# db = client.get_default_database()
# db = client.test

# function loads happiness data in dataframe to store into mongodb
def load_data():
    return happiness_data()

def init_db():
    # Initialize ETL into MongoDB
    # Call script to load up factors in json
    factors_results = factors_data()
    # load extracted & transformed data into pandas df
    happiness_df = load_data()
    # Convert dataframe to json
    data_json = json.loads(happiness_df.to_json(orient='records'))
    # Removes collections if available to prevent duplicates
    db.factors.remove()
    db.happiness.remove()
    # Insert factors into mongodb
    db.factors.insert_many(factors_results)
    # Insert happiness data into MongoDB
    db.happiness.insert_many(data_json)

##### Initialize Flask #####
# Create an instance of our Flask app.
app = Flask(__name__)

# render home page
@app.route("/")
def index():
    return render_template("index.html")

# render leaflet geomap page
@app.route("/geomap")
def geomap():
    return render_template("geomap.html")

# render radar chart page
@app.route("/radar")
def radar():
    return render_template("radar.html")

# render scatter chart page
@app.route("/scatter")
def scatter():
    return render_template("scatter.html")

# API for factors: title + description
@app.route("/api/v1.0/factors", methods=['GET', 'POST'])
def factors():
    """Return a list of factors"""

    # Use Pandas to perform the mongodb
    keys = list(db.factors.find_one())[1:]
    factors_data = db.factors.find()
    # keys = ("country", "year")
    results = []
    for row in factors_data:
        results.append({k: row[k] for k in keys})

    # Return factors in json
    return jsonify(results)

# API for factors: title + description
@app.route("/api/v1.0/happinessdata", methods=['GET', 'POST'])
def happinessdata():
    """Return a list of all the happinessdata"""
    # Query data from mongoDB
    # {} = "select * from happiness"
    # Get the column names and then drop the _id
    keys = list(db.happiness.find_one())[1:]
    happiness_data = db.happiness.find()
    # keys = ("country", "year")
    results = []
    for row in happiness_data:
        results.append({k: row[k] for k in keys})

    # Return the happiness data in json
    return jsonify(results)


# Setup MongoDB when Flask launches
def setup_app(app):
   # All your initialization code
    init_db()

setup_app(app)

# Run main app
if __name__ == "__main__":
    app.run(debug=True)
    
