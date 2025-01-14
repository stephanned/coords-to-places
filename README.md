# coords-to-places

Convert latitude/longitude to:
* Country
* Country subdivision (state, region, county)
* Town (distance from defined centre point of selected towns)

## Data sources
The module contains a script that converts data from naturalearthdata.com to a set of JSON files. These JSON files contain polygons to define borders of countries and subdivisions, as well as centre points for a selection of larger towns.

Unlike some other modules, this module takes into consideration inaccuracies around coast lines, meaning that for coordinates by the coast you will still get a country and regional result even if the point is marginally outside the (simplified) polygons provided. It does this by looking for the nearest matching country/region if no polygon is found that contains the actual location.

The data is loaded as needed and then kept in memory. Country divisions (states, regions, etc.) are separated into per-country files to reduce memory overhead.

## Using the module

### getLocality

```javascript
getLocality(43.0127464909186, -81.24605238996821);
```

```javascript
{
  country: { iso: 'CA', name: 'Canada' },
  description: 'London, Ontario, Canada',
  sub: {
    type: 'Province',
    name: 'Ontario',
    region: 'Eastern Canada',
    iso_3166_2: 'CA-ON'
  },
  town: { name: 'London', distance: 845 }
}
```
An optional third parameter `{sub = true, town = true}` can be specified to limit results to not return all levels

### getCountry

```javascript
getCountry(43.0127464909186, -81.24605238996821)
```

```javascript
{ iso: 'CA', name: 'Canada' }
```

### getSubdivision

```javascript
getSubdivision(43.0127464909186, -81.24605238996821)
```

```javascript
{
    type: 'Province',
    name: 'Ontario',
    region: 'Eastern Canada',
    iso_3166_2: 'CA-ON'
}
```

### getClosestTown

```javascript
getClosestTown(43.0127464909186, -81.24605238996821)
```

```javascript
{ name: 'London', distance: 845 }
```

### preload({ country: true, sub: true, town: true })

Preloads data files for each level. You can opt to only load for some levels by specifying option parameters.

### getCountries

Returns a list of countries

### getSubdivisions(countryCode)

Returns supported subdivisions for the selected country (as strings)

### getTowns(countryCode)

Returns an array of strings representing supported towns for the selected country

# Refreshing data

Go to https://www.naturalearthdata.com/downloads/10m-cultural-vectors/

Download: Admin 0 - Countries => unzip into data/countries

Download: Admin 1 - States, Provinces => unzip into data/provinces

Download: Populated Places => unzip into data/populated

npx coords-populate