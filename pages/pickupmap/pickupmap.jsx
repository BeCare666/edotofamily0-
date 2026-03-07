"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Routing({ userLocation, pickupLat, pickupLng }) {

    const map = useMap();
    const routingRef = useRef(null);

    useEffect(() => {

        if (!userLocation) return;

        let L;

        const load = async () => {

            L = await import("leaflet");
            await import("leaflet-routing-machine");

            if (!L.Routing) return;

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
                createMarker: () => null
            }).addTo(map);

        };

        load();

        return () => {
            if (routingRef.current) {
                map.removeControl(routingRef.current);
            }
        };

    }, [userLocation]);

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
                zoom={14}
                className="w-full h-full"
            >

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[pickupLat, pickupLng]}>
                    <Popup>{name}</Popup>
                </Marker>

                {userLocation && (
                    <>
                        <Marker position={[userLocation.lat, userLocation.lng]}>
                            <Popup>Votre position</Popup>
                        </Marker>

                        <Routing
                            userLocation={userLocation}
                            pickupLat={pickupLat}
                            pickupLng={pickupLng}
                        />
                    </>
                )}

            </MapContainer>
        </div>
    );
}