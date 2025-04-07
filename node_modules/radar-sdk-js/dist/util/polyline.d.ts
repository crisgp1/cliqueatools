/**
 * https://github.com/mapbox/polyline
 *
 * Decodes to a [longitude, latitude] coordinates array.
 *
 * This is adapted from the implementation in Project-OSRM.
 *
 * see https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
 *
 */
export declare const decodePolyline: (str: string, precision?: number) => number[][];
