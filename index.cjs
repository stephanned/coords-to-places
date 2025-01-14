const { readFileSync } = require('fs');
const { distanceBetweenPoints, distanceToPolygon, isPointInPolygon, getDistanceFromLatLonInMetres } = require('./util.cjs');

const sources = {};

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

function getSubdivision(latitude, longitude, countryIsoCode) {
    if (!sources.provinces) preload({ country: false, sub: true, towns: false });
    const res = closest(sources.provinces[countryIsoCode], { latitude, longitude });
    return {
        type: res.type,
        name: res.name,
        region: res.region,
        iso_3166_2: res.key,
    }
}

function getClosestTown(latitude, longitude, countryIsoCode, limitInMetres = 50_000) {
    if (!sources.towns) preload({ country: false, sub: false, towns: true });
    const res = closest(sources.towns[countryIsoCode], { latitude, longitude }, limitInMetres);
    if (!res) return null;
    return { name: res.name, distance: res.distance };
}

function getCountry(latitude, longitude) {
    if (!sources.countries) preload({ country: true, sub: false, towns: false });
    const res = closest(sources.countries, { latitude, longitude });
    return { iso: res.key, name: res.name };
}

function getLocality(latitude, longitude, { sub = true, town = true } = {}) {
    const country = getCountry(latitude, longitude);
    const out = {
        country,
        description: country.name,
    };
    if (sub) {
        out.sub = getSubdivision(latitude, longitude, country.iso);
        out.description = out.sub.name + ', ' + country.name;
    }
    if (town) {
        const town = getClosestTown(latitude, longitude, country.iso);
        if (town) {
            out.town = town;
            if (['State', 'Province'].includes(out.sub?.type)) {
                out.description = out.town.name + ', ' + out.sub.name + ', ' + country.name;
            } else {
                out.description = out.town.name + ', ' + country.name;
            }
        }
    }
    return out;
}

function getCountries() {
    if (!sources.countries) preload({ country: true, sub: false, towns: false });
    return Object.keys(sources.countries).reduce((keep, x) => { keep[x] = sources.countries[x].name; return keep; }, {});
}

function getSubdivisions(countryCode) {
    if (!sources.provinces) preload({ country: false, sub: true, towns: false });
    if (!sources.provinces[countryCode]) return null;
    return Object.keys(sources.provinces[countryCode]).map(k => sources.provinces[countryCode][k].name);
}

function getTowns(countryCode) {
    if (!sources.towns) preload({ country: false, sub: false, towns: true });
    if (!sources.towns[countryCode]) return null;
    return Object.keys(sources.towns[countryCode]).map(k => sources.towns[countryCode][k].name);
}

function preload({ country = true, sub = true, town = true } = {}) {
    sources.countries = JSON.parse(readFileSync(__dirname + '/data/countries.json'));
    sources.provinces = JSON.parse(readFileSync(__dirname + '/data/provinces.json'));
    sources.towns = JSON.parse(readFileSync(__dirname + '/data/towns.json'));
}

module.exports = { 
    preload,
    getClosestTown, getSubdivision, getCountry, getLocality,
    getTowns, getSubdivisions, getCountries,
};
