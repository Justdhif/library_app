"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishersApi } from "@/lib/api/publishers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, Building2, Mail, Phone, Globe, MapPin, FileText } from "lucide-react";
import Link from "next/link";

export default function AddPublisherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    website: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama publisher wajib diisi';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Nama terlalu panjang (max 255 karakter)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'URL website harus dimulai dengan http:// atau https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Mohon perbaiki kesalahan pada form');
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        website: formData.website || undefined,
        description: formData.description || undefined,
      };

      await publishersApi.create(submitData);
      toast.success("Publisher berhasil ditambahkan");
      router.push("/publishers");
    } catch (error: any) {
      console.error("Error creating publisher:", error);
      const errorMessage = error.response?.data?.message || "Gagal menambahkan publisher";
      toast.error(errorMessage);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white shadow-lg" style={{ background: 'linear-gradient(to right, var(--brand-primary-dark), var(--brand-primary))' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-32 -translate-x-32" />
        </div>
        <div className="relative flex items-center gap-4">
          <Link href="/publishers">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Tambah Publisher Baru</h1>
              <p className="text-white/90 mt-1">
                Lengkapi form untuk menambahkan publisher
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informasi Dasar
            </CardTitle>
            <CardDescription>
              Data dasar publisher
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Publisher <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Contoh: Gramedia Pustaka Utama"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Deskripsi
              </Label>
              <Textarea
                id="description"
                placeholder="Deskripsi singkat tentang publisher..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Informasi Kontak
            </CardTitle>
            <CardDescription>
              Detail kontak publisher
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Contoh: info@gramedia.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telepon
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Contoh: 021-12345678"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Website */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="Contoh: https://www.gramedia.com"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  disabled={loading}
                />
                {errors.website && (
                  <p className="text-sm text-destructive">{errors.website}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Informasi Lokasi
            </CardTitle>
            <CardDescription>
              Alamat dan lokasi publisher
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">Kota</Label>
                <Input
                  id="city"
                  placeholder="Contoh: Jakarta"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Negara</Label>
                <Input
                  id="country"
                  placeholder="Contoh: Indonesia"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Textarea
                  id="address"
                  placeholder="Alamat lengkap publisher..."
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 bg-gradient-to-r from-gray-50 to-emerald-50 p-6 rounded-xl border border-gray-200">
          <Link href="/publishers">
            <Button type="button" variant="outline" disabled={loading}>
              Batal
            </Button>
          </Link>
          <Button 
            type="submit" 
            isSubmit
            isLoading={loading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg" style={{ background: 'linear-gradient(to right, var(--brand-primary-dark), var(--brand-primary))' }}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan Publisher
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
