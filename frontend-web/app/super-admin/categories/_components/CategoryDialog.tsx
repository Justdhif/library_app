"use client";

import { useState, useEffect } from "react";
import { categoriesApi } from "@/lib/api/categories";
import type { Category } from "@/lib/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Folder, Save } from "lucide-react";
import { availableIcons, getIconByName } from "@/lib/utils/iconMapping";

interface CategoryDialogProps {
  open: boolean;
  category?: Category;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryDialog({ open, category, categories, onClose, onSuccess }: CategoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_id: "",
    icon: "",
    order: "0",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [iconSearchQuery, setIconSearchQuery] = useState("");

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        parent_id: category.parent_id?.toString() || "",
        icon: category.icon || "",
        order: category.order?.toString() || "0",
        is_active: category.is_active,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        parent_id: "",
        icon: "",
        order: "0",
        is_active: true,
      });
    }
    setErrors({});
  }, [category, open]);

  const handleChange = (field: string, value: string | boolean | number) => {
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
      newErrors.name = 'Nama kategori wajib diisi';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Nama kategori terlalu panjang';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Deskripsi terlalu panjang';
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

      const submitData: any = {
        name: formData.name,
        is_active: formData.is_active,
      };

      if (formData.description) {
        submitData.description = formData.description;
      }

      if (formData.parent_id) {
        submitData.parent_id = parseInt(formData.parent_id);
      }

      // Always send icon, even if empty (to allow clearing)
      submitData.icon = formData.icon || null;

      // Always send order
      submitData.order = formData.order ? parseInt(formData.order) : 0;

      console.log('Submitting category data:', submitData);

      if (category) {
        await categoriesApi.update(category.id, submitData);
        toast.success("Kategori berhasil diperbarui");
      } else {
        await categoriesApi.create(submitData);
        toast.success("Kategori berhasil ditambahkan");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving category:", error);
      const errorMessage = error.response?.data?.message || 
        (category ? "Gagal memperbarui kategori" : "Gagal menambahkan kategori");
      toast.error(errorMessage);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter out current category from parent options (can't be parent of itself)
  const availableParentCategories = categories.filter(c => 
    !category || c.id !== category.id
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Folder className="h-5 w-5 text-emerald-600" />
            </div>
            <span>{category ? 'Edit Kategori' : 'Tambah Kategori Baru'}</span>
          </DialogTitle>
          <DialogDescription>
            {category 
              ? 'Perbarui informasi kategori' 
              : 'Lengkapi form untuk menambahkan kategori baru'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Kategori <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Contoh: Fiksi, Non-Fiksi, Sejarah"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Parent Category */}
          <div className="space-y-2">
            <Label htmlFor="parent_id">Kategori Induk (Opsional)</Label>
            <Select
              value={formData.parent_id || "none"}
              onValueChange={(value) => handleChange('parent_id', value === "none" ? "" : value)}
              disabled={loading}
            >
              <SelectTrigger id="parent_id">
                <SelectValue placeholder="Pilih kategori induk (jika ada)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada (Root Category)</SelectItem>
                {availableParentCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-emerald-600" />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Buat sub-kategori dengan memilih kategori induk
            </p>
          </div>

          {/* Icon Selector with Search */}
          <div className="space-y-2">
            <Label htmlFor="icon">Icon Kategori (Opsional)</Label>
            <Select
              value={formData.icon || "none"}
              onValueChange={(value) => {
                handleChange('icon', value === "none" ? "" : value);
                setIconSearchQuery("");
              }}
              disabled={loading}
            >
              <SelectTrigger id="icon">
                <SelectValue placeholder="Pilih icon untuk kategori">
                  {formData.icon ? (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = getIconByName(formData.icon);
                        return <IconComponent className="h-4 w-4 text-emerald-600" />;
                      })()}
                      <span>{availableIcons.find(i => i.name === formData.icon)?.label}</span>
                    </div>
                  ) : (
                    "Pilih icon untuk kategori"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[350px]">
                {/* Search Input */}
                <div className="px-2 py-2 border-b">
                  <Input
                    placeholder="Cari icon..."
                    value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
                    className="h-8"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div className="max-h-[250px] overflow-y-auto">
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4" />
                      Tanpa Icon
                    </div>
                  </SelectItem>
                  {availableIcons
                    .filter(iconOption => 
                      iconSearchQuery === "" || 
                      iconOption.label.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
                      iconOption.name.toLowerCase().includes(iconSearchQuery.toLowerCase())
                    )
                    .map((iconOption) => {
                      const IconComponent = iconOption.Icon;
                      return (
                        <SelectItem key={iconOption.name} value={iconOption.name}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-emerald-600" />
                            {iconOption.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  {availableIcons.filter(iconOption => 
                    iconSearchQuery === "" || 
                    iconOption.label.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
                    iconOption.name.toLowerCase().includes(iconSearchQuery.toLowerCase())
                  ).length === 0 && iconSearchQuery !== "" && (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      Tidak ada icon yang cocok
                    </div>
                  )}
                </div>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Icon akan ditampilkan di samping nama kategori
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi singkat tentang kategori..."
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={loading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Is Active */}
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-base">
                Status Aktif
              </Label>
              <p className="text-sm text-muted-foreground">
                Kategori aktif akan ditampilkan di sistem
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked: boolean) => handleChange('is_active', checked)}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button 
              type="submit" 
              isSubmit
              isLoading={loading}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600" 
              style={{ background: 'linear-gradient(to right, var(--brand-primary-dark), var(--brand-primary))' }}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {category ? 'Perbarui' : 'Simpan'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
