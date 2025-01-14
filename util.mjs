function isPointInPolygon(point, vs) {
    let x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Polygon calculations based on distance-to-polygon (MIT licence)
// https://www.npmjs.com/package/distance-to-polygon
// Since it has not been updated for 8 years I'm internalising this
// and adjusting to our use instead of adding as a dependency

function distanceBetweenPoints([p1x, p1y], [p2x, p2y]) {
    const distance = Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
    return { distance, point: [p2x, p2y] };
}

function distanceToLine([px, py], [[l1x, l1y], [l2x, l2y]]) {
    const xD = l2x - l1x;
    const yD = l2y - l1y;

    const u = (((px - l1x) * xD) + ((py - l1y) * yD)) / ((xD * xD) + (yD * yD));

    let closestLine;
    if (u < 0) {
        closestLine = [l1x, l1y];
    } else if (u > 1) {
        closestLine = [l2x, l2y];
    } else {
        closestLine = [l1x + (u * xD), l1y + (u * yD)];
    }

    return distanceBetweenPoints([px, py], closestLine);
}

function distanceToPolygon ([px, py], vertices) {
    const comp = vertices.reduce(({ prevPoint, dist }, currPoint) => {
    const currDist = distanceToLine([px, py], [prevPoint, currPoint]);
    const ret = {
        prevPoint: currPoint,
        dist,
    };
    if (currDist.distance < dist.distance) {
        ret.dist = currDist;
    }
    return ret;
    }, { prevPoint: vertices[vertices.length - 1], dist: { distance: Infinity } });
    return comp.dist;
} 

// END distance-to-polygon

// Adapted from https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates

function getDistanceFromLatLonInMetres([lat1, lon1], [lat2, lon2]) {
    const R = 6_371_000; // Radius of the earth in metres
    const deg2rad = deg => deg * Math.PI / 180;
    const dLat = deg2rad(lat2-lat1); 
    const dLon = deg2rad(lon2-lon1); 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
}

// END

export { 
    isPointInPolygon, 
    distanceBetweenPoints, 
    distanceToLine, 
    distanceToPolygon, 
    getDistanceFromLatLonInMetres,
};