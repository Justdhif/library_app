'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Monitor, Languages, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(t('settings.themeChanged'));
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'en' | 'id');
    toast.success(t('settings.languageChanged'));
  };

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.description')}</p>
      </div>

      <div className="grid gap-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t('settings.theme')}
            </CardTitle>
            <CardDescription>
              {t('settings.themeDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={theme} onValueChange={handleThemeChange}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2.5 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleThemeChange('light')}>
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center">
                        <Sun className="h-5 w-5 text-yellow-700" />
                      </div>
                      <div>
                        <div className="font-semibold">{t('settings.light')}</div>
                        <div className="text-xs text-muted-foreground">{t('settings.lightDescription')}</div>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-2.5 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleThemeChange('dark')}>
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <Moon className="h-5 w-5 text-blue-300" />
                      </div>
                      <div>
                        <div className="font-semibold">{t('settings.dark')}</div>
                        <div className="text-xs text-muted-foreground">{t('settings.darkDescription')}</div>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-2.5 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleThemeChange('system')}>
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <Monitor className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">{t('settings.system')}</div>
                        <div className="text-xs text-muted-foreground">{t('settings.systemDescription')}</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {t('settings.language')}
            </CardTitle>
            <CardDescription>
              {t('settings.languageDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={language} onValueChange={handleLanguageChange}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2.5 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleLanguageChange('id')}>
                  <RadioGroupItem value="id" id="lang-id" />
                  <Label htmlFor="lang-id" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🇮🇩</div>
                      <div>
                        <div className="font-semibold">{t('settings.indonesian')}</div>
                        <div className="text-xs text-muted-foreground">{t('settings.indonesianDescription')}</div>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-2.5 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleLanguageChange('en')}>
                  <RadioGroupItem value="en" id="lang-en" />
                  <Label htmlFor="lang-en" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🇬🇧</div>
                      <div>
                        <div className="font-semibold">{t('settings.english')}</div>
                        <div className="text-xs text-muted-foreground">{t('settings.englishDescription')}</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
