import pandas as pd

happy_df = pd.read_csv("data/happiness.csv")
happy_df = happy_df.rename(columns= {'Country name': 'country', 'Year':'year'})

cols = ['country'] + ["score_"+str(i) for i in range(2011,2017)]
gpi_df = pd.read_csv("data/gpi.csv", skiprows=0, usecols=cols)
gpi_df = pd.melt(gpi_df, id_vars=["country"], var_name="Year", value_name="GPI")

gpi_df["Year"] = gpi_df["Year"].str.replace("score_", "")
gpi_df = gpi_df.rename(columns = {'Year':'year'})

gpi_df.to_csv("data/gpiData.csv")
gpi_df = pd.read_csv("data/gpiData.csv")
del gpi_df['Unnamed: 0']

suicide_df = pd.read_csv("data/suicide.csv")

suicide_df = suicide_df.dropna()

suicide2011 = suicide_df.loc[suicide_df['year'] == 2011]
suicide2012 = suicide_df.loc[suicide_df['year'] == 2012]
suicide2013 = suicide_df.loc[suicide_df['year'] == 2013]
suicide2014 = suicide_df.loc[suicide_df['year'] == 2014]
suicide2015 = suicide_df.loc[suicide_df['year'] == 2015]
suicide2016 = suicide_df.loc[suicide_df['year'] == 2016]

suicide_range = suicide2011.append(suicide2012)
suicide_range = suicide_range.append(suicide2013)
suicide_range = suicide_range.append(suicide2014)
suicide_range = suicide_range.append(suicide2015)
suicide_range = suicide_range.append(suicide2016)

suicide_range['year'].value_counts()

suicide_range = suicide_range.dropna()

suicide_grouped = suicide_range.groupby(["country", "year"]).sum().reset_index()
suicide_grouped['rate'] = suicide_grouped['suicides_no']/suicide_grouped['population']
suicide_grouped['per100k'] = suicide_grouped['rate']*100000
happy_df = happy_df[['country', 'year', 'Life Ladder', 'Log GDP per capita', 'Social support',
                   'Healthy life expectancy at birth', 'Freedom to make life choices', 'Generosity',
                   'Confidence in national government']]

countries_suicide = suicide_grouped.groupby(['country']).count().reset_index()
countries_happy = happy_df.groupby(['country']).count().reset_index()

compare_countries = countries_suicide.merge(countries_happy, on = 'country', how='outer')
compare_countries = compare_countries.fillna(value='x')

for index,row in compare_countries.iterrows():
    if row['year_x'] != 'x' and row['year_y'] != 'x':
        compare_countries = compare_countries.drop(index)

for i in range(0,len(happy_df)):
    if happy_df.iloc[i, 0] == 'Hong Kong S.A.R. of China':
        happy_df.iloc[i, 0] = 'Hong Kong SAR'
    if happy_df.iloc[i, 0] == 'United States':
        happy_df.iloc[i, 0] = 'United States of America'
        
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

countries_gpi = gpi_df.groupby(['country']).count().reset_index()

compare_countries = countries_suicide.merge(countries_gpi, on = 'country', how='outer')
compare_countries = compare_countries.fillna(value='x')
for index,row in compare_countries.iterrows():
    if row['year_x'] != 'x' and row['year_y'] != 'x':
        compare_countries = compare_countries.drop(index)

for i in range(0,len(gpi_df)):
    if gpi_df.iloc[i, 0] == 'United States':
        gpi_df.iloc[i, 0] = 'United States of America'

countries_gpi = gpi_df.groupby(['country']).count().reset_index()

compare_countries = countries_happy.merge(countries_gpi, on = 'country', how='outer')
compare_countries = compare_countries.fillna(value='x')
for index,row in compare_countries.iterrows():
    if row['year_x'] != 'x' and row['year_y'] != 'x':
        compare_countries = compare_countries.drop(index)

for i in range(0,len(happy_df)):
    if happy_df.iloc[i, 0] == 'Congo (Brazzaville)':
        happy_df.iloc[i, 0] = 'Republic of the Congo'
    if happy_df.iloc[i, 0] == 'Congo (Kinshasa)':
        happy_df.iloc[i, 0] = 'Democratic Republic of the Congo'
    if happy_df.iloc[i, 0] == 'Taiwan Province of China':
        happy_df.iloc[i, 0] = 'Taiwan'
    if happy_df.iloc[i, 0] == 'Palestinian Territories':
        happy_df.iloc[i, 0] = 'Palestine'

merge1_df = happy_df.merge(suicide_grouped, on=(['country', 'year']))
merged_df = merge1_df.merge(gpi_df, on=(['country', 'year']))

merged_df.to_csv("data/merged_data.csv")