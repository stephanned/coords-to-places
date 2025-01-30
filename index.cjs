const { readFileSync } = require('fs');
const { distanceBetweenPoints, distanceToPolygon, isPointInPolygon, getDistanceFromLatLonInMetres } = require('./util.cjs');

const sources = { countries: null, provinces: {}, towns: null };

function loadJSON(filename) {
    return JSON.parse(readFileSync(import.meta.dirname + '/data/' + filename));
}
function loadProvinces(countryCode) {
    if (sources.provinces[countryCode]) return;
    sources.provinces[countryCode] = loadJSON('provinces-' + countryCode + '.json');
}
function loadCountries() {
    if (sources.countries) return;
    sources.countries = loadJSON('countries.json');
}
function loadTowns() {
    if (sources.towns) return;
    sources.towns = loadJSON('towns.json');
}

function closest(data, { latitude, longitude }, limit = null) {
    let minDistance = { distance: Infinity };
    let curr = null;
    for (const key in data) {
        const geometry = data[key].geometry;
        if (geometry.type === 'Point') {
            let distance = distanceBetweenPoints([ longitude, latitude ], geometry.coordinates);
            if (distance.distance < minDistance.distance) {
              minDistance = distance;
              curr = key;
            }
            continue;
        }
        let vertices;
        if (geometry.type === 'MultiPolygon') {
            vertices = geometry.coordinates;
        } else if (geometry.type === 'Polygon') {
            vertices = [ geometry.coordinates ];
        } else {
            throw new Error("Unsupported geometry type: " + geometry.type);
        }
        for (const vx of vertices) {
            for (const v of vx) {
                if (isPointInPolygon([ longitude, latitude ], v)) {
                    return { ...data[key], key, distance: 0 };
                }
                let dist = distanceToPolygon([ longitude, latitude ], v);
                if (dist.distance < minDistance.distance) {
                    minDistance = dist;
                    curr = key;
                }
            }
        }
    }
    if (!curr) return null;
    const distance = Math.floor(getDistanceFromLatLonInMetres(minDistance.point, [ longitude, latitude ]));
    if (limit && distance > limit) return null;
    return { ...data[curr], key: curr, distance };
}


function getCountries() {
    loadCountries();
    return Object.keys(sources.countries).reduce((keep, x) => { 
        const res = sources.countries[x]; 
        keep.push({ code: x, iso: res.iso, name: res.name }); 
        return keep; 
    }, []);
}

function convertCountryCode(countryCode) {
    if (countryCode?.length !== 2) return countryCode;
    loadCountries();
    for (const key in sources.countries) {
        if (sources.countries[key].iso === countryCode) {
            return key;
        }
    }
    return countryCode;
}

function getRegions(countryCode) {
    countryCode = convertCountryCode(countryCode);
    try {
        loadProvinces(countryCode);
    } catch {
        throw new Error(`Invalid country code: "${countryCode}"`);
    }
    if (!sources.provinces[countryCode]) return [];
    return Object.keys(sources.provinces[countryCode]).map(k => {
        const res = sources.provinces[countryCode][k];
        return {
            code: k,
            type: res.type,
            name: res.name,
            area: res.region,
        }
    });
}

function getCities(countryCode, withLocation = false) {
    countryCode = convertCountryCode(countryCode);
    loadTowns();
    if (!sources.towns[countryCode]) return [];
    return Object.keys(sources.towns[countryCode]).map(k => {
        const res = sources.towns[countryCode][k];
        return { 
            name: res.name,
            distance: res.distance,
            latitude: res.geometry.coordinates[1],
            longitude: res.geometry.coordinates[0],
        };
        // name: sources.towns[countryCode][k].name,
        // lon: sources.towns[countryCode][k].geometry.coordinates[0],
        // lat: sources.towns[countryCode][k].geometry.coordinates[1],
    });
}

function getLocation(latitude, longitude) {
    const loc = { latitude, longitude };
    let _country;
    let _region;
    let _city;
    Object.defineProperties(loc, {
        country: {
            get() {
                if (_country !== undefined) return _country;
                loadCountries();
                const res = closest(sources.countries, { latitude, longitude });
                if (!res) { _country = null; return null; }
                if (res.iso === '-99') res.iso = '??';
                _country = { code: res.key, iso: res.iso, name: res.name };
                return _country;
            }
        },
        region: {
            get() {
                if (_region !== undefined) return _region;
                const country = loc.country;
                loadProvinces(country.code);
                const res = closest(sources.provinces[country.code], { latitude, longitude });
                if (!res) {
                    _region = null;
                    return _region;
                }
                _region = {
                    code: res.key, // ISO-3166-2
                    type: res.type,
                    name: res.name,
                    area: res.region,
                };
                return _region;
            }
        },
        city: {
            get() {
                if (_city !== undefined) return _city;
                const country = loc.country;
                loadTowns(country.code);
                const res = closest(sources.towns[country.code], { latitude, longitude }, 50_000);
                if (!res) { _city = null; return null; }
                _city = { 
                    name: res.name,
                    distance: res.distance,
                    latitude: res.geometry.coordinates[1],
                    longitude: res.geometry.coordinates[0],
                };
                return _city;
            }
        },
        description: {
            get() {
                const c = loc.country;
                const r = loc.region;
                const t = loc.city;
                if (!t?.name) {
                    return `${r.name}, ${c.name}`;
                }
                const isState = r.type === 'State' || c.code === 'CA';

                if (isState) {
                    return `${t.name}, ${r.name}, ${c.name}`;
                }
                // if (r.area?.length) {
                //     return `${t.name}, ${r.area}, ${c.name}`;
                // }
                return `${t.name}, ${c.name}`;
            }
        }
    });
    return loc;
}

module.exports = { 
    getLocation,
    getCities, getRegions, getCountries,
    getDistanceFromLatLonInMetres,
};