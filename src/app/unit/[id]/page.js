"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "@/lib/products";

// Helper to create slug
const slugify = (text) => {
  if (!text) return 'item';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export default function ProductRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    async function redirectToNewUrl() {
      const { data } = await getProductById(params.id);
      if (data) {
        const category = slugify(data.category || 'item');
        const brand = slugify(data.brand || 'brand');
        const name = slugify(data.name || 'product');
        const sku = data.sku || data.id.slice(-6);
        router.replace(`/catalog/${category}/${brand}/${name}-${sku}?pid=${data.id}`);
      } else {
        router.replace('/catalog');
      }
    }
    
    if (params.id) {
      redirectToNewUrl();
    }
  }, [params.id, router]);

  return (
    <div style={{
      width: '100%',
      height: '100svh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--base-100)',
    }}>
      <p style={{
        fontFamily: 'var(--font-dm-mono), monospace',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        color: 'var(--base-500)',
      }}>
        Redirecting...
      </p>
    </div>
  );
}
