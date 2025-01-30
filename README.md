# coords-to-places

Convert latitude/longitude to *Country*, *Region* and *Nearest major city* information.

## What it does
The module is based on data converted from naturalearthdata.com to a set of JSON files. These JSON files contain polygons to define borders of countries and regions (states, provinces, etc.), as well as centre points for a selection of major cities (and some minor ones in more sparsely populated areas).

Unlike some other modules, this module takes into consideration inaccuracies around coast lines, meaning that for coordinates by the coast you will still get a country and regional result even if the point is marginally outside the (simplified) polygons provided by the source. It does this by looking for the nearest matching country/region if no polygon is found that contains the actual location.

The data is loaded as needed and then kept in memory. Regions (states, regions, etc.) are separated into per-country files to reduce memory overhead.

## Usage

```javascript
import { getLocation } from 'coords-to-places';

const loc = getLocation(34.004102321407224 -118.32115422221612);

console.log(loc.country); // { code: 'USA', iso: 'US', name: 'United States of America' }
console.log(loc.region); // { code: 'US-CA', type: 'State', name: 'California', area: 'West' }
console.log(loc.city); // { name: 'Los Angeles', distance: 10195 }
console.log(loc.description); // Los Angeles, California, United States of America
```

### Listing possible values

```getCountries()```
Lists possible country values

```getRegions(countryCode)```
Lists possible regions within specified country

```getCities(countryCode)```
Lists supported cities within specified country
