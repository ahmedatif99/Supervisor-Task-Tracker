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
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    
    // Auth
    'auth.welcome': 'Welcome Back',
    'auth.signin': 'Sign in to your account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login': 'Login',
    'auth.supervisor': 'Supervisor',
    'auth.admin': 'Admin',
    'auth.selectRole': 'Select your role',
    
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
    
    // Dashboard
    'dashboard.title': 'Performance Dashboard',
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
    'dashboard.avgDaily': 'Avg Daily',
    'dashboard.topPerformer': 'Top Performer',
    'dashboard.supervisors': 'Supervisors',
    
    // Stats
    'stats.hourly': 'Hourly Tasks',
    'stats.daily': 'Daily Tasks',
    'stats.weekly': 'Weekly Tasks',
    'stats.monthly': 'Monthly Tasks',
  },
  ar: {
    // Common
    'app.title': 'متتبع مهام المشرفين',
    'app.subtitle': 'تتبع المهام بالساعة وإنشاء تقييمات الأداء',
    'nav.dashboard': 'لوحة التحكم',
    'nav.entry': 'إدخال المهام',
    'nav.logout': 'تسجيل الخروج',
    'nav.login': 'تسجيل الدخول',
    
    // Auth
    'auth.welcome': 'مرحباً بعودتك',
    'auth.signin': 'سجل دخول إلى حسابك',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.login': 'تسجيل الدخول',
    'auth.supervisor': 'مشرف',
    'auth.admin': 'مدير',
    'auth.selectRole': 'اختر دورك',
    
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
    
    // Dashboard
    'dashboard.title': 'لوحة الأداء',
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
    'dashboard.totalTasks': 'إجمالي المهام',
    'dashboard.avgDaily': 'المعدل اليومي',
    'dashboard.topPerformer': 'الأفضل أداءً',
    'dashboard.supervisors': 'المشرفين',
    
    // Stats
    'stats.hourly': 'المهام بالساعة',
    'stats.daily': 'المهام اليومية',
    'stats.weekly': 'المهام الأسبوعية',
    'stats.monthly': 'المهام الشهرية',
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
