# coords-to-places

Convert latitude/longitude to *Country*, *Subdivision* (state, region, country) and *Town* information.

## What it does
The module contains a script that converts data from naturalearthdata.com to a set of JSON files. These JSON files contain polygons to define borders of countries and subdivisions, as well as centre points for a selection of larger towns.

Unlike some other modules, this module takes into consideration inaccuracies around coast lines, meaning that for coordinates by the coast you will still get a country and regional result even if the point is marginally outside the (simplified) polygons provided. It does this by looking for the nearest matching country/region if no polygon is found that contains the actual location.

The data is loaded as needed and then kept in memory. Country divisions (states, regions, etc.) are separated into per-country files to reduce memory overhead.

## Using the module

The following functions can be imported from the module:

### getLocality(latitude, longitude)

```javascript
> getLocality(43.0127464909186, -81.24605238996821);
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

```
> getLocality(43.0127464909186, -81.24605238996821, { sub: false });
{
  country: { iso: 'CA', name: 'Canada' },
  description: 'London, Canada',
  town: { name: 'London', distance: 845 }
}
```

### getCountry(latitude, longitude)

```javascript
> getCountry(43.0127464909186, -81.24605238996821);
{ iso: 'CA', name: 'Canada' }
```

### getSubdivision(latitude, longitude, isoCountryCode)

```javascript
> getSubdivision(43.0127464909186, -81.24605238996821);
{
  type: 'Province',
  name: 'Ontario',
  region: 'Eastern Canada',
  iso_3166_2: 'CA-ON'
}
```

Specifying the country code will avoid a country lookup which is otherwise performed prior to retrieving and comparing with relevant state/region polygons.

### getClosestTown(latitude, longitude, isoCountryCode)

Returns name of closest town and distance in metres

```javascript
> getClosestTown(43.0127464909186, -81.24605238996821, 'CA')
{ name: 'London', distance: 845 }
```

The country code is optional. Specifying the country code will avoid a country lookup which is otherwise performed prior to retrieving and comparing with relevant town coordinates.

### getCountries()

Returns a list of countries

```
> getCountries()
{
  ID: 'Indonesia',
  MY: 'Malaysia',
  CL: 'Chile',
  BO: 'Bolivia',
  PE: 'Peru',
  ...
}
```

### getSubdivisions(isoCountryCode)

Returns supported subdivisions for the selected country (as strings)

```
> getSubdivisions('AX')
[
  'Lumparland', 'Eckerö',
  'Vårdö',      'Kumlinge',
  'Jomala',     'Mariehamn',
  'Kökar',      'Föglö',
  'Sottunga',   'Lemland',
  'Brändö'
]
```

### getTowns(isoCountryCode)

Returns an array of strings representing supported towns for the selected country

```
> getTowns('LU')
[ 'Diekirch', 'Grevenmacher', 'Luxembourg' ]
```