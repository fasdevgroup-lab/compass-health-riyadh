import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, AssociationCategory } from '../lib/supabase';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function Settings() {
  const { association, refreshAssociation } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<AssociationCategory[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    license_number: '',
    category_id: '',
    establishment_year: '',
    city: 'الرياض',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    employee_count: '',
    volunteer_count: '',
    beneficiary_count: '',
    annual_budget: ''
  });

  useEffect(() => {
    loadCategories();
    if (association) {
      setFormData({
        name: association.name || '',
        license_number: association.license_number || '',
        category_id: association.category_id || '',
        establishment_year: association.establishment_year?.toString() || '',
        city: association.city || 'الرياض',
        address: association.address || '',
        phone: association.phone || '',
        email: association.email || '',
        website: association.website || '',
        description: association.description || '',
        employee_count: association.employee_count?.toString() || '',
        volunteer_count: association.volunteer_count?.toString() || '',
        beneficiary_count: association.beneficiary_count?.toString() || '',
        annual_budget: association.annual_budget?.toString() || ''
      });
    }
  }, [association]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('association_categories')
      .select('*')
      .order('sort_order');
    if (data) setCategories(data);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!association) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updates: Record<string, unknown> = {
        name: formData.name,
        license_number: formData.license_number || null,
        category_id: formData.category_id || null,
        establishment_year: formData.establishment_year ? parseInt(formData.establishment_year) : null,
        city: formData.city,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        description: formData.description || null,
        employee_count: formData.employee_count ? parseInt(formData.employee_count) : null,
        volunteer_count: formData.volunteer_count ? parseInt(formData.volunteer_count) : null,
        beneficiary_count: formData.beneficiary_count ? parseInt(formData.beneficiary_count) : null,
        annual_budget: formData.annual_budget ? parseFloat(formData.annual_budget) : null,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('associations')
        .update(updates)
        .eq('id', association.id);

      if (updateError) throw updateError;

      await refreshAssociation();
      setSuccess(true);
    } catch {
      setError('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">إعدادات الجمعية</h1>
        <p className="text-slate-400">إدارة معلومات الجمعية الأساسية</p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          المعلومات الأساسية
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">اسم الجمعية *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="اسم الجمعية الرسمي"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">رقم الترخيص</label>
            <input
              type="text"
              value={formData.license_number}
              onChange={(e) => handleChange('license_number', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="رقم ترخيص الجمعية"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">تصنيف الجمعية</label>
            <select
              value={formData.category_id}
              onChange={(e) => handleChange('category_id', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="" className="bg-slate-800">اختر التصنيف</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-800">
                  {cat.name_ar}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">سنة التأسيس</label>
            <input
              type="number"
              value={formData.establishment_year}
              onChange={(e) => handleChange('establishment_year', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="2020"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">المدينة</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="المدينة"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 text-sm mb-2">العنوان</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              placeholder="العنوان التفصيلي للجمعية"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Phone className="w-5 h-5 text-emerald-400" />
          معلومات التواصل
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">رقم الهاتف</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="+966 XX XXX XXXX"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="email@example.com"
              dir="ltr"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 text-sm mb-2">الموقع الإلكتروني</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="https://example.com"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          المعلومات الإحصائية
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">عدد الموظفين</label>
            <input
              type="number"
              value={formData.employee_count}
              onChange={(e) => handleChange('employee_count', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="50"
              min="0"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">عدد المتطوعين</label>
            <input
              type="number"
              value={formData.volunteer_count}
              onChange={(e) => handleChange('volunteer_count', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="100"
              min="0"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">عدد المستفيدين</label>
            <input
              type="number"
              value={formData.beneficiary_count}
              onChange={(e) => handleChange('beneficiary_count', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="1000"
              min="0"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">الميزانية السنوية (ريال)</label>
            <input
              type="number"
              value={formData.annual_budget}
              onChange={(e) => handleChange('annual_budget', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="1000000"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">نبذة عن الجمعية</h2>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
          placeholder="وصف مختصر عن الجمعية وأهدافها وخدماتها..."
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 mb-6">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 mb-6">
          <CheckCircle2 className="w-5 h-5" />
          <span>تم حفظ التغييرات بنجاح</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !formData.name}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>حفظ التغييرات</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
