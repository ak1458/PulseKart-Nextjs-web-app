import { Pill, Baby, Heart, Activity, Sparkles, Zap } from 'lucide-react';

export type SubCategory = {
    id: string;
    name: string;
    slug: string;
    isNew?: boolean;
};

export type MenuCategory = {
    id: string;
    name: string;
    slug: string;
    icon: any;
    columns: {
        title: string;
        items: SubCategory[];
    }[];
    featured?: {
        name: string;
        image: string;
        price: number;
        slug: string;
        inStock: boolean;
    };
};

export const MENU_DATA: MenuCategory[] = [
    {
        id: 'meds',
        name: 'Medicines',
        slug: 'medicines',
        icon: Pill,
        columns: [
            {
                title: 'Popular',
                items: [
                    { id: 'm1', name: 'All Medicines', slug: 'all' },
                    { id: 'm2', name: 'Prescription', slug: 'prescription' },
                    { id: 'm3', name: 'First Aid', slug: 'first-aid' },
                    { id: 'm4', name: 'Pain Relief', slug: 'pain-relief' },
                ]
            },
            {
                title: 'Chronic Care',
                items: [
                    { id: 'c1', name: 'Diabetes', slug: 'diabetes' },
                    { id: 'c2', name: 'Heart Health', slug: 'heart' },
                    { id: 'c3', name: 'Hypertension', slug: 'hypertension' },
                    { id: 'c4', name: 'Thyroid', slug: 'thyroid' },
                ]
            }
        ],
        featured: {
            name: 'Dolo 650mg (15 Tabs)',
            image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
            price: 30,
            slug: 'dolo-650',
            inStock: true
        }
    },
    {
        id: 'personal',
        name: 'Personal Care',
        slug: 'personal-care',
        icon: Sparkles,
        columns: [
            {
                title: 'Skin & Hair',
                items: [
                    { id: 'p1', name: 'Skin Care', slug: 'skin' },
                    { id: 'p2', name: 'Hair Care', slug: 'hair' },
                    { id: 'p3', name: 'Face Wash', slug: 'face-wash' },
                ]
            },
            {
                title: 'Grooming',
                items: [
                    { id: 'g1', name: 'Oral Care', slug: 'oral' },
                    { id: 'g2', name: 'Men\'s Grooming', slug: 'mens' },
                    { id: 'g3', name: 'Feminine Hygiene', slug: 'feminine' },
                ]
            }
        ],
        featured: {
            name: 'Cetaphil Cleanser',
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
            price: 450,
            slug: 'cetaphil',
            inStock: true
        }
    },
    {
        id: 'baby',
        name: 'Baby Care',
        slug: 'baby-care',
        icon: Baby,
        columns: [
            {
                title: 'Essentials',
                items: [
                    { id: 'b1', name: 'Diapers', slug: 'diapers' },
                    { id: 'b2', name: 'Baby Food', slug: 'food' },
                    { id: 'b3', name: 'Skincare', slug: 'baby-skin' },
                ]
            }
        ],
        featured: {
            name: 'Pampers Active (L)',
            image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop',
            price: 399,
            slug: 'pampers',
            inStock: true
        }
    },
    {
        id: 'devices',
        name: 'Health Devices',
        slug: 'devices',
        icon: Activity,
        columns: [
            {
                title: 'Monitors',
                items: [
                    { id: 'd1', name: 'BP Monitors', slug: 'bp' },
                    { id: 'd2', name: 'Glucometers', slug: 'glucometer' },
                    { id: 'd3', name: 'Oximeters', slug: 'oximeter' },
                ]
            }
        ],
        featured: {
            name: 'Omron BP Monitor',
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop',
            price: 1599,
            slug: 'omron-bp',
            inStock: false
        }
    }
];
