from flask import Flask, render_template, redirect
from flask_pymongo import PyMongo

app = Flask(__name__)

# Use flask_pymongo to set up mongo connection
app.config["MONGO_URI"] = "mongodb://localhost:27017/happines_app"
mongo = PyMongo(app)

@app.route("/")
def index():
    # happiness_data = mongo.db.happiness.find_one()
    # return render_template("index.html", happiness=happiness_data)
    return render_template("index.html")

# leaflet geomap: 
@app.route("/geomap")
def geomap():
    # happiness_data = mongo.db.happiness.find_one()
    # return render_template("index.html", happiness=happiness_data)
    return render_template("geomap.html")

# radar chart: by year with all other columns
@app.route("/radar")
def radar():
    # happiness_data = mongo.db.happiness.find_one()
    # return render_template("index.html", happiness=happiness_data)
    return render_template("radar.html")

# scatter chart: by year with all other columns 
@app.route("/scatter")
def scatter():
    # happiness_data = mongo.db.happiness.find_one()
    # return render_template("index.html", happiness=happiness_data)
    return render_template("scatter.html")

if __name__ == "__main__":
    app.run(debug=True)
