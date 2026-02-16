import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { serverApiUrl } from '@/lib/api';

async function getProduct(id: string) {
    try {
        const res = await fetch(serverApiUrl(`products/${id}`), { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        return null;
    }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    return <ProductDetailClient product={product} />;
}
