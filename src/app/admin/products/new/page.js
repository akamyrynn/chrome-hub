"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import ProductForm from "@/components/Admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (productData, images) => {
    setSaving(true);

    if (!isSupabaseConfigured()) {
      alert("Product created (demo mode - Supabase not configured)");
      router.push("/admin/products");
      return;
    }

    try {
      // Upload images first
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
            section: image.section || 'gallery',
            mediaType: image.mediaType || 'image',
          });
        }
      }

      // Find main image URL (from gallery section)
      const galleryImages = uploadedImages.filter(img => img.section === 'gallery');
      const mainImage = galleryImages.find((img) => img.isMain);
      const mainImageUrl = mainImage?.url || galleryImages[0]?.url || null;

      // Create product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          ...productData,
          main_image_url: mainImageUrl,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Create product_images records
      if (uploadedImages.length > 0) {
        const imageRecords = uploadedImages.map((img) => ({
          product_id: product.id,
          image_url: img.url,
          is_main: img.isMain,
          sort_order: img.sortOrder,
          media_type: img.mediaType,
        }));

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }

      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-header">
        <h1>Add Product</h1>
      </div>

      <div className="admin-card">
        <ProductForm onSubmit={handleSubmit} saving={saving} />
      </div>
    </>
  );
}
