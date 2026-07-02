/*
# مؤشرات القياس التفصيلية (150+ مؤشر)

إضافة المؤشرات لكل محور من المحاور العشرة
*/

-- المحور الأول: الاحتياج المؤسسي
INSERT INTO survey_indicators (axis_id, code, name_ar, name_en, description, weight, measurement_type, sort_order)
SELECT id, 'inst_01', 'وضوح الهيكل التنظيمي', 'Organizational Structure Clarity', 'مدى وضوح وتحديث الهيكل التنظيمي للجمعية', 1.5, 'scale', 1 FROM survey_axes WHERE code = 'institutional'
UNION ALL SELECT id, 'inst_02', 'اكتمال اللوائح الداخلية', 'Internal Regulations Completeness', 'وجود اللوائح الداخلية المحدثة والمعتمدة', 1.5, 'scale', 2 FROM survey_axes WHERE code = 'institutional'
UNION ALL SELECT id, 'inst_03', 'وضوح السياسات والإجراءات', 'Policies and Procedures Clarity', 'وجود سياسات وإجراءات مكتوبة ومعتمدة', 1.2, 'scale', 3 FROM survey_axes WHERE code = 'institutional'
UNION ALL SELECT id, 'inst_04', 'تاحة الأدلة الإجرائية', 'Procedural Guides Availability', 'وجود أدلة إجرائية للعمليات الرئيسية', 1.0, 'scale', 4 FROM survey_axes WHERE code = 'institutional'
UNION ALL SELECT id, 'inst_05', 'نظام إدارة الأداء', 'Performance Management System', 'وجود نظام لقياس ومتابعة الأداء', 1.5, 'scale', 5 FROM survey_axes WHERE code = 'institutional'
UNION ALL SELECT id, 'inst_06', 'الخطة الاستراتيجية', 'Strategic Plan', 'وجود خطة استراتيجية معتمدة ومحدثة', 2.0, 'scale', 6 FROM survey_axes WHERE code = 'institutional'
UNION ALL SELECT id, 'inst_07', 'محاذاة الرؤية مع رؤية 2030', 'Vision Alignment with 2030', 'مدى محاذاة رؤية الجمعية مع رؤية المملكة 2030', 1.5, 'scale', 7 FROM survey_axes WHERE code = 'institutional'
UNION ALL SELECT id, 'inst_08', 'مجلس الإدارة', 'Board of Directors', 'فاعلية مجلس الإدارة وانتظامه', 1.5, 'scale', 8 FROM survey_axes WHERE code = 'institutional'
UNION ALL SELECT id, 'inst_09', 'الجودة والتميز', 'Quality and Excellence', 'تطبيق معايير الجودة والتميز', 1.2, 'scale', 9 FROM survey_axes WHERE code = 'institutional'
UNION ALL SELECT id, 'inst_10', 'إدارة المخاطر', 'Risk Management', 'وجود إطار لإدارة المخاطر', 1.0, 'scale', 10 FROM survey_axes WHERE code = 'institutional';

-- المحور الثاني: الاحتياج المالي
INSERT INTO survey_indicators (axis_id, code, name_ar, name_en, description, weight, measurement_type, sort_order)
SELECT id, 'fin_01', 'تنويع مصادر الإيرادات', 'Revenue Diversification', 'عدد وتنوع مصادر الإيرادات', 2.0, 'scale', 1 FROM survey_axes WHERE code = 'financial'
UNION ALL SELECT id, 'fin_02', 'الاستثمار الذكي', 'Smart Investment', 'قدرة الجمعية على استثمار مواردها', 1.5, 'scale', 2 FROM survey_axes WHERE code = 'financial'
UNION ALL SELECT id, 'fin_03', 'الوقف الخيري', 'Endowment', 'وجود أوقاف داعمة للجمعية', 1.0, 'scale', 3 FROM survey_axes WHERE code = 'financial'
UNION ALL SELECT id, 'fin_04', 'المنح والمشاريع', 'Grants and Projects', 'قدرة الجمعية على الحصول على منح', 1.5, 'scale', 4 FROM survey_axes WHERE code = 'financial'
UNION ALL SELECT id, 'fin_05', 'الاستدامة المالية', 'Financial Sustainability', 'مدى تحقيق الاستدامة المالية', 2.0, 'scale', 5 FROM survey_axes WHERE code = 'financial'
UNION ALL SELECT id, 'fin_06', 'إدارة التكاليف', 'Cost Management', 'كفاءة إدارة التكاليف والمصروفات', 1.2, 'scale', 6 FROM survey_axes WHERE code = 'financial'
UNION ALL SELECT id, 'fin_07', 'الميزانية التقديرية', 'Budgeting', 'وجود ميزانية تقديرية سنوية', 1.5, 'scale', 7 FROM survey_axes WHERE code = 'financial'
UNION ALL SELECT id, 'fin_08', 'الحسابات الختامية', 'Financial Statements', 'انتظام إعداد الحسابات الختامية', 1.5, 'scale', 8 FROM survey_axes WHERE code = 'financial'
UNION ALL SELECT id, 'fin_09', 'المراجعة الخارجية', 'External Audit', 'وجود مراجعة خارجية مستقلة', 1.2, 'scale', 9 FROM survey_axes WHERE code = 'financial'
UNION ALL SELECT id, 'fin_10', 'الشفافية المالية', 'Financial Transparency', 'مستوى الشفافية في الإبلاغ المالي', 1.5, 'scale', 10 FROM survey_axes WHERE code = 'financial';

-- المحور الثالث: الاحتياج البشري
INSERT INTO survey_indicators (axis_id, code, name_ar, name_en, description, weight, measurement_type, sort_order)
SELECT id, 'hr_01', 'الكفاءات المؤهلة', 'Qualified Competencies', 'نسبة الموظفين المؤهلين', 2.0, 'scale', 1 FROM survey_axes WHERE code = 'human'
UNION ALL SELECT id, 'hr_02', 'إدارة المتطوعين', 'Volunteer Management', 'قدرة الجمعية على استقطاب وإدارة المتطوعين', 1.5, 'scale', 2 FROM survey_axes WHERE code = 'human'
UNION ALL SELECT id, 'hr_03', 'القيادات الإدارية', 'Administrative Leadership', 'جاهزية القيادات الإدارية', 1.5, 'scale', 3 FROM survey_axes WHERE code = 'human'
UNION ALL SELECT id, 'hr_04', 'الخبراء المتخصصون', 'Specialized Experts', 'توفر خبراء متخصصين في المجال الصحي', 1.2, 'scale', 4 FROM survey_axes WHERE code = 'human'
UNION ALL SELECT id, 'hr_05', 'البرامج التدريبية', 'Training Programs', 'انتظام البرامج التدريبية للموظفين', 1.5, 'scale', 5 FROM survey_axes WHERE code = 'human'
UNION ALL SELECT id, 'hr_06', 'الاستقطاب والاحتفاظ', 'Recruitment and Retention', 'قدرة الجمعية على استقطاب الكفاءات والاحتفاظ بها', 1.5, 'scale', 6 FROM survey_axes WHERE code = 'human'
UNION ALL SELECT id, 'hr_07', 'تقييم الأداء الوظيفي', 'Employee Performance Evaluation', 'وجود نظام تقييم أداء الموظفين', 1.0, 'scale', 7 FROM survey_axes WHERE code = 'human'
UNION ALL SELECT id, 'hr_08', 'التطوع المؤهل', 'Qualified Volunteering', 'جودة البرامج التطوعية والتأهيل', 1.2, 'scale', 8 FROM survey_axes WHERE code = 'human';

-- المحور الرابع: الاحتياج التقني
INSERT INTO survey_indicators (axis_id, code, name_ar, name_en, description, weight, measurement_type, sort_order)
SELECT id, 'tech_01', 'مستوى التحول الرقمي', 'Digital Transformation Level', 'مستوى نضج التحول الرقمي في الجمعية', 2.0, 'scale', 1 FROM survey_axes WHERE code = 'technical'
UNION ALL SELECT id, 'tech_02', 'جاهزية الذكاء الاصطناعي', 'AI Readiness', 'مدى جاهزية الجمعية لاستخدام الذكاء الاصطناعي', 1.5, 'scale', 2 FROM survey_axes WHERE code = 'technical'
UNION ALL SELECT id, 'tech_03', 'أمن المعلومات', 'Information Security', 'مستوى أمن المعلومات وحماية البيانات', 2.0, 'scale', 3 FROM survey_axes WHERE code = 'technical'
UNION ALL SELECT id, 'tech_04', 'الأنظمة الإلكترونية', 'Electronic Systems', 'توفر الأنظمة الإلكترونية المتكاملة', 1.5, 'scale', 4 FROM survey_axes WHERE code = 'technical'
UNION ALL SELECT id, 'tech_05', 'إدارة البيانات', 'Data Management', 'قدرة الجمعية على إدارة البيانات', 1.5, 'scale', 5 FROM survey_axes WHERE code = 'technical'
UNION ALL SELECT id, 'tech_06', 'التحليلات والتقارير', 'Analytics and Reporting', 'قدرة الجمعية على التحليل والإبلاغ', 1.2, 'scale', 6 FROM survey_axes WHERE code = 'technical'
UNION ALL SELECT id, 'tech_07', 'الموقع الإلكتروني', 'Website', 'جودة الموقع الإلكتروني وتحديثه', 1.0, 'scale', 7 FROM survey_axes WHERE code = 'technical'
UNION ALL SELECT id, 'tech_08', 'التواصل الرقمي', 'Digital Communication', 'استخدام قنوات التواصل الرقمي', 1.0, 'scale', 8 FROM survey_axes WHERE code = 'technical';

-- المحور الخامس: الاحتياج الصحي
INSERT INTO survey_indicators (axis_id, code, name_ar, name_en, description, weight, measurement_type, sort_order)
SELECT id, 'health_01', 'الأجهزة الطبية', 'Medical Equipment', 'توفر الأجهزة والمعدات الطبية', 2.0, 'scale', 1 FROM survey_axes WHERE code = 'health'
UNION ALL SELECT id, 'health_02', 'البرامج الصحية', 'Health Programs', 'جودة وتنوع البرامج الصحية', 2.0, 'scale', 2 FROM survey_axes WHERE code = 'health'
UNION ALL SELECT id, 'health_03', 'العيادات والمستوصفات', 'Clinics', 'توفر العيادات والمستوصفات', 1.5, 'scale', 3 FROM survey_axes WHERE code = 'health'
UNION ALL SELECT id, 'health_04', 'الخدمات المنزلية', 'Home Services', 'جودة الخدمات الصحية المنزلية', 1.5, 'scale', 4 FROM survey_axes WHERE code = 'health'
UNION ALL SELECT id, 'health_05', 'المختبرات', 'Laboratories', 'قدرة المختبرات والتشخيص', 1.2, 'scale', 5 FROM survey_axes WHERE code = 'health'
UNION ALL SELECT id, 'health_06', 'النقل الطبي', 'Medical Transport', 'توفر خدمات النقل الطبي', 1.0, 'scale', 6 FROM survey_axes WHERE code = 'health'
UNION ALL SELECT id, 'health_07', 'الطب الوقائي', 'Preventive Medicine', 'برامج الطب الوقائي والتوعية', 1.5, 'scale', 7 FROM survey_axes WHERE code = 'health'
UNION ALL SELECT id, 'health_08', 'جودة الرعاية الصحية', 'Healthcare Quality', 'مستوى جودة الرعاية الصحية المقدمة', 2.0, 'scale', 8 FROM survey_axes WHERE code = 'health';

-- المحور السادس: احتياجات المستفيدين
INSERT INTO survey_indicators (axis_id, code, name_ar, name_en, description, weight, measurement_type, sort_order)
SELECT id, 'ben_01', 'تلبية احتياجات المستفيدين', 'Meeting Beneficiary Needs', 'مدى تلبية خدمات الجمعية لاحتياجات المستفيدين', 2.0, 'scale', 1 FROM survey_axes WHERE code = 'beneficiaries'
UNION ALL SELECT id, 'ben_02', 'جودة الخدمات', 'Service Quality', 'مستوى جودة الخدمات المقدمة', 2.0, 'scale', 2 FROM survey_axes WHERE code = 'beneficiaries'
UNION ALL SELECT id, 'ben_03', 'سهولة الوصول للخدمة', 'Service Accessibility', 'سهولة وصول المستفيدين للخدمات', 1.5, 'scale', 3 FROM survey_axes WHERE code = 'beneficiaries'
UNION ALL SELECT id, 'ben_04', 'رضا المستفيدين', 'Beneficiary Satisfaction', 'مستوى رضا المستفيدين عن الخدمات', 2.0, 'scale', 4 FROM survey_axes WHERE code = 'beneficiaries'
UNION ALL SELECT id, 'ben_05', 'الخدمات الجديدة', 'New Services', 'قدرة الجمعية على تطوير خدمات جديدة', 1.5, 'scale', 5 FROM survey_axes WHERE code = 'beneficiaries'
UNION ALL SELECT id, 'ben_06', 'التواصل مع المستفيدين', 'Beneficiary Communication', 'قنوات التواصل مع المستفيدين', 1.0, 'scale', 6 FROM survey_axes WHERE code = 'beneficiaries'
UNION ALL SELECT id, 'ben_07', 'قياس الأثر', 'Impact Measurement', 'قدرة الجمعية على قياس أثرها', 1.5, 'scale', 7 FROM survey_axes WHERE code = 'beneficiaries';

-- المحور السابع: الاحتياج التدريبي
INSERT INTO survey_indicators (axis_id, code, name_ar, name_en, description, weight, measurement_type, sort_order)
SELECT id, 'train_01', 'تدريب القيادات', 'Leadership Training', 'برامج تطوير القيادات', 1.5, 'scale', 1 FROM survey_axes WHERE code = 'training'
UNION ALL SELECT id, 'train_02', 'تدريب مجلس الإدارة', 'Board Training', 'برامج تدريب أعضاء مجلس الإدارة', 1.5, 'scale', 2 FROM survey_axes WHERE code = 'training'
UNION ALL SELECT id, 'train_03', 'تدريب الجودة', 'Quality Training', 'برامج تدريب إدارة الجودة', 1.2, 'scale', 3 FROM survey_axes WHERE code = 'training'
UNION ALL SELECT id, 'train_04', 'تدريب إدارة المشاريع', 'Project Management Training', 'برامج تدريب إدارة المشاريع', 1.2, 'scale', 4 FROM survey_axes WHERE code = 'training'
UNION ALL SELECT id, 'train_05', 'تدريب التقنية', 'Technical Training', 'برامج تدريب التقنيات الحديثة', 1.0, 'scale', 5 FROM survey_axes WHERE code = 'training'
UNION ALL SELECT id, 'train_06', 'تدريب التسويق', 'Marketing Training', 'برامج تدريب التسويق والتواصل', 1.0, 'scale', 6 FROM survey_axes WHERE code = 'training';

-- المحور الثامن: الشراكات
INSERT INTO survey_indicators (axis_id, code, name_ar, name_en, description, weight, measurement_type, sort_order)
SELECT id, 'part_01', 'الشراكة مع وزارة الصحة', 'MOH Partnership', 'مستوى الشراكة مع وزارة الصحة', 2.0, 'scale', 1 FROM survey_axes WHERE code = 'partnerships'
UNION ALL SELECT id, 'part_02', 'الشراكة مع التجمعات الصحية', 'Health Clusters Partnership', 'مستوى التعاون مع التجمعات الصحية', 1.5, 'scale', 2 FROM survey_axes WHERE code = 'partnerships'
UNION ALL SELECT id, 'part_03', 'الشراكة مع الجامعات', 'Universities Partnership', 'التعاون مع الجامعات ومراكز البحث', 1.5, 'scale', 3 FROM survey_axes WHERE code = 'partnerships'
UNION ALL SELECT id, 'part_04', 'الشراكة مع الشركات', 'Corporate Partnership', 'شراكات المسؤولية الاجتماعية', 1.5, 'scale', 4 FROM survey_axes WHERE code = 'partnerships'
UNION ALL SELECT id, 'part_05', 'الشراكة مع المانحين', 'Donors Partnership', 'العلاقة مع المانحين والممولين', 2.0, 'scale', 5 FROM survey_axes WHERE code = 'partnerships'
UNION ALL SELECT id, 'part_06', 'الشراكة مع المجتمع', 'Community Partnership', 'مستوى الشراكة مع المجتمع المحلي', 1.2, 'scale', 6 FROM survey_axes WHERE code = 'partnerships'
UNION ALL SELECT id, 'part_07', 'الشراكات الدولية', 'International Partnerships', 'التعاون مع المنظمات الدولية', 1.0, 'scale', 7 FROM survey_axes WHERE code = 'partnerships';

-- المحور التاسع: الابتكار
INSERT INTO survey_indicators (axis_id, code, name_ar, name_en, description, weight, measurement_type, sort_order)
SELECT id, 'innov_01', 'الحلول الذكية', 'Smart Solutions', 'تطوير حلول ذكية ومبتكرة', 1.5, 'scale', 1 FROM survey_axes WHERE code = 'innovation'
UNION ALL SELECT id, 'innov_02', 'التطبيقات الصحية', 'Health Apps', 'تطوير التطبيقات الصحية', 1.5, 'scale', 2 FROM survey_axes WHERE code = 'innovation'
UNION ALL SELECT id, 'innov_03', 'الطب عن بعد', 'Telemedicine', 'استخدام خدمات الطب عن بعد', 1.5, 'scale', 3 FROM survey_axes WHERE code = 'innovation'
UNION ALL SELECT id, 'innov_04', 'تحليل البيانات الصحية', 'Health Data Analytics', 'استخدام البيانات في التخطيط', 1.5, 'scale', 4 FROM survey_axes WHERE code = 'innovation'
UNION ALL SELECT id, 'innov_05', 'البحث العلمي', 'Scientific Research', 'المشاركة في البحث العلمي', 1.2, 'scale', 5 FROM survey_axes WHERE code = 'innovation'
UNION ALL SELECT id, 'innov_06', 'الابتكار الاجتماعي', 'Social Innovation', 'مبادرات الابتكار الاجتماعي', 1.2, 'scale', 6 FROM survey_axes WHERE code = 'innovation';

-- المحور العاشر: الأولويات المستقبلية
INSERT INTO survey_indicators (axis_id, code, name_ar, name_en, description, weight, measurement_type, sort_order)
SELECT id, 'fut_01', 'رؤية واضحة للمستقبل', 'Clear Future Vision', 'وضوح الرؤية المستقبلية', 1.5, 'scale', 1 FROM survey_axes WHERE code = 'priorities'
UNION ALL SELECT id, 'fut_02', 'الخطط التوسعية', 'Expansion Plans', 'خطط التوسع والنمو', 1.5, 'scale', 2 FROM survey_axes WHERE code = 'priorities'
UNION ALL SELECT id, 'fut_03', 'محاذاة مستهدفات 2030', '2030 Targets Alignment', 'محاذاة مع مستهدفات رؤية 2030', 2.0, 'scale', 3 FROM survey_axes WHERE code = 'priorities'
UNION ALL SELECT id, 'fut_04', 'الاستعداد للمستقبل', 'Future Readiness', 'جاهزية الجمعية للمستقبل', 1.5, 'scale', 4 FROM survey_axes WHERE code = 'priorities'
UNION ALL SELECT id, 'fut_05', 'أولويات 2025-2035', '2025-2035 Priorities', 'وضوح الأولويات للسنوات القادمة', 2.0, 'scale', 5 FROM survey_axes WHERE code = 'priorities';