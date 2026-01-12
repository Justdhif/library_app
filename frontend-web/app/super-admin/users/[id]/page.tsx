"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileInput } from "@/components/custom-ui/file-input";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { usersApi } from "@/lib/api/users";
import type { User } from "@/lib/types/api";
import { toast } from "sonner";
import { Pencil, Save, X, Trash2, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
    password_confirmation: "",
    full_name: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    city: "",
    state: "",
    postal_code: "",
    address: "",
    bio: "",
    avatar: null as File | null,
  });

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const userData = await usersApi.getById(Number(userId));
      
      setUser(userData);
      setFormData({
        username: userData.username || "",
        email: userData.email || "",
        role: userData.profile?.role || "",
        password: "",
        password_confirmation: "",
        full_name: userData.profile?.full_name || "",
        phone: userData.profile?.phone || "",
        gender: userData.profile?.gender || "",
        date_of_birth: userData.profile?.date_of_birth || "",
        city: userData.profile?.city || "",
        state: userData.profile?.state || "",
        postal_code: userData.profile?.postal_code || "",
        address: userData.profile?.address || "",
        bio: userData.profile?.bio || "",
        avatar: null,
      });
      
      if (userData.profile?.avatar) {
        setAvatarPreview(userData.profile.avatar);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat detail user");
      router.push("/users");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date_of_birth: format(date, "yyyy-MM-dd") }));
      if (errors.date_of_birth) {
        setErrors((prev) => ({ ...prev, date_of_birth: "" }));
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar");
        return;
      }

      setFormData((prev) => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
      if (errors.avatar) {
        setErrors((prev) => ({ ...prev, avatar: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Nama lengkap wajib diisi";
    }
    if (!formData.username.trim()) {
      newErrors.username = "Username wajib diisi";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!formData.role) {
      newErrors.role = "Role wajib dipilih";
    }

    // Password validation only if provided
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Password minimal 8 karakter";
      }
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = "Konfirmasi password tidak cocok";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon perbaiki kesalahan pada form");
      return;
    }

    try {
      setIsSaving(true);

      const submitData = new FormData();
      submitData.append("username", formData.username);
      submitData.append("email", formData.email);
      submitData.append("role", formData.role);
      
      // Only append password if provided
      if (formData.password) {
        submitData.append("password", formData.password);
        submitData.append("password_confirmation", formData.password_confirmation);
      }
      
      submitData.append("full_name", formData.full_name);
      submitData.append("phone", formData.phone);
      submitData.append("gender", formData.gender);
      submitData.append("date_of_birth", formData.date_of_birth);
      submitData.append("city", formData.city);
      submitData.append("state", formData.state);
      submitData.append("postal_code", formData.postal_code);
      submitData.append("address", formData.address);
      submitData.append("bio", formData.bio);

      if (formData.avatar) {
        submitData.append("avatar", formData.avatar);
      }

      const updatedUser = await usersApi.update(Number(userId), submitData);
      toast.success("User berhasil diperbarui");
      setIsEditMode(false);
      
      // Update user state with new data
      setUser(updatedUser);
      setFormData({
        username: updatedUser.username || "",
        email: updatedUser.email || "",
        role: updatedUser.profile?.role || "",
        password: "",
        password_confirmation: "",
        full_name: updatedUser.profile?.full_name || "",
        phone: updatedUser.profile?.phone || "",
        gender: updatedUser.profile?.gender || "",
        date_of_birth: updatedUser.profile?.date_of_birth || "",
        city: updatedUser.profile?.city || "",
        state: updatedUser.profile?.state || "",
        postal_code: updatedUser.profile?.postal_code || "",
        address: updatedUser.profile?.address || "",
        bio: updatedUser.profile?.bio || "",
        avatar: null,
      });
      
      if (updatedUser.profile?.avatar) {
        setAvatarPreview(updatedUser.profile.avatar);
      } else {
        setAvatarPreview("");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Gagal memperbarui user";
      toast.error(errorMessage);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await usersApi.delete(Number(userId));
      toast.success("User berhasil dihapus");
      router.push("/users");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus user");
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setErrors({});
    // Reset form to original user data
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        role: user.profile?.role || "",
        password: "",
        password_confirmation: "",
        full_name: user.profile?.full_name || "",
        phone: user.profile?.phone || "",
        gender: user.profile?.gender || "",
        date_of_birth: user.profile?.date_of_birth || "",
        city: user.profile?.city || "",
        state: user.profile?.state || "",
        postal_code: user.profile?.postal_code || "",
        address: user.profile?.address || "",
        bio: user.profile?.bio || "",
        avatar: null,
      });
      
      if (user.profile?.avatar) {
        setAvatarPreview(user.profile.avatar);
      } else {
        setAvatarPreview("");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditMode ? "Edit User" : "Detail User"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode ? "Ubah informasi user" : "Informasi lengkap user"}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditMode(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Utama */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Utama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center space-y-4" suppressHydrationWarning>
                <FileInput
                  key="user-avatar-edit"
                  variant="circular"
                  value={formData.avatar}
                  onChange={(file) => {
                    setFormData((prev) => ({ ...prev, avatar: file || null }));
                    if (file) {
                      setAvatarPreview(URL.createObjectURL(file));
                    }
                    if (errors.avatar) {
                      setErrors((prev) => ({ ...prev, avatar: "" }));
                    }
                  }}
                  previewUrl={avatarPreview}
                  label={isEditMode ? "Pilih Foto" : "Foto Profil"}
                  description="Max 5MB (JPG, PNG, GIF)"
                  disabled={!isEditMode || isSaving}
                  fallbackIcon={
                    <div className="text-4xl font-semibold text-gray-400">
                      {formData.full_name.charAt(0).toUpperCase() || "?"}
                    </div>
                  }
                  onError={(message) => {
                    setErrors({ ...errors, avatar: message });
                    toast.error(message);
                  }}
                  previewSize="w-40 h-40"
                  showRemoveButton={isEditMode}
                />
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  {isEditMode ? (
                    <>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama lengkap"
                      />
                      {errors.full_name && (
                        <p className="text-xs text-red-500">{errors.full_name}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm py-2">{user.profile?.full_name || "-"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  {isEditMode ? (
                    <>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Masukkan username"
                      />
                      {errors.username && (
                        <p className="text-xs text-red-500">{errors.username}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm py-2">{user.username || "-"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  {isEditMode ? (
                    <>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Masukkan email"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500">{errors.email}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm py-2">{user.email || "-"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  {isEditMode ? (
                    <>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => handleSelectChange("role", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="librarian">Librarian</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-xs text-red-500">{errors.role}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm py-2 capitalize">
                      {user.profile?.role || "-"}
                    </p>
                  )}
                </div>

                {isEditMode && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Password
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Kosongkan jika tidak ingin mengubah"
                      />
                      {errors.password && (
                        <p className="text-xs text-red-500">{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password_confirmation">
                        Konfirmasi Password
                      </Label>
                      <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        placeholder="Konfirmasi password baru"
                      />
                      {errors.password_confirmation && (
                        <p className="text-xs text-red-500">
                          {errors.password_confirmation}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Status</Label>
                  <p className="text-sm py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status === "active" ? "Aktif" : "Nonaktif"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informasi Tambahan */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Tambahan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                {isEditMode ? (
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Masukkan nomor telepon"
                  />
                ) : (
                  <p className="text-sm py-2">{user.profile?.phone || "-"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin</Label>
                {isEditMode ? (
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Laki-laki</SelectItem>
                      <SelectItem value="female">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm py-2">
                    {user.profile?.gender === "male"
                      ? "Laki-laki"
                      : user.profile?.gender === "female"
                      ? "Perempuan"
                      : "-"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Tanggal Lahir</Label>
                {isEditMode ? (
                  <DatePicker
                    date={formData.date_of_birth ? new Date(formData.date_of_birth) : undefined}
                    onDateChange={handleDateChange}
                  />
                ) : (
                  <p className="text-sm py-2">
                    {user.profile?.date_of_birth
                      ? format(new Date(user.profile.date_of_birth), "dd MMMM yyyy", {
                          locale: idLocale,
                        })
                      : "-"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Kota</Label>
                {isEditMode ? (
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Masukkan kota"
                  />
                ) : (
                  <p className="text-sm py-2">{user.profile?.city || "-"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Provinsi</Label>
                {isEditMode ? (
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Masukkan provinsi"
                  />
                ) : (
                  <p className="text-sm py-2">{user.profile?.state || "-"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Kode Pos</Label>
                {isEditMode ? (
                  <Input
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    placeholder="Masukkan kode pos"
                  />
                ) : (
                  <p className="text-sm py-2">{user.profile?.postal_code || "-"}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Alamat</Label>
                {isEditMode ? (
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Masukkan alamat lengkap"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm py-2">{user.profile?.address || "-"}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditMode ? (
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Masukkan bio"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm py-2">{user.profile?.bio || "-"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Hapus User"
        description={`Apakah Anda yakin ingin menghapus user "${user.profile?.full_name || user.username}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
