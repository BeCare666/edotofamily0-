"use client";

import { MapPin, X } from "lucide-react";
import dynamic from "next/dynamic";

const PickupMap = dynamic(
    () => import("./pickupmap"),
    { ssr: false }
);
export default function PickupMapModal({
    open,
    onClose,
    pickupLat,
    pickupLng,
    name
}) {

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-white">

            {/* header */}
            <div className="flex justify-between items-center p-4 border-b ">
                <h2 className="font-semibold">
                    Navigation vers {name}
                </h2>

                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100"
                >
                    <X size={22} />
                </button>
            </div>

            {/* map */}
            <div className="w-full h-[calc(100vh-60px)]">
                <PickupMap
                    pickupLat={pickupLat}
                    pickupLng={pickupLng}
                    name={name}
                />
            </div>

        </div>
    );
}