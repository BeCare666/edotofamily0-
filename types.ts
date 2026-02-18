export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    badge?: string;
    longDescription?: string; // Added for detail view
    ingredients?: string[]; // Added for detail view
}

export interface ServiceItem {
    id: number;
    title: string;
    description: string;
    iconName: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Notification {
    message: string;
    type: 'success' | 'error' | 'info';
}

export enum ViewState {
    HOME = 'HOME',
    SHOP = 'SHOP',
    CENTERS = 'CENTERS',
    CAMPAIGNS = 'CAMPAIGNS',
    LOGIN = 'LOGIN',
    REGISTER = 'REGISTER',
    PRODUCT_DETAIL = 'PRODUCT_DETAIL',
    ORDER_DETAIL = 'ORDER_DETAIL',
    ABOUT = 'ABOUT',
    CART = 'CART',
    DASHBOARD = 'DASHBOARD',
    SETTINGS = 'SETTINGS',
    NOTIFICATIONS = 'NOTIFICATIONS',
    ORDER_HISTORY = 'ORDER_HISTORY',
    CENTER_DETAIL = 'CENTER_DETAIL',
    FAQ = 'FAQ',
    LEGAL = 'LEGAL',
    SERVICES = 'SERVICES',
    CONTACT = 'CONTACT',
    MISSION = 'MISSION',
    OBJECTIVES = 'OBJECTIVES',
    TERMS = 'TERMS',
    PRIVACY = 'PRIVACY'

}

export interface Campaign {
    id: number;
    title: string;
    description: string;
    image_url: string;
    location: string;
    date_start: string;
    date_end: string | null;
    status: "a_venir" | "planifie" | "en_cours";
    objective_kits: number;
    distributed_kits: number;
}
