"use client";

import { useEffect, useState, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* FIX ICONS */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

/* ROUTING */

function Routing({ userLocation, pickupLat, pickupLng, routingReady }) {
    const map = useMap();
    const routingRef = useRef(null);

    useEffect(() => {
        if (!userLocation || !routingReady) return;

        if (routingRef.current) {
            map.removeControl(routingRef.current);
        }

        routingRef.current = L.Routing.control({
            waypoints: [
                L.latLng(userLocation.lat, userLocation.lng),
                L.latLng(pickupLat, pickupLng)
            ],
            addWaypoints: false,
            draggableWaypoints: false,
            routeWhileDragging: false,
            show: false,
            lineOptions: {
                styles: [{ color: "#2563eb", weight: 6 }]
            },
            createMarker: () => null
        }).addTo(map);

        return () => {
            if (routingRef.current) {
                map.removeControl(routingRef.current);
            }
        };
    }, [userLocation, pickupLat, pickupLng, routingReady]);

    return null;
}

/* FOLLOW USER (SMOOTH) */

function FollowUser({ userLocation }) {
    const map = useMap();
    const lastPos = useRef(null);

    useEffect(() => {
        if (!userLocation) return;

        // éviter micro-mouvements inutiles
        if (
            lastPos.current &&
            Math.abs(lastPos.current.lat - userLocation.lat) < 0.00005 &&
            Math.abs(lastPos.current.lng - userLocation.lng) < 0.00005
        ) {
            return;
        }

        lastPos.current = userLocation;

        map.flyTo([userLocation.lat, userLocation.lng], map.getZoom(), {
            duration: 0.5
        });
    }, [userLocation]);

    return null;
}

/* MAIN */

export default function PickupMap({ pickupLat, pickupLng, name }) {
    const [userLocation, setUserLocation] = useState(null);
    const [routingReady, setRoutingReady] = useState(false);
    const [error, setError] = useState(null);

    /* LOAD ROUTING AVANT AFFICHAGE */

    useEffect(() => {
        const loadRouting = async () => {
            await import("leaflet-routing-machine");
            setRoutingReady(true);
        };
        loadRouting();
    }, []);

    /* GPS */

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("GPS non supporté");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            },
            (err) => {
                console.error(err);
                setError("Permission GPS refusée");
            },
            { enableHighAccuracy: true }
        );

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            },
            (err) => {
                console.error(err);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 10000
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    /* 🚨 BLOQUER RENDU JUSQU’À PRÊT */

    if (!userLocation || !routingReady) {
        return (
            <div className="w-full h-[90vh] flex items-center justify-center">
                <p className="text-slate-500 text-sm">
                    Chargement de la carte...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-[90vh] flex items-center justify-center">
                <p className="text-red-500 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[90vh]">
            <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={15}
                className="w-full h-full"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* DESTINATION */}
                <Marker position={[pickupLat, pickupLng]}>
                    <Popup>{name}</Popup>
                </Marker>

                {/* USER */}
                <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>Votre position</Popup>
                </Marker>

                <FollowUser userLocation={userLocation} />

                <Routing
                    userLocation={userLocation}
                    pickupLat={pickupLat}
                    pickupLng={pickupLng}
                    routingReady={routingReady}
                />
            </MapContainer>
        </div>
    );
}