"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* FIX icones Leaflet avec Next */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ROUTING */

function Routing({ userLocation, pickupLat, pickupLng }) {

    const map = useMap();
    const routingRef = useRef(null);

    useEffect(() => {

        if (!userLocation) return;

        let isMounted = true;

        const loadRouting = async () => {

            const leaflet = await import("leaflet");
            await import("leaflet-routing-machine");

            if (!leaflet.Routing || !isMounted) return;

            if (routingRef.current) {
                map.removeControl(routingRef.current);
            }

            routingRef.current = leaflet.Routing.control({
                waypoints: [
                    leaflet.latLng(userLocation.lat, userLocation.lng),
                    leaflet.latLng(pickupLat, pickupLng)
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

        };

        loadRouting();

        return () => {
            isMounted = false;
            if (routingRef.current) {
                map.removeControl(routingRef.current);
            }
        };

    }, [userLocation, pickupLat, pickupLng]);

    return null;
}


/* SUIVI DE POSITION */

function FollowUser({ userLocation }) {

    const map = useMap();

    useEffect(() => {

        if (!userLocation) return;

        map.setView(
            [userLocation.lat, userLocation.lng],
            map.getZoom(),
            { animate: true }
        );

    }, [userLocation]);

    return null;
}


/* COMPOSANT PRINCIPAL */

export default function PickupMap({ pickupLat, pickupLng, name }) {

    const [userLocation, setUserLocation] = useState(null);

    /* PRELOAD routing pour éviter le délai */
    useEffect(() => {
        const preload = async () => {
            await import("leaflet");
            await import("leaflet-routing-machine");
        };
        preload();
    }, []);

    /* GPS */

    useEffect(() => {

        if (!navigator.geolocation) return;

        // position rapide
        navigator.geolocation.getCurrentPosition((pos) => {
            setUserLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            });
        });

        // suivi en temps réel
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
                zoom={15}
                className="w-full h-full"
            >

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* destination */}
                <Marker position={[pickupLat, pickupLng]}>
                    <Popup>{name}</Popup>
                </Marker>

                {userLocation && (
                    <>
                        {/* position utilisateur */}
                        <Marker position={[userLocation.lat, userLocation.lng]}>
                            <Popup>Votre position</Popup>
                        </Marker>

                        <FollowUser userLocation={userLocation} />

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