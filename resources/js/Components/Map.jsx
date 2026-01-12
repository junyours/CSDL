import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Map({ center = [0, 0], zoom = 10, polygon }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom,
    });

    // Ensure map resizes with container
    const resizeObserver = new ResizeObserver(() => map.current.resize());
    resizeObserver.observe(mapContainer.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!map.current || !polygon) return;

    const m = map.current;

    let normalized = polygon.map((pt) =>
      pt.lat !== undefined && pt.lng !== undefined ? [pt.lng, pt.lat] : pt
    );

    const first = normalized[0];
    const last = normalized[normalized.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      normalized.push(first);
    }

    const drawPolygon = () => {
      if (m.getLayer("polygon-layer")) m.removeLayer("polygon-layer");
      if (m.getSource("polygon-source")) m.removeSource("polygon-source");

      m.addSource("polygon-source", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [normalized] },
        },
      });

      m.addLayer({
        id: "polygon-layer",
        type: "fill",
        source: "polygon-source",
        paint: { "fill-color": "#3b82f6", "fill-opacity": 0.3 },
      });

      const bounds = new mapboxgl.LngLatBounds();
      normalized.forEach((pt) => bounds.extend(pt));

      m.fitBounds(bounds, { padding: 40 });
    };

    if (m.loaded()) drawPolygon();
    else m.once("load", drawPolygon);
  }, [polygon]);

  // Use h-full so map fills parent container height
  return <div ref={mapContainer} className="w-full h-full rounded" />;
}







// import { useEffect, useRef } from "react";
// import mapboxgl from "mapbox-gl";
// import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
// import "mapbox-gl/dist/mapbox-gl.css";
// import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

// export default function Map({ center = [0, 0], zoom = 10, polygon }) {
//     const mapContainer = useRef(null);
//     const map = useRef(null);
//     const markerRef = useRef(null); // to track marker

//     useEffect(() => {
//         mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

//         if (map.current) return;

//         map.current = new mapboxgl.Map({
//             container: mapContainer.current,
//             style: "mapbox://styles/mapbox/streets-v12",
//             center,
//             zoom,
//         });

//         // --- Add Search (Geocoder) ---
//         const geocoder = new MapboxGeocoder({
//             accessToken: mapboxgl.accessToken,
//             mapboxgl: mapboxgl,
//             marker: false, // disable default marker
//             placeholder: "Search for a location...",
//         });

//         map.current.addControl(geocoder, "top-left");

//         // --- Add a marker when a search result is selected ---
//         geocoder.on("result", (event) => {
//             const [lng, lat] = event.result.center;

//             // Remove previous marker if exists
//             if (markerRef.current) {
//                 markerRef.current.remove();
//             }

//             // Add new marker
//             markerRef.current = new mapboxgl.Marker({ color: "red" })
//                 .setLngLat([lng, lat])
//                 .addTo(map.current);

//             // Optional: Recenter map to the search result
//             map.current.flyTo({ center: [lng, lat], zoom: 15 });
//         });
//     }, []);

//     useEffect(() => {
//         if (!map.current || !polygon) return;

//         const m = map.current;

//         let normalized = polygon.map((pt) => {
//             if (pt.lat !== undefined && pt.lng !== undefined) return [pt.lng, pt.lat];
//             return pt;
//         });

//         // Ensure polygon is closed
//         const first = normalized[0];
//         const last = normalized[normalized.length - 1];
//         if (first[0] !== last[0] || first[1] !== last[1]) {
//             normalized.push(first);
//         }

//         const drawPolygon = () => {
//             if (m.getLayer("polygon-layer")) m.removeLayer("polygon-layer");
//             if (m.getSource("polygon-source")) m.removeSource("polygon-source");

//             m.addSource("polygon-source", {
//                 type: "geojson",
//                 data: {
//                     type: "Feature",
//                     geometry: { type: "Polygon", coordinates: [normalized] },
//                 },
//             });

//             m.addLayer({
//                 id: "polygon-layer",
//                 type: "fill",
//                 source: "polygon-source",
//                 paint: { "fill-color": "#3b82f6", "fill-opacity": 0.3 },
//             });

//             const bounds = new mapboxgl.LngLatBounds();
//             normalized.forEach((pt) => bounds.extend(pt));
//             m.fitBounds(bounds, { padding: 40 });
//         };

//         if (m.loaded()) drawPolygon();
//         else m.once("load", drawPolygon);
//     }, [polygon]);

//     return <div ref={mapContainer} className="w-full h-96 rounded" />;
// }
