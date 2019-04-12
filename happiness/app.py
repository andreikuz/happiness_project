# import modules
import os
from flask import Flask, render_template, jsonify
import psycopg2
import json
from factors import factors_data
from script import happiness_data

##### Initialize Database #####
# Create PostgreSQL connection
DATABASE_URL = os.environ['DATABASE_URL']
conn = psycopg2.connect(DATABASE_URL, sslmode='require')

cur = conn.cursor()

# function creates factors and happiness table
def create_tables():
    # drop table if exists and then create table
    commands = (
        """
        DROP TABLE IF EXISTS factors;
        CREATE TABLE factors (
            factors_id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            descr TEXT NOT NULL
        )
        """,
        """ DROP TABLE IF EXISTS happiness;
            CREATE TABLE happiness (
                happiness_id SERIAL PRIMARY KEY,
                country TEXT NOT NULL,
                year INT,
                Suicide_Rate float8,
                Global_Peace_Index float8,
                Happiness float8,
                Gross_Domestic_Product float8,
                Freedom float8,
                Generosity float8,
                Trust_in_Government float8
                )
        """)

    # create table one by one
    for command in commands:
        cur.execute(command)
    # commit the changes
    conn.commit()

def init_db():
    # Define Database tables
    create_tables()
    # Initialize ETL into PostgreSQL
    # Call script to load up factors
    factors_results = factors_data()
    # Insert factors data
    factors_sqlInsert = "INSERT INTO factors(title, descr) VALUES(%s, %s)"
    # execute the INSERT statement
    cur.executemany(factors_sqlInsert, factors_results)
    # commit the changes to the database
    conn.commit()
    # load extracted & transformed data into pandas df
    happiness_df = happiness_data()
    # Insert happiness data
    happiness_sqlInsert = """INSERT INTO happiness(country, year, Suicide_Rate,
                                                    Global_Peace_Index, Happiness, Gross_Domestic_Product,
                                                    Freedom, Generosity, Trust_in_Government) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
    happiness_values = []
    for index, row in happiness_df.iterrows():
        happiness_values.append((row['country'], row['year'], row['Suicide Rate'],
                                 row['Global Peace Index'], row['Happiness'], row['Gross Domestic Product'],
                                 row['Freedom'], row['Generosity'], row['Trust in Government']))
    # execute the INSERT statement
    cur.executemany(happiness_sqlInsert, happiness_values)
    # commit the changes to the database
    conn.commit()

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
    cur.execute("SELECT DISTINCT title, descr FROM factors")
    rows = cur.fetchall()
    results = []
    for row in rows:
        results.append({"title": row[0],
                        "desc": row[1]})

    # Return factors in json
    return jsonify(results)

# API for factors: title + description
@app.route("/api/v1.0/happinessdata", methods=['GET', 'POST'])
def happinessdata():
    """Return a list of all the happinessdata"""

    cur.execute("""SELECT country, year, Suicide_Rate,
                    Global_Peace_Index, Happiness, Gross_Domestic_Product,
                    Freedom, Generosity, Trust_in_Government FROM happiness""")
    rows = cur.fetchall()
    results = []
    for row in rows:
        results.append({"country": row[0],
                        "year": row[1],
                        "Suicide Rate": row[2],
                        "Global Peace Index": row[3],
                        "Happiness": row[4],
                        "Gross Domestic Product": row[5],
                        "Freedom": row[6],
                        "Generosity": row[7],
                        "Trust in Government": row[8]})
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
    
