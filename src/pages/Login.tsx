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

const Login = () => {
  const { t } = useLanguage();
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('login');

  const handleLogin = async (role: 'admin' | 'supervisor') => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    } else if (!password) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login successful!');
        navigate(user?.role === 'admin' ? "/my-stats" : '/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    if (!name) {
      toast.error('Please enter your name');
      return;
    }
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const success = await signup(email, password, name, role);
      if (success) {
        toast.success('Signup successful!');
        // await createUser(success)
        navigate(role === 'admin' ? '/dashboard' : '/task-entry');
      }
      console.log(success)
    } catch (error) {
      toast.error('Signup failed');
    } finally {
      setLoading(false);
    }
  };

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
                <p className="font-semibold">{t('nav.supervisorTracking')}</p>
                <p className="text-sm opacity-80">{t('nav.monitorHourlyTask')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-white/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">{t("nav.performanceEv")}</p>
                <p className="text-sm opacity-80">{t("nav.dataDriven")}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm opacity-60">
          {t("nav.allRight")}
        </p>
      </div>

      <div>

      </div>

      {/* Right Panel - Login Form */}
      <div className="lg:flex-1 flex items-center justify-center p-8 bg-background">
        {
          status === "login" ? (
            <Card className="w-full max-w-md glass-card animate-scale-in">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold">{t('auth.welcome')}</CardTitle>
                <CardDescription>{t('auth.signin')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{t('auth.password')}</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* <p className="text-sm text-muted-foreground text-center">
                      {t('auth.selectRole')}
                    </p> */}
                    <Tabs defaultValue="supervisor" className="w-full">
                      {/* <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="supervisor" className="gap-2">
                          <Users className="w-4 h-4" />
                          {t('auth.supervisor')}
                        </TabsTrigger>
                        <TabsTrigger value="admin" className="gap-2">
                          <Shield className="w-4 h-4" />
                          {t('auth.admin')}
                        </TabsTrigger>
                      </TabsList> */}
                      <TabsContent value="supervisor" className="mt-4">
                        <Button
                          className="w-full h-12 gradient-primary text-primary-foreground font-semibold"
                          onClick={() => handleLogin('supervisor')}
                          disabled={loading}
                        >
                          {loading ? 'Logging in...' : t('auth.login')}
                        </Button>
                      </TabsContent>
                      <TabsContent value="admin" className="mt-4">
                        <Button
                          className="w-full h-12 gradient-primary text-primary-foreground font-semibold"
                          onClick={() => handleLogin('admin')}
                          disabled={loading}
                        >
                          {loading ? 'Logging in...' : t('auth.login')}
                        </Button>
                      </TabsContent>
                    </Tabs>
                    <p className="text-sm opacity-60">
                      {t('auth.dontHaveAccount')} <button onClick={() => setStatus("signup")}>{t('auth.signupnow')}</button>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full max-w-md glass-card animate-scale-in">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold">{t('auth.welcome')}</CardTitle>
                <CardDescription>{t('auth.signin')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('auth.name')}</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Ahmed Atif ..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{t('auth.password')}</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      {t('auth.selectRole')}
                    </p>
                    <Tabs defaultValue="supervisor" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="supervisor" className="gap-2" onClick={() => setRole('supervisor')} >
                          <Users className="w-4 h-4" />
                          {t('auth.supervisor')}
                        </TabsTrigger>
                        <TabsTrigger value="admin" className="gap-2" onClick={() => setRole('admin')}>
                          <Shield className="w-4 h-4" />
                          {t('auth.admin')}
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="supervisor" className="mt-4">
                        <Button
                          className="w-full h-12 gradient-primary text-primary-foreground font-semibold"
                          onClick={() => handleSignup()}
                          disabled={loading}
                        >
                          {loading ? 'Signing up ...' : t('auth.signup')}
                        </Button>
                      </TabsContent>
                      <TabsContent value="admin" className="mt-4">
                        <Button
                          className="w-full h-12 gradient-primary text-primary-foreground font-semibold"
                          onClick={() => handleSignup()}
                          disabled={loading}
                        >
                          {loading ? 'Signing up...' : t('auth.signup')}
                        </Button>
                      </TabsContent>
                    </Tabs>
                    <p className="text-sm opacity-60">
                      {t('auth.haveAccount')} <button onClick={() => setStatus("login")}>{t('auth.loginNow')}</button>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        }


      </div>

    </div>
  );
};

export default Login;
