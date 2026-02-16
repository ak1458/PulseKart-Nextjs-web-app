import { Pill, Activity, Sparkles, IconBabyCare } from '@/lib/icons';

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
        // featured: fetched from backend when available
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
        // featured: fetched from backend when available
    },
    {
        id: 'baby',
        name: 'Baby Care',
        slug: 'baby-care',
        icon: IconBabyCare,
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
        // featured: fetched from backend when available
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
        // featured: fetched from backend when available
    }
];
