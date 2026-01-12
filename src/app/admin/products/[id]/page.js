"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import ProductForm from "@/components/Admin/ProductForm";

// Demo product for when Supabase is not configured
const demoProduct = {
  id: "1",
  name: "Chrome Hearts Hoodie",
  brand: "Chrome Hearts",
  price: 1250,
  category: "Clothing",
  subcategory: "Hoodies",
  sizes: ["S", "M", "L"],
  description: "Authentic Chrome Hearts hoodie with signature cross design.",
  care_info: "Dry clean only. Do not bleach.",
  brand_story: "Chrome Hearts is a luxury brand founded in 1988 in Los Angeles.",
  condition: "excellent",
  status: "available",
  main_image_url: "/products/product_1.png",
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchProduct();
    } else {
      setProduct(demoProduct);
      setLoading(false);
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Товар не найден");
      router.push("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (productData, images) => {
    setSaving(true);

    if (!isSupabaseConfigured()) {
      alert("Товар обновлён (демо-режим - Supabase не настроен)");
      router.push("/admin/products");
      return;
    }

    try {
      // Upload new images
      const uploadedImages = [];
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (image.file) {
          const fileName = `${Date.now()}-${i}-${image.file.name}`;
          const { data, error } = await supabase.storage
            .from("product-images")
            .upload(fileName, image.file);

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

          uploadedImages.push({
            url: urlData.publicUrl,
            isMain: image.isMain,
            sortOrder: i,
          });
        }
      }

      // Find main image URL (from new uploads or keep existing)
      let mainImageUrl = product.main_image_url;
      if (uploadedImages.length > 0) {
        const mainImage = uploadedImages.find((img) => img.isMain);
        mainImageUrl = mainImage?.url || uploadedImages[0]?.url || mainImageUrl;
      }

      // Update product
      const { error: productError } = await supabase
        .from("products")
        .update({
          ...productData,
          main_image_url: mainImageUrl,
        })
        .eq("id", params.id);

      if (productError) throw productError;

      // Add new images to product_images
      if (uploadedImages.length > 0) {
        const imageRecords = uploadedImages.map((img) => ({
          product_id: params.id,
          image_url: img.url,
          is_main: img.isMain,
          sort_order: img.sortOrder,
        }));

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }

      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Не удалось обновить товар: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <p>Загрузка товара...</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-header">
        <h1>Редактировать товар</h1>
        <div className="admin-header-actions">
          <Link href="/admin/products" className="admin-btn admin-btn-secondary">
            ← Назад
          </Link>
        </div>
      </div>

      <div className="admin-card">
        <ProductForm product={product} onSubmit={handleSubmit} saving={saving} />
      </div>
    </>
  );
}
