# import module
import pandas as pd

# function loads 3 csv files into pandas dataframe: happiness, gpi, suicide. Merge the dataframes.
# Returns the result merged dataframes after cleaning the data.
def happiness_data():
    # Load happiness data file into dataframe
    happy_df = pd.read_csv("./data/happiness.csv", encoding='utf-8-sig')
    # Rename column names: country, year
    happy_df = happy_df.rename(columns= {'Country name': 'country', 'Year':'year'})
    # Load GPI data file into dataframe.  melt year columns into year row
    cols = ['country'] + ["score_"+str(i) for i in range(2011,2017)]
    gpi_df = pd.read_csv("./data/gpi.csv", skiprows=0, usecols=cols, encoding='utf-8-sig')
    gpi_df = pd.melt(gpi_df, id_vars=["country"], var_name="Year", value_name="GPI")
    # replace score_ with empty string, so the year value consist of only the year value
    gpi_df["Year"] = gpi_df["Year"].str.replace("score_", "")
    gpi_df = gpi_df.rename(columns = {'Year':'year'})
    # create new gpi file with the melted columns and read as the new dataframe
    gpi_df.to_csv("./data/gpiData.csv", encoding='utf-8-sig')
    gpi_df = pd.read_csv("./data/gpiData.csv", encoding='utf-8-sig')
    del gpi_df['Unnamed: 0']
    # Load the suicide file into a dataframe
    suicide_df = pd.read_csv("./data/suicide.csv", encoding='utf-8-sig')
    # drop the empty values
    suicide_df = suicide_df.dropna()
    # Filter the suicide data by year: we're using 2011-2016
    suicide2011 = suicide_df.loc[suicide_df['year'] == 2011]
    suicide2012 = suicide_df.loc[suicide_df['year'] == 2012]
    suicide2013 = suicide_df.loc[suicide_df['year'] == 2013]
    suicide2014 = suicide_df.loc[suicide_df['year'] == 2014]
    suicide2015 = suicide_df.loc[suicide_df['year'] == 2015]
    suicide2016 = suicide_df.loc[suicide_df['year'] == 2016]
    # Merge the filter data frames into one dataframe call suicide range
    suicide_range = suicide2011.append(suicide2012)
    suicide_range = suicide_range.append(suicide2013)
    suicide_range = suicide_range.append(suicide2014)
    suicide_range = suicide_range.append(suicide2015)
    suicide_range = suicide_range.append(suicide2016)
    # drop empty values
    suicide_range = suicide_range.dropna()
    # group suicide range by country and year, then flattne data frame with reset index
    suicide_grouped = suicide_range.groupby(["country", "year"]).sum().reset_index()
    # create rate column. calculate: suicide rate = suicide no. / population
    suicide_grouped['rate'] = suicide_grouped['suicides_no']/suicide_grouped['population']
    # create per100k column. calculate: per100k = rate * 100,000
    suicide_grouped['per100k'] = suicide_grouped['rate']*100000
    # Filter happy df to consist of the factor titles, we'll be using in our dashboards
    happy_df = happy_df[['country', 'year', 'Life Ladder', 'Log GDP per capita', 'Social support',
                    'Healthy life expectancy at birth', 'Freedom to make life choices', 'Generosity',
                    'Confidence in national government']]
    # Group suicide data by country and sum up the values, then flatten dataframe with reset index
    countries_suicide = suicide_grouped.groupby(['country']).count().reset_index()
    # Group suicide data by country and sum up the values, then flatten dataframe with reset index
    countries_happy = happy_df.groupby(['country']).count().reset_index()
    # Merge suicide and happy dataframe by country
    compare_countries = countries_suicide.merge(countries_happy, on = 'country', how='outer')
    # mark mismatch with 'x'
    compare_countries = compare_countries.fillna(value='x')
    # check for mismatch country names
    for index,row in compare_countries.iterrows():
        if row['year_x'] != 'x' and row['year_y'] != 'x':
            compare_countries = compare_countries.drop(index)
    # clean country's name to match between suicide and happiness data
    for i in range(0,len(happy_df)):
        if happy_df.iloc[i, 0] == 'Hong Kong S.A.R. of China':
            happy_df.iloc[i, 0] = 'Hong Kong SAR'
        if happy_df.iloc[i, 0] == 'United States':
            happy_df.iloc[i, 0] = 'United States of America'
    # clean country's name to match between suicide and happiness data
    for i in range(0,len(suicide_grouped)):
        if suicide_grouped.iloc[i, 0] == 'Iran (Islamic Rep of)':
            suicide_grouped.iloc[i, 0] = 'Iran'
        if suicide_grouped.iloc[i, 0] == 'Republic of Korea':
            suicide_grouped.iloc[i, 0] = 'South Korea'
        if suicide_grouped.iloc[i, 0] == 'Republic of Moldova':
            suicide_grouped.iloc[i, 0] = 'Moldova'
        if suicide_grouped.iloc[i, 0] == 'Russian Federation':
            suicide_grouped.iloc[i, 0] = 'Russia'
        if suicide_grouped.iloc[i, 0] == 'TFYR Macedonia':
            suicide_grouped.iloc[i, 0] = 'Macedonia'
        if suicide_grouped.iloc[i, 0] == 'Venezuela (Bolivarian Republic of)':
            suicide_grouped.iloc[i, 0] = 'Venesuela'

    # Merge suicide+happy with gpi dataframe by country
    countries_gpi = gpi_df.groupby(['country']).count().reset_index()
    compare_countries = countries_suicide.merge(countries_gpi, on = 'country', how='outer')
    # mark mismatch with 'x'
    compare_countries = compare_countries.fillna(value='x')
    # check for mismatch country names
    for index,row in compare_countries.iterrows():
        if row['year_x'] != 'x' and row['year_y'] != 'x':
            compare_countries = compare_countries.drop(index)
    # clean country's name to match between suicide+happiness data and gpi data
    for i in range(0,len(gpi_df)):
        if gpi_df.iloc[i, 0] == 'United States':
            gpi_df.iloc[i, 0] = 'United States of America'

    countries_gpi = gpi_df.groupby(['country']).count().reset_index()

    compare_countries = countries_happy.merge(countries_gpi, on = 'country', how='outer')
    compare_countries = compare_countries.fillna(value='x')
    for index,row in compare_countries.iterrows():
        if row['year_x'] != 'x' and row['year_y'] != 'x':
            compare_countries = compare_countries.drop(index)
    # clean country's name to match between suicide+happiness data and gpi data
    for i in range(0,len(happy_df)):
        if happy_df.iloc[i, 0] == 'Congo (Brazzaville)':
            happy_df.iloc[i, 0] = 'Republic of the Congo'
        if happy_df.iloc[i, 0] == 'Congo (Kinshasa)':
            happy_df.iloc[i, 0] = 'Democratic Republic of the Congo'
        if happy_df.iloc[i, 0] == 'Taiwan Province of China':
            happy_df.iloc[i, 0] = 'Taiwan'
        if happy_df.iloc[i, 0] == 'Palestinian Territories':
            happy_df.iloc[i, 0] = 'Palestine'
    # merge suicide+happiness data and gpi data
    merge1_df = happy_df.merge(suicide_grouped, on=(['country', 'year']))
    merged_df = merge1_df.merge(gpi_df, on=(['country', 'year']))

    # rename columns to match facors title
    merged_df = merged_df.rename(columns= { 'per100k': 'Suicide Rate',
                                            'GPI': 'Global Peace Index',
                                            'Life Ladder': 'Happiness',
                                            'Log GDP per capita': 'Gross Domestic Product', 
                                            'Freedom to make life choices': 'Freedom',
                                            'Generosity': 'Generosity',
                                            'Confidence in national government': 'Trust in Government'})
    # Filter data for factors data
    merged_df = merged_df[['country', 'year', 'Suicide Rate', 'Global Peace Index', 'Happiness',
                    'Gross Domestic Product', 'Freedom', 'Generosity',
                    'Trust in Government']]
    return merged_df