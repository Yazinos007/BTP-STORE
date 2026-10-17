import React, { useEffect, useState, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import useSettingsStore from '../../../store/useSettingsStore';
import useArchitectStore from '../../../store/useArchitectStore';
import { supabase } from '../../../lib/supabase';
import {
  Camera, Save, Building2, UserCircle, GraduationCap, FileBadge, Phone, Mail, MapPin, Crown, Lock, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';

const translations = {
  ar: {
    pageTitle: 'الهوية المهنية والبصرية',
    pageDesc: 'أدر بيانات مكتبك الرسمي والشعار. هذه المعلومات ستُطبع تلقائياً على المحاضر لتأكيد صفتك القانونية.',
    logoTitle: 'شعار المكتب (Logo)',
    logoDesc: 'صورة شفافة (PNG/JPG) تظهر في ترويسة الوثائق والمحاضر.',
    selectLogoBtn: 'اختيار الشعار',
    vipLockTitle: 'ميزة الهوية (Whitelabel) مقفلة',
    vipLockDesc: 'ضع شعار مكتبك على التقارير بدلاً من شعار المنصة.',
    vipUpgradeBtn: 'الترقية لـ VIP لفتح الميزة 🔓',
    agencyLabel: 'اسم مكتب الدراسات / الوكالة',
    nameLabel: 'الاسم الكامل للمهندس',
    specialtyLabel: 'التخصص المهني (الدرجة)',
    licenseLabel: 'رقم القيد في الهيئة (Ordre)',
    phoneLabel: 'رقم الهاتف الرسمي',
    emailLabel: 'البريد الإلكتروني المهني',
    addressLabel: 'عنوان المكتب المعتمد',
    saveBtn: 'حفظ واعتماد الهوية',
    savingBtn: 'جاري الحفظ...',
    successMsg: 'تم تحديث هويتك المهنية (والشعار) بنجاح!',
    errorMsg: 'لم يتم الحفظ. السبب:',
  },

  fr: {
    pageTitle: 'Identité Professionnelle & Visuelle',
    pageDesc: 'Gérez les détails de votre cabinet et votre logo. Ces informations apparaîtront sur vos PVs.',
    logoTitle: 'Logo du Cabinet',
    logoDesc: 'Image transparente (PNG/JPG) affichée sur l’en-tête de vos documents.',
    selectLogoBtn: 'Choisir un logo',
    vipLockTitle: 'Fonctionnalité Whitelabel verrouillée',
    vipLockDesc: 'Affichez votre logo d’agence au lieu du logo de la plateforme.',
    vipUpgradeBtn: 'Passer à VIP pour débloquer 🔓',
    agencyLabel: "Nom du cabinet d'études / Agence",
    nameLabel: "Nom complet de l'architecte",
    specialtyLabel: 'Spécialité / Titre',
    licenseLabel: "Numéro d'inscription à l'Ordre",
    phoneLabel: 'Téléphone officiel',
    emailLabel: 'E-mail professionnel',
    addressLabel: "Adresse officielle du cabinet",
    saveBtn: 'Enregistrer les modifications',
    savingBtn: 'Enregistrement...',
    successMsg: 'Identité professionnelle mise à jour avec succès !',
    errorMsg: 'Échec de la sauvegarde. Raison :',
  },

  en: {
    pageTitle: 'Professional & Visual Identity',
    pageDesc: 'Manage your official firm details and logo. This information will appear on generated reports.',
    logoTitle: 'Firm Logo',
    logoDesc: 'Transparent image (PNG/JPG) displayed on report headers.',
    selectLogoBtn: 'Select Logo',
    vipLockTitle: 'Whitelabel Feature Locked',
    vipLockDesc: 'Show your agency logo instead of the platform logo on reports.',
    vipUpgradeBtn: 'Upgrade to VIP to Unlock 🔓',
    agencyLabel: 'Firm / Agency Name',
    nameLabel: 'Architect Full Name',
    specialtyLabel: 'Professional Title / Specialty',
    licenseLabel: 'Order / License Number',
    phoneLabel: 'Official Phone Number',
    emailLabel: 'Professional Email',
    addressLabel: 'Official Office Address',
    saveBtn: 'Save Identity',
    savingBtn: 'Saving...',
    successMsg: 'Professional identity updated successfully!',
    errorMsg: 'Failed to save. Reason:',
  }

};

export default function ArchitectProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Stores
  const { lang = 'ar' } = useSettingsStore();
  const { profile, fetchArchitectProfile, updateArchitectProfile } = useArchitectStore();
  const t = translations[lang] || translations.ar;

  // Local Form State
  const [formData, setFormData] = useState({
    agency_name: '',
    full_name: '',
    specialty: '',
    license_number: '',
    phone: '',
    email: '',
    address: '',
    logo_url: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Check VIP status from profile/subscription
  const isVip = profile?.subscription_plan?.toLowerCase() === 'vip';

  // Load profile into form state
  useEffect(() => {
    if (!profile) {
      fetchArchitectProfile();
    } else {
      setFormData({
        agency_name: profile.agency_name || '',
        full_name: profile.full_name || '',
        specialty: profile.specialty || '',
        license_number: profile.license_number || '',
        phone: profile.phone || '',
        email: profile.email || '',
        address: profile.address || '',
        logo_url: profile.logo_url || ''
      });
      setLogoPreview(profile.logo_url || '');
    }
  }, [profile, fetchArchitectProfile]);

  // Handle Text Input Changes
  const handleChange = (e) => {
  const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Logo File Selection
  const handleLogoChange = (e) => {
  const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Upload Logo to Supabase Storage
  const uploadLogo = async (userId) => {
    if (!logoFile) return formData.logo_url;

  const fileExt = logoFile.name.split('.').pop();
  const filePath = `architect_logos/${userId}_${Date.now()}.${fileExt}`;
  const { error: uploadError } = await supabase.storage
      .from('portal_assets')
      .upload(filePath, logoFile, { upsert: true });
    if (uploadError) {
      throw uploadError;
    }
  const { data } = supabase.storage
      .from('portal_assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      let finalLogoUrl = formData.logo_url;

      // Only upload logo if user is VIP and selected a file
      if (isVip && logoFile) {
        finalLogoUrl = await uploadLogo(profile.id);
      }
  const updatedPayload = {
        ...formData,
        logo_url: finalLogoUrl,
        updated_at: new Date().toISOString()
      };

      // Update Database via Store/Supabase
  const { error } = await supabase
        .from('architects')
        .update(updatedPayload)
        .eq('id', profile.id);
      if (error) throw error;

      // Update Zustand local state
      if (updateArchitectProfile) {
        updateArchitectProfile(updatedPayload);
      }
      setStatusMessage({ type: 'success', text: t.successMsg });
    } catch (err) {
      setStatusMessage({ type: 'error', text: `${t.errorMsg} ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-7 h-7 text-indigo-600" />
          {t.pageTitle}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t.pageDesc}</p>
      </div>

      {/* Alert Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Logo Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600" />
                {t.logoTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{t.logoDesc}</p>
            </div>
            {!isVip && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Crown className="w-3.5 h-3.5 text-amber-500" /> VIP
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            <div className="relative w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 group">
              {logoPreview ? (
                <img src={logoPreview} alt="Agency Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Building2 className="w-10 h-10 text-slate-300" />
              )}
            </div>
            <div className="space-y-3 w-full">
              {isVip ? (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                    accept="image/png, image/jpeg"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {t.selectLogoBtn}
                  </button>
                </>
              ) : (

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <Lock className="w-4 h-4 text-amber-500" />
                    {t.vipLockTitle}
                  </div>

                  <p className="text-xs text-slate-500">{t.vipLockDesc}</p>

                  <button
                    type="button"
                    onClick={() => navigate('/subscription')}
                    className="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    {t.vipUpgradeBtn}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Identity Details Fields */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Agency Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {t.agencyLabel}
              </label>

              <input
                type="text"
                name="agency_name"
                value={formData.agency_name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
              />
            </div>

            {/* Architect Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <UserCircle className="w-3.5 h-3.5 text-slate-400" />
                {t.nameLabel}
              </label>

              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
              />
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                {t.specialtyLabel}
              </label>

              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
              />
            </div>

            {/* License Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileBadge className="w-3.5 h-3.5 text-slate-400" />
                {t.licenseLabel}
              </label>

              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {t.phoneLabel}
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {t.emailLabel}
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {t.addressLabel}
            </label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.savingBtn}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t.saveBtn}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}