import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardCheck, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';

const Signup = () => {
    const { t } = useLanguage();
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);


    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Panel - Hero */}
            <div className="lg:flex-1 gradient-hero p-8 lg:p-16 flex flex-col justify-between text-primary-foreground">
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <ClipboardCheck className="w-10 h-10" />
                        <span className="text-2xl font-bold">{t('app.title')}</span>
                    </div>
                    <div className="absolute top-4 end-4 lg:end-auto lg:start-4">
                        <LanguageToggle />
                    </div>
                </div>

                <div className="space-y-8 max-w-lg">
                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                        {t('app.subtitle')}
                    </h1>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                            <div className="p-2 rounded-lg bg-white/20">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold">Supervisor Tracking</p>
                                <p className="text-sm opacity-80">Monitor hourly task progress</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                            <div className="p-2 rounded-lg bg-white/20">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold">Performance Evaluation</p>
                                <p className="text-sm opacity-80">Data-driven insights & rankings</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-sm opacity-60">
                    © 2024 Task Tracker. All rights reserved.
                </p>
            </div>

            {/* Right Panel - Signup Form */}

        </div>
    );
};

export default Signup;
