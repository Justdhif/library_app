'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { FileInput } from '@/components/custom-ui/file-input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, User, Mail, Lock, Shield, Calendar, Phone, MapPin, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AddUserPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // User data
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    status: 'active',
    role: 'member',
    
    // Profile data
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    gender: '',
    bio: '',
  });

  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [avatar, setAvatar] = useState<File>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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

    if (!formData.username.trim()) {
      newErrors.username = t('users.usernameRequired');
    } else if (formData.username.length < 3) {
      newErrors.username = t('users.usernameMinLength');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('users.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('users.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('users.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('users.passwordMinLength');
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = t('users.passwordNotMatch');
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = t('users.fullNameRequired');
    }

    if (formData.phone && !/^[0-9+\-() ]+$/.test(formData.phone)) {
      newErrors.phone = t('users.phoneInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('users.fixFormErrors'));
      return;
    }

    try {
      setLoading(true);
      
      // Prepare form data for multipart/form-data
      const submitData = new FormData();
      
      // Add user fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });
      
      // Add date of birth if selected
      if (dateOfBirth) {
        submitData.append('date_of_birth', format(dateOfBirth, 'yyyy-MM-dd'));
      }
      
      // Add avatar if selected
      if (avatar) {
        submitData.append('avatar', avatar);
      }
      
      await usersApi.create(submitData);
      
      toast.success(t('users.userAddedSuccess'));
      router.push('/users');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('users.userAddedFailed');
      toast.error(errorMessage);
      
      // Handle validation errors from backend
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
          <Link href="/users">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('users.addNewUser')}</h1>
              <p className="text-white/90 mt-1">
                {t('users.completeForm')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('users.mainInformation')}
            </CardTitle>
            <CardDescription>
              {t('users.accountAndProfile')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
              {/* Left Column - Avatar Upload */}
              <div className="space-y-4" suppressHydrationWarning>
                <Label className="text-lg font-semibold">{t('users.profilePhoto')}</Label>
                <FileInput
                  key="user-avatar-input"
                  variant="circular"
                  id="avatar"
                  value={avatar}
                  onChange={(file) => setAvatar(file)}
                  label={t('users.choosePhoto')}
                  description={t('users.maxFileSize')}
                  disabled={loading}
                  fallbackIcon={<User className="w-20 h-20 text-gray-400 dark:text-gray-500" />}
                  onError={(message) => toast.error(message)}
                />
              </div>

              {/* Right Column - Main Form Fields */}
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('users.fullName')} *</Label>
                  <Input
                    id="full_name"
                    placeholder={t('users.fullNamePlaceholder')}
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    className={errors.full_name ? 'border-red-500' : ''}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-500">{errors.full_name}</p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('users.username')} *
                  </Label>
                  <Input
                    id="username"
                    placeholder={t('users.usernamePlaceholder')}
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t('users.email')} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {t('users.role')} *
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('users.selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="librarian">Librarian</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {t('users.password')} *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('users.passwordPlaceholder')}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {t('users.confirmPassword')} *
                    </Label>
                    <Input
                      id="password_confirmation"
                      type="password"
                      placeholder={t('users.confirmPasswordPlaceholder')}
                      value={formData.password_confirmation}
                      onChange={(e) => handleChange('password_confirmation', e.target.value)}
                      className={errors.password_confirmation ? 'border-red-500' : ''}
                    />
                    {errors.password_confirmation && (
                      <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('users.personalInformation')}
            </CardTitle>
            <CardDescription>
              {t('users.detailedProfile')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {t('users.phoneNumberLabel')}
                </Label>
                <Input
                  id="phone"
                  placeholder={t('users.phonePlaceholder')}
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">{t('users.gender')}</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('users.selectGender')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('users.male')}</SelectItem>
                    <SelectItem value="female">{t('users.female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('users.dateOfBirth')}
                </Label>
                <DatePicker
                  date={dateOfBirth}
                  onDateChange={setDateOfBirth}
                  placeholder={t('users.dateOfBirthPlaceholder')}
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('users.city')}
                </Label>
                <Input
                  id="city"
                  placeholder={t('users.cityPlaceholder')}
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state">Provinsi</Label>
                <Input
                  id="state"
                  placeholder="DKI Jakarta"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <Label htmlFor="postal_code">Kode Pos</Label>
                <Input
                  id="postal_code"
                  placeholder="12345"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                />
              </div>

              {/* Address - Full Width */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Alamat Lengkap
                </Label>
                <Textarea
                  id="address"
                  placeholder="Jl. Contoh No. 123, RT 01/RW 02"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Bio - Full Width */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('users.bio')}
                </Label>
                <Textarea
                  id="bio"
                  placeholder={t('users.bioPlaceholder')}
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950/30 p-6 rounded-xl border border-gray-200 dark:border-gray-800">          <Link href="/users">
            <Button type="button" variant="outline" disabled={loading} className="shadow-sm">
              {t('users.cancel')}
            </Button>
          </Link>
          <Button 
            type="submit" 
            isSubmit
            isLoading={loading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg" style={{ background: 'linear-gradient(to right, var(--brand-primary-dark), var(--brand-primary))' }}
          >
            <Save className="mr-2 h-4 w-4" />
            {t('users.saveUser')}
          </Button>
        </div>
      </form>
    </div>
  );
}
