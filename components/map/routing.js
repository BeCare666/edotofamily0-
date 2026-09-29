import { ROUTING_URLS } from "./mapConfig";
import { cumulativeDistances, projectOnLine } from "./geo";

const SIDE = {
    left: "à gauche",
    right: "à droite",
    "slight left": "légèrement à gauche",
    "slight right": "légèrement à droite",
    "sharp left": "franchement à gauche",
    "sharp right": "franchement à droite",
    straight: "tout droit",
    uturn: "demi-tour",
};

const ordinal = (n) => (n === 1 ? "1re" : `${n}e`);
const onRoad = (name) => (name ? ` sur ${name}` : "");

// Instruction en français à partir d'une manœuvre OSRM (les noms de rue sont souvent absents)
export function instructionFr(step) {
    const { type, modifier, exit } = step.maneuver;
    const name = step.name || "";
    const side = SIDE[modifier] || "";

    switch (type) {
        case "depart":
            return `Partez${onRoad(name)}`;
        case "arrive":
            return "Vous êtes arrivé à destination";
        case "roundabout":
        case "rotary":
            return exit ? `Au rond-point, prenez la ${ordinal(exit)} sortie${onRoad(name)}` : `Traversez le rond-point${onRoad(name)}`;
        case "roundabout turn":
            return `Au rond-point, tournez ${side}${onRoad(name)}`;
        case "exit roundabout":
        case "exit rotary":
            return `Sortez du rond-point${onRoad(name)}`;
        case "end of road":
            return `Au bout de la route, tournez ${side}${onRoad(name)}`;
        case "fork":
            return `À l'embranchement, restez ${side}${onRoad(name)}`;
        case "merge":
            return `Insérez-vous ${side}${onRoad(name)}`;
        case "on ramp":
            return `Prenez la bretelle ${side}${onRoad(name)}`;
        case "off ramp":
            return `Prenez la sortie ${side}${onRoad(name)}`;
        case "new name":
        case "continue":
        case "notification":
            if (modifier === "uturn") return `Faites demi-tour${onRoad(name)}`;
            if (!modifier || modifier === "straight") return `Continuez tout droit${onRoad(name)}`;
            return `Continuez ${side}${onRoad(name)}`;
        case "turn":
        default:
            if (modifier === "uturn") return `Faites demi-tour${onRoad(name)}`;
            if (modifier === "straight") return `Continuez tout droit${onRoad(name)}`;
            return `Tournez ${side}${onRoad(name)}`;
    }
}

// Clé d'icône de manœuvre (utilisée par l'interface)
export function maneuverIcon(step) {
    const { type, modifier } = step.maneuver;
    if (type === "arrive") return "arrive";
    if (type === "depart") return "depart";
    if (type === "roundabout" || type === "rotary" || type === "roundabout turn") return "roundabout";
    if (modifier === "uturn") return "uturn";
    if (modifier === "left" || modifier === "sharp left") return "left";
    if (modifier === "right" || modifier === "sharp right") return "right";
    if (modifier === "slight left") return "slight-left";
    if (modifier === "slight right") return "slight-right";
    return "straight";
}

/**
 * Itinéraire OSRM entre deux points [lng, lat].
 * Renvoie le tracé, la distance (m), la durée (s) et les étapes positionnées sur le tracé.
 */
export async function fetchRoute(from, to, mode = "car", signal) {
    const base = ROUTING_URLS[mode] || ROUTING_URLS.car;
    const url = `${base}/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`routing ${res.status}`);
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) {
        const err = new Error(data.code || "NoRoute");
        err.code = data.code;
        throw err;
    }
    const route = data.routes[0];
    const coords = route.geometry.coordinates;
    const cum = cumulativeDistances(coords);
    const steps = route.legs[0].steps.map((st) => ({
        instruction: instructionFr(st),
        icon: maneuverIcon(st),
        // position de la manœuvre le long du tracé (m)
        along: projectOnLine(st.maneuver.location, coords, cum).along,
    }));
    return { coords, cum, distance: route.distance, duration: route.duration, steps };
}
