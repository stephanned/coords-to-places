#!/usr/bin/env node

import shp from 'shapefile';
import fs from 'fs';

// https://www.naturalearthdata.com/downloads/10m-cultural-vectors/
// Download: Admin 0 - Countries => data/countries
// Download: Admin 1 - States, Provinces => data/provinces
// Download: Populated Places => data/populated

async function populateCountries() {
    const source = await shp.open(import.meta.dirname + '/data/countries/ne_10m_admin_0_countries.shp', undefined, { 
        encoding: 'utf8' 
    });
    if (!source) {
        throw new Error("You need to download source files first -- check README");
    }
    let result;

    const countries = {};
    while (result = await source.read()) {
        if (!result.value) break;
        const f = JSON.parse(JSON.stringify(result.value)?.replace(/\\x00/g,'')?.replace(/\\u0000/g,''));
        console.log(f.properties.ADM0_A3, f.properties.NAME_LONG); // Unique
        if (countries[f.properties.ADM0_A3]) {
            const c = countries[f.properties.ADM0_A3];
            if (f.properties.TYPE === 'Country') { // Use name of country, not dependencies
                c.name = f.properties.NAME_EN;
            }
            if (f.geometry.type === 'Polygon') c.geometry.coordinates.push(f.geometry.coordinates);
            else if (f.geometry.type === 'MultiPolygon') c.geometry.coordinates = [ ...c.geometry.coordinates, ...f.geometry.coordinates ];
        } else {
            if (f.geometry.type === 'Polygon') {
                // Easier if we standardise on this
                f.geometry.type = 'MultiPolygon';
                f.geometry.coordinates = [ f.geometry.coordinates ];
            }
            countries[f.properties.ADM0_A3] = {
                iso: f.properties.ISO_A2_EH,
                name: f.properties.NAME_EN,
                geometry: f.geometry,
            }
        }
    }
    fs.writeFileSync(import.meta.dirname + '/data/countries.json', JSON.stringify(countries));
}

async function populateProvinces() {
    const source = await shp.open(import.meta.dirname + '/data/provinces/ne_10m_admin_1_states_provinces.shp', undefined, { 
        encoding: 'utf8' 
    });
    if (!source) {
        throw new Error("You need to download source files first -- check README");
    }

    const provinces = {};
    let result;
    while (result = await source.read()) {
        if (!result.value) break;
        const f = JSON.parse(JSON.stringify(result.value)?.replace(/\\x00/g,'')?.replace(/\\u0000/g,''));
        
        if (!provinces[f.properties.adm0_a3]) {
            provinces[f.properties.adm0_a3] = {};
        }
        provinces[f.properties.adm0_a3][f.properties.iso_3166_2] = {
            name: f.properties.name_en,
            country: f.properties.iso_a2,
            region: f.properties.region,
            type: f.properties.type_en ?? f.properties.type,
            geometry: f.geometry,
        };
    }

    for (const adm0_a3 in provinces) {
        fs.writeFileSync(import.meta.dirname + '/data/provinces-' + adm0_a3 + '.json', JSON.stringify(provinces[adm0_a3]));
    }
}

async function populateTowns() {
    const source = await shp.open(import.meta.dirname + '/data/populated/ne_10m_populated_places.shp', undefined, { 
        encoding: 'utf8' 
    });
    if (!source) {
        throw new Error("You need to download source files first -- check README");
    }

    const towns = {};
    let result;
    while (result = await source.read()) {
        if (!result.value) break;
        const f = JSON.parse(JSON.stringify(result.value)?.replace(/\\x00/g,'')?.replace(/\\u0000/g,''));
        if (!towns[f.properties.ADM0_A3]) {
            towns[f.properties.ADM0_A3] = {};
        }
        towns[f.properties.ADM0_A3][f.properties.NAME_EN] = {
            name: f.properties.NAME_EN,
            geometry: f.geometry,
        }
    }
    fs.writeFileSync(import.meta.dirname + '/data/towns.json', JSON.stringify(towns));
}

console.log('Creating countries file');
await populateCountries();

console.log('Creating provinces file');
await populateProvinces();

console.log('Creating towns file');
await populateTowns();