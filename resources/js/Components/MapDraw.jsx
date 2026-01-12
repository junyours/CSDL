import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function MapDraw({
    initialPoints = [],
    onChange = () => { },
    center = [-73.935242, 40.73061],
    zoom = 12,
}) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const [points, setPoints] = useState(initialPoints || []);

    useEffect(() => {
        if (mapRef.current) return;

        const m = new mapboxgl.Map({
            container: containerRef.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center,
            zoom,
        });

        mapRef.current = m;

        // Add Geocoder (search box)
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl,
            placeholder: "Search location",
        });

        m.addControl(geocoder, "top-left");

        geocoder.on("result", (e) => {
            const { center } = e.result; // [lng, lat]
            m.flyTo({ center, zoom: 16 });
        });

        // add empty sources/layers placeholders
        m.on("load", () => {
            if (!m.getSource("draw-line")) {
                m.addSource("draw-line", { type: "geojson", data: emptyLine() });
            }
            if (!m.getLayer("draw-line")) {
                m.addLayer({
                    id: "draw-line",
                    type: "line",
                    source: "draw-line",
                    paint: { "line-width": 2, "line-opacity": 0.8 },
                });
            }

            if (!m.getSource("draw-fill")) {
                m.addSource("draw-fill", { type: "geojson", data: emptyPolygon() });
            }
            if (!m.getLayer("draw-fill")) {
                m.addLayer({
                    id: "draw-fill",
                    type: "fill",
                    source: "draw-fill",
                    paint: { "fill-color": "#3b82f6", "fill-opacity": 0.25 },
                });
            }
        });

        // click to add point
        m.on("click", (e) => {
            const { lng, lat } = e.lngLat;
            addPoint({ lat, lng });
        });

        const ro = new ResizeObserver(() => m.resize());
        ro.observe(containerRef.current);

        return () => {
            ro.disconnect();
            m.remove();
        };
    }, []);

    useEffect(() => {
        onChange(points);
        updateMapVisuals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [points]);

    function emptyLine() {
        return { type: "Feature", geometry: { type: "LineString", coordinates: [] } };
    }

    function emptyPolygon() {
        return { type: "Feature", geometry: { type: "Polygon", coordinates: [] } };
    }

    function addPoint(pt) {
        setPoints((prev) => [...prev, pt]);
    }

    function undoLast() {
        setPoints((prev) => prev.slice(0, prev.length - 1));
    }

    function clearAll() {
        setPoints([]);
    }

    function finishPolygon() {
        if (points.length < 3) {
            alert("Please add at least 3 points to form a polygon.");
            return;
        }
        updateMapVisuals(true);
        fitToPoints(points);
    }

    function fitToPoints(pts) {
        const m = mapRef.current;
        if (!m || pts.length === 0) return;
        const bounds = new mapboxgl.LngLatBounds();
        pts.forEach((p) => bounds.extend([p.lng, p.lat]));
        m.fitBounds(bounds, { padding: 40, maxZoom: 16, duration: 500 });
    }

    function updateMapVisuals(closePolygon = false) {
        const m = mapRef.current;
        if (!m || !m.getSource) return;

        const coordsLine = points.map((p) => [p.lng, p.lat]);
        const lineSource = m.getSource("draw-line");
        if (lineSource) {
            lineSource.setData({
                type: "Feature",
                geometry: { type: "LineString", coordinates: coordsLine },
            });
        }

        const polygonCoords = coordsLine.length
            ? closePolygon
                ? [...coordsLine, coordsLine[0]]
                : coordsLine
            : [];
        const fillSource = m.getSource("draw-fill");
        if (fillSource) {
            if (polygonCoords.length >= 3) {
                fillSource.setData({
                    type: "Feature",
                    geometry: { type: "Polygon", coordinates: [polygonCoords] },
                });
            } else {
                fillSource.setData(emptyPolygon());
            }
        }

        markersRef.current.forEach((mk) => mk.remove());
        markersRef.current = [];

        points.forEach((pt, idx) => {
            const el = document.createElement("div");
            el.className = "w-3 h-3 rounded-full border-2 border-white shadow";
            el.style.background = "#2563eb";
            el.style.width = "10px";
            el.style.height = "10px";
            el.title = `Point #${idx + 1}`;

            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([pt.lng, pt.lat])
                .addTo(m);
            markersRef.current.push(marker);
        });
    }

    return (
        <div className="relative">
            <div ref={containerRef} className="w-full h-72 rounded" />
            <div className="p-2 flex gap-2 items-center border-t">
                <div className="text-sm text-gray-600">Click on the map to add polygon points.</div>

                <div className="ml-auto flex gap-2">
                    <button type="button" onClick={undoLast} className="px-2 py-1 rounded border text-sm" disabled={points.length === 0}>Undo</button>
                    <button type="button" onClick={clearAll} className="px-2 py-1 rounded border text-sm" disabled={points.length === 0}>Clear</button>
                    <button type="button" onClick={finishPolygon} className="px-2 py-1 rounded bg-blue-600 text-white text-sm" disabled={points.length < 3}>Finish</button>
                </div>
            </div>
        </div>
    );
}
