"use client";

import { useState, useEffect } from "react";
import { authorsApi } from "@/lib/api/authors";
import type { Author, SocialLink } from "@/lib/types/api";
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
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { FileInput } from "@/components/custom-ui/file-input";
import { UserCircle, Save, Upload, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuthorDialogProps {
  open: boolean;
  author?: Author;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthorDialog({ open, author, onClose, onSuccess }: AuthorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File>();
  const [photoPreview, setPhotoPreview] = useState<string>();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    biography: "",
    birth_date: undefined as Date | undefined,
    death_date: undefined as Date | undefined,
    nationality: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (author) {
      setFormData({
        name: author.name,
        biography: author.biography || "",
        birth_date: author.birth_date ? new Date(author.birth_date) : undefined,
        death_date: author.death_date ? new Date(author.death_date) : undefined,
        nationality: author.nationality || "",
        is_active: author.is_active,
      });
      // Set existing photo preview
      if (author.photo) {
        setPhotoPreview(author.photo);
      } else {
        setPhotoPreview(undefined);
      }
      setPhotoFile(undefined);
      // Set social links
      setSocialLinks(author.social_links || []);
    } else {
      setFormData({
        name: "",
        biography: "",
        birth_date: undefined,
        death_date: undefined,
        nationality: "",
        is_active: true,
      });
      setPhotoPreview(undefined);
      setPhotoFile(undefined);
      setSocialLinks([]);
    }
    setErrors({});
  }, [author, open]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview && photoFile) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview, photoFile]);

  const handleChange = (field: string, value: string | boolean | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "twitter", url: "" }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama penulis wajib diisi';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Nama penulis terlalu panjang';
    }

    if (formData.nationality && formData.nationality.length > 100) {
      newErrors.nationality = 'Kewarganegaraan terlalu panjang';
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

      // Use FormData if there's a photo file
      const submitData = new FormData();
      
      submitData.append('name', formData.name.trim());
      submitData.append('is_active', formData.is_active ? '1' : '0');
      
      if (formData.biography.trim()) {
        submitData.append('biography', formData.biography.trim());
      }
      
      if (formData.birth_date) {
        submitData.append('birth_date', formData.birth_date.toISOString().split('T')[0]);
      }
      
      if (formData.death_date) {
        submitData.append('death_date', formData.death_date.toISOString().split('T')[0]);
      }
      
      if (formData.nationality.trim()) {
        submitData.append('nationality', formData.nationality.trim());
      }
      
      if (photoFile) {
        submitData.append('photo', photoFile);
      }

      // Append social links
      socialLinks.forEach((link, index) => {
        if (link.platform && link.url) {
          submitData.append(`social_links[${index}][platform]`, link.platform);
          submitData.append(`social_links[${index}][url]`, link.url);
        }
      });

      if (author) {
        await authorsApi.update(author.id, submitData);
        toast.success('Penulis berhasil diperbarui');
      } else {
        await authorsApi.create(submitData);
        toast.success('Penulis berhasil ditambahkan');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving author:', error);
      const errorMessage = error.response?.data?.message || 
        (author ? 'Gagal memperbarui penulis' : 'Gagal menambahkan penulis');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            {author ? 'Edit Penulis' : 'Tambah Penulis'}
          </DialogTitle>
          <DialogDescription>
            {author 
              ? 'Ubah informasi penulis di bawah ini' 
              : 'Lengkapi form di bawah untuk menambahkan penulis baru'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Two Column Layout: Photo Left, Form Right */}
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
            {/* Left Column - Photo Upload */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Foto Penulis</Label>
              <FileInput
                variant="circular"
                id="photo"
                value={photoFile}
                onChange={(file) => {
                  setPhotoFile(file);
                  if (file) {
                    setPhotoPreview(URL.createObjectURL(file));
                  }
                }}
                previewUrl={photoPreview}
                label="Upload Foto"
                description="Max 5MB (JPG, PNG, GIF)"
                disabled={loading}
                fallbackIcon={<UserCircle className="w-20 h-20 text-gray-400" />}
                onError={(message) => toast.error(message)}
              />
            </div>

            {/* Right Column - Main Form Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Penulis <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: J.K. Rowling"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Nationality */}
              <div className="space-y-2">
                <Label htmlFor="nationality">Kewarganegaraan</Label>
                <Input
                  id="nationality"
                  placeholder="Contoh: British"
                  value={formData.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  disabled={loading}
                />
                {errors.nationality && (
                  <p className="text-sm text-destructive">{errors.nationality}</p>
                )}
              </div>

              {/* Birth Date & Death Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Tanggal Lahir</Label>
                  <DatePicker
                    date={formData.birth_date}
                    onDateChange={(date) => handleChange('birth_date', date)}
                    placeholder="Pilih tanggal lahir"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="death_date">Tanggal Wafat</Label>
                  <DatePicker
                    date={formData.death_date}
                    onDateChange={(date) => handleChange('death_date', date)}
                    placeholder="Pilih tanggal wafat"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Social Links
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSocialLink}
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Link
              </Button>
            </div>
            
            {socialLinks.length > 0 ? (
              <div className="space-y-3 rounded-lg border p-4">
                {socialLinks.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Select
                      value={link.platform}
                      onValueChange={(value) => updateSocialLink(index, 'platform', value)}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-45">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSocialLink(index)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada social links. Klik "Tambah Link" untuk menambahkan.
              </p>
            )}
          </div>

          {/* Biography */}
          <div className="space-y-2">
            <Label htmlFor="biography">Biografi</Label>
            <Textarea
              id="biography"
              placeholder="Masukkan biografi singkat penulis..."
              value={formData.biography}
              onChange={(e) => handleChange('biography', e.target.value)}
              disabled={loading}
              rows={4}
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-base">Status Aktif</Label>
              <p className="text-sm text-muted-foreground">
                Penulis aktif akan ditampilkan di sistem
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              isSubmit
              isLoading={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
              style={{ backgroundColor: 'var(--brand-primary-dark)' }}
            >
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
