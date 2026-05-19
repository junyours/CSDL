import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Map({
    center = [0, 0],
    zoom = 10,
    polygon,
    theme = "dark", // 👈 NEW
}) {
    const mapContainer = useRef(null);
    const map = useRef(null);

    const getMapStyle = () => {
        return theme === "dark"
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/streets-v12";
    };

    // INIT MAP
    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

        if (map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: getMapStyle(),
            center,
            zoom,
        });

        // Resize observer
        const resizeObserver = new ResizeObserver(() => {
            map.current?.resize();
        });

        resizeObserver.observe(mapContainer.current);

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!map.current) return;

        const m = map.current;

        // change style dynamically
        m.setStyle(getMapStyle());

        m.once("style.load", () => {
            if (polygon) drawPolygon(m, polygon);
        });
    }, [theme]);

    // DRAW POLYGON FUNCTION (reusable)
    const drawPolygon = (m, polygonData) => {
        let normalized = polygonData.map((pt) =>
            pt.lat !== undefined && pt.lng !== undefined
                ? [pt.lng, pt.lat]
                : pt
        );

        const first = normalized[0];
        const last = normalized[normalized.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
            normalized.push(first);
        }

        if (m.getLayer("polygon-layer")) m.removeLayer("polygon-layer");
        if (m.getSource("polygon-source")) m.removeSource("polygon-source");

        m.addSource("polygon-source", {
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [normalized],
                },
            },
        });

        m.addLayer({
            id: "polygon-layer",
            type: "fill",
            source: "polygon-source",
            paint: {
                "fill-color": "#1677ff", // Ant Design primary
                "fill-opacity": 0.3,
            },
        });

        const bounds = new mapboxgl.LngLatBounds();
        normalized.forEach((pt) => bounds.extend(pt));

        m.fitBounds(bounds, { padding: 40 });
    };

    // POLYGON EFFECT
    useEffect(() => {
        if (!map.current || !polygon) return;

        const m = map.current;

        if (m.isStyleLoaded()) {
            drawPolygon(m, polygon);
        } else {
            m.once("load", () => drawPolygon(m, polygon));
        }
    }, [polygon]);

    return (
        <div
            ref={mapContainer}
            style={{
                width: "100%",
                height: "100%",
                borderRadius: 8,
                overflow: "hidden",
            }}
        />
    );
}