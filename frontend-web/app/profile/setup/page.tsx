'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { authApi } from '@/lib/api';
import { getDashboardPath } from '@/lib/auth/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'sonner';
import { FileInput } from '@/components/custom-ui/file-input';
import { Upload, User, BookOpen, ArrowRight, ArrowLeft, Loader2, MapPin, Calendar, Phone, Mail } from 'lucide-react';
import Image from 'next/image';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Indonesia',
    date_of_birth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    bio: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const savedCredentials = sessionStorage.getItem('register_credentials');
    
    if (!savedCredentials) {
      toast.error(t('profile.registerFirst'));
      router.push('/register');
      return;
    }

    setCredentials(JSON.parse(savedCredentials));
  }, [router, t]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t('profile.fileTooLarge'));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error(t('profile.fileMustBeImage'));
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setFormData({ ...formData, date_of_birth: formattedDate });
    } else {
      setFormData({ ...formData, date_of_birth: '' });
    }
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.full_name.trim()) {
        toast.error(t('profile.fullNameRequired'));
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/register');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    if (!credentials) {
      toast.error(t('profile.dataNotFound'));
      router.push('/register');
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        email: credentials.email,
        password: credentials.password,
        password_confirmation: credentials.password_confirmation,
        full_name: formData.full_name,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postal_code: formData.postal_code || undefined,
        country: formData.country || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        gender: formData.gender || undefined,
        bio: formData.bio || undefined,
      };

      const response = await authApi.register(registerData);
      
      sessionStorage.removeItem('register_credentials');
      
      toast.success(t('auth.registerSuccess'));
      
      const dashboardPath = getDashboardPath(response.user);
      router.push(dashboardPath);
    } catch (error: any) {
      const message = error.response?.data?.message || t('auth.registerError');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!credentials) {
    return null;
  }

  const steps = [
    { number: 1, title: 'Informasi Pribadi', icon: User },
    { number: 2, title: 'Alamat & Kontak', icon: MapPin },
    { number: 3, title: 'Bio & Preferensi', icon: BookOpen },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-200 to-emerald-200 rounded-full opacity-15 blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(16 185 129) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl">
        {/* Floating Card with Enhanced Shadow */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20 transition-all duration-500 hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)]">
          {/* Premium Header with Animated Gradient */}
          <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 px-8 py-8 text-white overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"60\\" height=\\"60\\" viewBox=\\"0 0 60 60\\" xmlns=\\"http://www.w3.org/2000/svg\\"=%3E%3Cg fill=\\"none\\" fill-rule=\\"evenodd\\"=%3E%3Cg fill=\\"%23ffffff\\" fill-opacity=\\"0.4\\"=%3E%3Cpath d=\\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\"/%3E%3C/g=%3E%3C/g=%3E%3C/svg%3E") ' }} />
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-center mb-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/30 rounded-2xl blur-lg group-hover:bg-white/40 transition-all" />
                  <div className="relative w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <BookOpen className="w-7 h-7" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-center mb-2 tracking-tight">Lengkapi Profil Anda</h1>
              <p className="text-emerald-50 text-center text-sm font-light max-w-2xl mx-auto">
                Isi informasi untuk pengalaman perpustakaan digital yang lebih personal dan optimal
              </p>
            </div>
          </div>

          {/* Enhanced Progress Steps */}
          <div className="relative px-6 py-6 border-b bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-2xl mx-auto">
              {/* Steps Container with proper alignment */}
              <div className="relative flex items-start justify-between gap-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;
                  
                  return (
                    <>
                      {/* Step Item - Fixed Width for Perfect Alignment */}
                      <div key={`step-${step.number}`} className="flex flex-col items-center" style={{ width: '120px' }}>
                        {/* Step Circle with Glow Effect */}
                        <div className="relative mb-2">
                          {isActive && (
                            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                          )}
                          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isCompleted 
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200' 
                              : isActive 
                              ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-300 ring-4 ring-emerald-100' 
                              : 'bg-white text-gray-400 shadow-md border-2 border-gray-200'
                          }`}>
                            {isCompleted ? (
                              <svg className="w-4 h-4 animate-fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <Icon className="w-4 h-4" strokeWidth={2.5} />
                            )}
                          </div>
                        </div>
                        
                        {/* Step Title */}
                        <div className="text-center w-full">
                          <p className={`text-xs font-semibold transition-colors duration-300 mb-0.5 leading-tight ${
                            isActive ? 'text-emerald-600' : isCompleted ? 'text-emerald-500' : 'text-gray-400'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium">
                            Step {step.number}
                          </p>
                        </div>
                      </div>
                      
                      {/* Connecting Line Between Steps */}
                      {index < steps.length - 1 && (
                        <div key={`line-${step.number}`} className="flex items-start pt-5 flex-1">
                          <div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden relative">
                            <div className={`h-full rounded-full transition-all duration-700 ease-in-out ${
                              isCompleted ? 'w-full bg-gradient-to-r from-emerald-500 to-teal-500' : 'w-0'
                            }`} />
                          </div>
                        </div>
                      )}
                    </>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Content with Premium Styling */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                {/* Premium Avatar Upload Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group cursor-pointer">
                    {/* Glow Effect on Hover */}
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
                    
                    <FileInput
                      variant="circular"
                      id="avatar"
                      value={avatarFile}
                      onChange={(file) => {
                        setAvatarFile(file || null);
                        if (file) {
                          setAvatarPreview(URL.createObjectURL(file));
                        } else {
                          setAvatarPreview(null);
                        }
                      }}
                      previewUrl={avatarPreview || undefined}
                      label={
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ring-4 ring-white">
                          <Upload className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                      }
                      description="Maksimal 2MB • JPG, PNG"
                      maxSize={2}
                      disabled={isLoading}
                      fallbackIcon={<User className="w-20 h-20 text-gray-300" strokeWidth={1.5} />}
                      onError={(message) => toast.error(message)}
                      previewSize="w-32 h-32"
                      showRemoveButton={false}
                      className="relative w-32 h-32 rounded-full overflow-hidden border-3 border-white shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 ring-3 ring-emerald-100 group-hover:ring-emerald-200 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Form Fields with Premium Design */}
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-gray-800 font-semibold text-xs flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      Nama Lengkap <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-focus-within:bg-emerald-100 transition-colors">
                          <User className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                        </div>
                      </div>
                      <Input
                        id="full_name"
                        type="text"
                        placeholder="Masukkan nama lengkap Anda"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                        disabled={isLoading}
                        className="pl-14 h-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 hover:border-gray-300 bg-white shadow-sm text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-800 font-semibold text-xs flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" />
                      Email
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-gray-500" strokeWidth={2.5} />
                        </div>
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={credentials.email}
                        disabled
                        className="pl-14 h-12 border-2 bg-gray-50 rounded-xl shadow-sm cursor-not-allowed text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-800 font-semibold text-xs flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      No. Telepon
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-focus-within:bg-emerald-100 transition-colors">
                          <Phone className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                        </div>
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Contoh: 08123456789"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={isLoading}
                        className="pl-14 h-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 hover:border-gray-300 bg-white shadow-sm text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-800 font-semibold text-xs flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        Tanggal Lahir
                      </Label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-focus-within:bg-emerald-100 transition-colors">
                            <Calendar className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                          </div>
                        </div>
                        <div className="pl-14">
                          <DatePicker
                            date={selectedDate}
                            onDateChange={handleDateChange}
                            placeholder="Pilih tanggal lahir"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-gray-800 font-semibold text-xs flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        Jenis Kelamin
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' })}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 shadow-sm hover:border-gray-300 transition-all text-sm">
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Laki-laki</SelectItem>
                          <SelectItem value="female">Perempuan</SelectItem>
                          <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address & Contact */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-800 font-semibold text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Alamat Lengkap
                  </Label>
                  <div className="relative group">
                    <div className="absolute left-3 top-3 flex items-center pointer-events-none">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-focus-within:bg-emerald-100 transition-colors">
                        <MapPin className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                      </div>
                    </div>
                    <Textarea
                      id="address"
                      className="w-full pl-14 pr-3 py-3 min-h-28 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 hover:border-gray-300 resize-none bg-white shadow-sm text-sm"
                      placeholder="Jl. Contoh No. 123, RT/RW 01/02, Kelurahan, Kecamatan"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-800 font-semibold text-xs">
                      Kota
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Contoh: Jakarta"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={isLoading}
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 hover:border-gray-300 shadow-sm text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-gray-800 font-semibold text-xs">
                      Provinsi
                    </Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="Contoh: DKI Jakarta"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      disabled={isLoading}
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 hover:border-gray-300 shadow-sm text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code" className="text-gray-800 font-semibold text-xs">
                      Kode Pos
                    </Label>
                    <Input
                      id="postal_code"
                      type="text"
                      placeholder="Contoh: 12345"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      disabled={isLoading}
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 hover:border-gray-300 shadow-sm text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-gray-800 font-semibold text-xs">
                      Negara
                    </Label>
                    <Input
                      id="country"
                      type="text"
                      placeholder="Contoh: Indonesia"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      disabled={isLoading}
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 hover:border-gray-300 shadow-sm text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Bio & Preferences */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in max-w-3xl mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-800 font-semibold text-xs flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    Bio / Tentang Saya
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="bio"
                      className="w-full px-4 py-3 min-h-36 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 hover:border-gray-300 resize-none bg-white shadow-sm text-sm"
                      placeholder="Ceritakan sedikit tentang diri Anda, minat baca favorit, genre buku kesukaan, atau hobi yang berkaitan dengan literasi..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={isLoading}
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-gray-400">Opsional - Membantu personalisasi rekomendasi</p>
                      <p className={`text-xs font-medium transition-colors ${
                        formData.bio.length > 450 ? 'text-amber-600' : 'text-gray-500'
                      }`}>
                        {formData.bio.length}/500
                      </p>
                    </div>
                  </div>
                </div>

                {/* Premium Success Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-200 rounded-xl p-5 shadow-lg">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200 rounded-full opacity-20 blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-teal-200 rounded-full opacity-20 blur-xl" />
                  
                  <div className="relative flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 animate-bounce-slow">
                        <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                        Anda Hampir Selesai!
                        <span className="text-xl">🎉</span>
                      </h3>
                      <p className="text-xs text-gray-700 leading-relaxed mb-2.5">
                        Setelah menyelesaikan pendaftaran, Anda akan mendapatkan akses penuh ke perpustakaan digital dengan berbagai fitur unggulan:
                      </p>
                      <ul className="space-y-1.5">
                        <li className="flex items-center gap-1.5 text-xs text-gray-700">
                          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span><strong className="font-semibold">10,000+</strong> koleksi buku digital tersedia</span>
                        </li>
                        <li className="flex items-center gap-1.5 text-xs text-gray-700">
                          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Sistem <strong className="font-semibold">peminjaman otomatis</strong> yang mudah</span>
                        </li>
                        <li className="flex items-center gap-1.5 text-xs text-gray-700">
                          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span><strong className="font-semibold">Notifikasi pengingat</strong> jatuh tempo otomatis</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Premium Navigation Buttons */}
            <div className="flex gap-3 mt-6 max-w-3xl mx-auto">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl font-semibold text-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] text-sm"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                {currentStep === 1 ? 'Kembali' : 'Sebelumnya'}
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group text-sm"
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="relative flex items-center justify-center">
                    Selanjutnya
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                  </span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  isSubmit
                  isLoading={isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group text-sm"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" strokeWidth={2.5} />
                        Mendaftar...
                      </>
                    ) : (
                      <>
                        Selesaikan Pendaftaran
                        <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                      </>
                    )}
                  </span>
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Premium Footer Text */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-gray-600">
            Dengan mendaftar, Anda menyetujui{' '}
            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold underline decoration-2 underline-offset-2 transition-colors">
              Syarat & Ketentuan
            </a>
            {' '}dan{' '}
            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold underline decoration-2 underline-offset-2 transition-colors">
              Kebijakan Privasi
            </a>
          </p>
          <p className="text-[10px] text-gray-500">
            © 2026 Library App. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
