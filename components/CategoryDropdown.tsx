"use client";

import { useState } from "react";
import Image from "next/image";

const categories = [
    {
        id: 1,
        name: "Fertilité",
        slug: "fertilite",
        icon: "https://img.icons8.com/fluency/48/product.png",
    },
    {
        id: 2,
        name: "Grossesse",
        slug: "grossesse",
        icon: "https://img.icons8.com/?size=48&id=s3Jrlqy6yqSl&format=png",
    },
    {
        id: 3,
        name: "Intimité",
        slug: "intimite",
        icon: "https://img.icons8.com/fluency/48/car.png",
    },
    {
        id: 4,
        name: "Soins",
        slug: "soins",
        icon: "https://img.icons8.com/fluency/48/coal.png",
    },
    {
        id: 5,
        name: "Bien-être",
        slug: "bien-etre",
        icon: "https://img.icons8.com/fluency/48/factory.png",
    },
];

export default function CategoryDropdown() {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative inline-block text-left">
            {/* Bouton */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition"
            >
                Boutique
                <span className="text-sm">{open ? "▲" : "▼"}</span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute mt-2 w-56 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 z-50">
                    <ul className="divide-y divide-gray-100">
                        {categories.map((cat) => (
                            <li
                                key={cat.id}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
                            >
                                <Image
                                    src={cat.icon}
                                    alt={cat.name}
                                    width={24}
                                    height={24}
                                />
                                <span className="text-gray-700 font-medium">{cat.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
