import { getLocation, getLocality, getClosestTown, getCountry, getSubdivision, getCountries, getSubdivisions, getTowns, getRegions, getCities } from "./index.mjs";

function test(latitude, longitude, label) {
    console.log('===', label, latitude, longitude, '=====================');
    const loc = getLocation(latitude, longitude);
    console.log(loc.country);
    console.log(loc.region);
    console.log(loc.city);
    console.log(loc.description);
}

test(62.47443195625144, 6.16630198580203, 'AES');
test(51.4802541443703, 0.1279851016952123, 'LON-BEX');
test(54.600023236111475, -5.941054394357429, 'Belfast');
test(34.004102321407224, -118.32115422221612, 'LAX');
test(69.41135102728866, 30.214202194253986, 'Nikel, RU');
test(52.357218593951735, 18.912365256575775, 'PL');
test(51.74234227115255, 19.623127584464097, 'Lodz, PL');
test(52.53404891669058, 13.420030397890093, 'Berlin');
test(50.08769854813982, 8.899509311747483, 'Frankfurt');
test(51.19732767883081, 4.603331730987073, 'Antwerp');
test(47.39601070726061, 1.0026189010893725, 'Tours');
test(48.86329762499202, 2.6066747675759934, 'Paris');
test(46.55669482809742, 7.056057932290269, 'Outside Lausanne');
test(46.55669482809742, 7.056057932290269, 'Outside Lausanne');
test(47.14091567345621, 9.531886727558517, 'Vadus LT');
test(47.26837973710038, 11.408885363748714, 'Innsbruck AT');
test(40.85986051499665, 14.163784668074104, 'Naples IT');
test(9.062098726434424, 7.488200343683042, 'Abuja NG');
test(6.659353789986813, -1.6124345164291216, 'Kumasi GH');
test(35.53085448616114, 34.208371686248476, 'Northern Cyprus');

console.log(getLocality(9.062098726434424, 7.488200343683042, 'Abuja NG'));
console.log(getCountry(9.062098726434424, 7.488200343683042, 'Abuja NG'));
console.log(getSubdivision(9.062098726434424, 7.488200343683042, 'Abuja NG'));
console.log(getClosestTown(9.062098726434424, 7.488200343683042, 'Abuja NG'));
