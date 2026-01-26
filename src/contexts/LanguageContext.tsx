import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'app.title': 'Supervisor Task Tracker',
    'app.subtitle': 'Track hourly tasks and generate performance evaluations',
    'nav.dashboard': 'Dashboard',
    'nav.entry': 'Task Entry',
    'nav.myStats': 'My Statistics',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    "nav.supervisorTracking": "Supervisor Tracking",
    "nav.monitorHourlyTask": "Monitor hourly task progress",
    "nav.performanceEv": "Performance Evaluation",
    "nav.dataDriven": "Data-driven insights & rankings",
    "nav.allRight": " © 2026 Task Tracker. All rights reserved.",

    // Auth
    'auth.welcome': 'Welcome Back',
    'auth.signin': 'Sign in to your account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login': 'Login',
    'auth.signup': 'Sign up',
    'auth.supervisor': 'Supervisor',
    'auth.admin': 'Admin',
    'auth.selectRole': 'Select your role',
    "auth.signupnow": 'Sign up now',
    "auth.dontHaveAccount": "Don't have an account",


    "supervisor.name": "Supervisor Name",
    "supervisor.email": "Supervisor Email",
    "Ename": "Enter name...",
    "Emname": "Enter email...",
    "cancel": "cancel",
    "add": "Add",
    "Addanew": "Add a new supervisor to the system",


    // Task Entry
    'task.entry': 'Task Entry',
    'task.date': 'Date',
    'task.timeFrom': 'From',
    'task.timeTo': 'To',
    'task.count': 'Tasks Completed',
    'task.description': 'Description',
    'task.submit': 'Submit Task',
    'task.success': 'Task submitted successfully!',
    'task.today': "Today's Tasks",
    'task.weekly': 'Weekly Tasks',
    'task.monthly': 'Monthly Tasks',
    'task.supervisor': 'Supervisor',
    'task.selectSupervisorPlaceholder': 'Select a supervisor...',
    'task.type': 'Task Type',
    'task.per': "per task",
    'task.adminEntryDesc': 'Enter task data for supervisors',
    'task.recentEntries': 'Recent Entries',
    'task.fillRequired': 'Please fill in all required fields',
    'task.descriptionPlaceholder': 'Describe the tasks completed...',
    "task.selectSupervisor": "Select a supervisor",
    "task.selectTaskTypePlaceholder": "Select a task type",
    "task.points": "Points",

    // Supervisor view
    'supervisor.myStats': 'My Statistics',
    'supervisor.viewOnlyDesc': 'View your task performance and history',
    'supervisor.taskHistory': 'Task History',
    'supervisor.noTasks': 'No tasks recorded yet',
    'supervisor.adminWillAdd': 'The admin will add your task data',
    "actions": "Actions",

    // Dashboard
    'dashboard.title': 'Performance Dashboard',
    'Monitor.supervisor ': 'Monitor supervisor performance and task completion',
    'dashboard.rankings': 'Supervisor Rankings',
    'dashboard.filter': 'Filter by Period',
    'dashboard.daily': 'Daily',
    'dashboard.weekly': 'Weekly',
    'dashboard.monthly': 'Monthly',
    'dashboard.all': 'All Time',
    'dashboard.rank': 'Rank',
    'dashboard.name': 'Name',
    'dashboard.tasks': 'Tasks',
    'dashboard.performance': 'Performance',
    'dashboard.totalTasks': 'Total Tasks',
    'dashboard.totalPoints': 'Total Points',
    'dashboard.avgDaily': 'Avg Daily',
    'dashboard.topPerformer': 'Top Performer',
    'dashboard.supervisors': 'Supervisors',
    'supervisor.add': 'Add Supervisors',

    // Stats
    'stats.hourly': 'Hourly Tasks',
    'stats.daily': 'Daily Tasks',
    'stats.weekly': 'Weekly Tasks',
    'stats.monthly': 'Monthly Tasks',
    "recent.activity": "النشاط الأخير",
    "tasks": "tasks",

    // Supervisor Detail
    'supervisorDetail.backToDashboard': 'Back to Dashboard',
    'supervisorDetail.notFound': 'Supervisor not found',
    'supervisorDetail.totalTasks': 'Total Tasks',
    'supervisorDetail.daysWorked': 'Days Worked',
    'supervisorDetail.avgPerDay': 'Avg Tasks/Day',
    'supervisorDetail.allTasks': 'All Tasks',
    'supervisorDetail.timeRange': 'Time Range',
    'supervisorDetail.noDescription': 'No description',
    'dashboard.clickToView': 'Click to view details',
  },
  ar: {
    // Common
    'app.title': 'متتبع مهام المشرفين',
    'app.subtitle': 'تتبع المهام بالساعة وإنشاء تقييمات الأداء',
    'nav.dashboard': 'لوحة التحكم',
    'nav.entry': 'إدخال المهام',
    'nav.myStats': 'إحصائياتي',
    'nav.logout': 'تسجيل الخروج',
    'nav.login': 'تسجيل الدخول',
    "nav.supervisorTracking": "متابعة المشرف",
    "nav.monitorHourlyTask": "مراقبة تقدم المهام كل ساعة",
    "nav.performanceEv": "تقييم الأداء",
    "nav.dataDriven": "رؤى وتصنيفات مبنية على البيانات",
    "nav.allRight": "© ٢٠٢٦ Task Tracker. جميع الحقوق محفوظة.",

    // Auth
    'auth.welcome': 'مرحباً بعودتك',
    'auth.signin': 'سجل دخول إلى حسابك',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.login': 'تسجيل الدخول',
    'auth.signup': 'إنشاء حساب',
    'auth.supervisor': 'مشرف',
    'auth.admin': 'مدير',
    'auth.selectRole': 'اختر دورك',
    "auth.signupnow": 'سجل الآن',
    "auth.dontHaveAccount": "لا تمتلك حساب ؟",

    "supervisor.name": "اسم المشرف",
    "supervisor.email": "البريد الإلكتروني للمشرف",
    "Ename": "أدخل الاسم...",
    "Emname": "أدخل البريد الالكتروني...",
    "cancel": "إلغاء",
    "add": "إضافة",
    "Addanew": "أضف مشرفًا جديدًا إلى النظام.",

    // Task Entry
    'task.entry': 'إدخال المهام',
    'task.date': 'التاريخ',
    'task.timeFrom': 'من',
    'task.timeTo': 'إلى',
    'task.count': 'المهام المنجزة',
    'task.description': 'الوصف',
    'task.submit': 'إرسال المهمة',
    'task.success': 'تم إرسال المهمة بنجاح!',
    'task.today': 'مهام اليوم',
    'task.weekly': 'مهام الأسبوع',
    'task.monthly': 'مهام الشهر',
    'task.supervisor': 'المشرف',
    'task.type': 'نوع المهمة',
    'task.per': "لكل مهمة",
    'task.selectSupervisorPlaceholder': 'اختر مشرفاً...',
    'task.adminEntryDesc': 'أدخل بيانات المهام للمشرفين',
    'task.recentEntries': 'الإدخالات الأخيرة',
    'task.fillRequired': 'يرجى ملء جميع الحقول المطلوبة',
    'task.descriptionPlaceholder': 'صف المهام المنجزة...',
    "task.selectSupervisor": "اختر مشرفًا",
    "task.selectTaskTypePlaceholder": "اختر نوع المهمة...",
    "task.points": "نقاط المهمة",

    // Supervisor view
    'supervisor.myStats': 'إحصائياتي',
    'supervisor.viewOnlyDesc': 'عرض أداء مهامك وسجلها',
    'supervisor.taskHistory': 'سجل المهام',
    'supervisor.noTasks': 'لم يتم تسجيل مهام بعد',
    'supervisor.adminWillAdd': 'سيقوم المدير بإضافة بيانات مهامك',
    "actions": "الإجراءات",

    // Dashboard
    'dashboard.title': 'لوحة الأداء',
    'Monitor.supervisor': "مراقبة أداء المشرف وإنجاز المهام",
    'dashboard.rankings': 'ترتيب المشرفين',
    'dashboard.filter': 'تصفية حسب الفترة',
    'dashboard.daily': 'يومي',
    'dashboard.weekly': 'أسبوعي',
    'dashboard.monthly': 'شهري',
    'dashboard.all': 'الكل',
    'dashboard.rank': 'الترتيب',
    'dashboard.name': 'الاسم',
    'dashboard.tasks': 'المهام',
    'dashboard.performance': 'الأداء',
    'dashboard.totalPoints': 'إجمالي النقاط',
    'dashboard.totalTasks': 'إجمالي المهام',
    'dashboard.avgDaily': 'المعدل اليومي',
    'dashboard.topPerformer': 'الأفضل أداءً',
    'dashboard.supervisors': 'المشرفين',
    'supervisor.add': 'إضافة مشرفين',

    // Stats
    'stats.hourly': 'المهام بالساعة',
    'stats.daily': 'المهام اليومية',
    'stats.weekly': 'المهام الأسبوعية',
    'stats.monthly': 'المهام الشهرية',

    "recent.activity": "النشاط الأخير",
    "tasks": "مهمات",

    // Supervisor Detail
    'supervisorDetail.backToDashboard': 'العودة إلى لوحة التحكم',
    'supervisorDetail.notFound': 'لم يتم العثور على المشرف',
    'supervisorDetail.totalTasks': 'إجمالي المهام',
    'supervisorDetail.daysWorked': 'أيام العمل',
    'supervisorDetail.avgPerDay': 'معدل المهام/اليوم',
    'supervisorDetail.allTasks': 'جميع المهام',
    'supervisorDetail.timeRange': 'الفترة الزمنية',
    'supervisorDetail.noDescription': 'لا يوجد وصف',
    'dashboard.clickToView': 'انقر لعرض التفاصيل',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};