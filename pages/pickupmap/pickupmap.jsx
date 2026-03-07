"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
if (typeof window !== "undefined") {
    require("leaflet");
    require("leaflet-routing-machine");
}
// Fix icon Leaflet NextJS
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Routing({ userLocation, pickupLat, pickupLng }) {

    const map = useMap();
    const routingRef = useRef(null);

    useEffect(() => {

        if (!userLocation || !pickupLat || !pickupLng) return;

        import("leaflet-routing-machine").then(() => {

            if (!L.Routing) return;

            // supprimer ancien route
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

                show: false, // 👈 cache texte instructions

                createMarker: () => null,

                lineOptions: {
                    styles: [
                        { color: "#062d83", weight: 10 },
                        { color: "#ffffff", weight: 2 }
                    ]
                }

            }).addTo(map);

        });

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
            <MapContainer center={center} zoom={9} className="w-full h-full">

                <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Pickup */}
                <Marker position={[pickupLat, pickupLng]}>
                    <Popup>{name}</Popup>
                </Marker>

                {/* User */}
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