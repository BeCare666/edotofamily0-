"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

let L; // Lazy load Leaflet

function Routing({ userLocation, pickupLat, pickupLng }) {

    const map = useMap();
    const routingRef = useRef(null);

    useEffect(() => {

        if (typeof window === "undefined") return;
        if (!userLocation) return;

        const loadRouting = async () => {

            if (!L) {
                L = await import("leaflet");
                await import("leaflet-routing-machine");
            }

            if (!L.Routing) return;

            if (routingRef.current) {
                map.removeControl(routingRef.current);
            }

            routingRef.current = L.Routing.control({
                waypoints: [
                    L.latLng(userLocation.lat, userLocation.lng),
                    L.latLng(pickupLat, pickupLng),
                ],
                addWaypoints: false,
                draggableWaypoints: false,
                routeWhileDragging: false,
                show: false,
                createMarker: () => null,

                lineOptions: {
                    styles: [
                        { color: "#062d83", weight: 8 },
                        { color: "#ffffff", weight: 3 }
                    ]
                }

            }).addTo(map);
        };

        loadRouting();

        return () => {
            if (routingRef.current) {
                map.removeControl(routingRef.current);
            }
        };

    }, [userLocation, pickupLat, pickupLng]);

    return null;
}

export default function PickupMap({ pickupLat, pickupLng, name }) {

    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {

        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            },
            console.log,
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);

    }, []);

    const center = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [pickupLat, pickupLng];

    return (
        <div className="w-full h-[90vh]">
            <MapContainer
                center={center}
                zoom={9}
                className="w-full h-full"
                scrollWheelZoom
            >

                <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[pickupLat, pickupLng]}>
                    <Popup>{name}</Popup>
                </Marker>

                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]}>
                        <Popup>Votre position</Popup>
                    </Marker>
                )}

                {userLocation && (
                    <Routing
                        userLocation={userLocation}
                        pickupLat={pickupLat}
                        pickupLng={pickupLng}
                    />
                )}

            </MapContainer>
        </div>
    );
}