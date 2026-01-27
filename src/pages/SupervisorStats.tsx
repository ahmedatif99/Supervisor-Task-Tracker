import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/contexts/TaskContext';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, TrendingUp, CalendarDays, BarChart3, Calendar } from 'lucide-react';

const SupervisorStats = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { getSupervisorTasks, supervisors } = useTasks();

    // Find the supervisor that matches the logged-in user (by email)
    const matchedSupervisor = supervisors.find(s => s.email === user?.email);
    const supervisorId = matchedSupervisor?.id || user?.id || '';
    const supervisorTasks = getSupervisorTasks(supervisorId);

    const todayTasks = supervisorTasks
        .filter(t => t.date.toString().split('T')[0] === new Date().toISOString().split('T')[0])
        .reduce((sum, t) => sum + t.taskCount, 0);

    const weekTasks = supervisorTasks
        .filter(t => {
            const taskDate = new Date(t.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return taskDate >= weekAgo;
        })
        .reduce((sum, t) => sum + t.taskCount, 0);

    const monthTasks = supervisorTasks
        .filter(t => {
            const taskDate = new Date(t.date);
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return taskDate >= monthAgo;
        })
        .reduce((sum, t) => sum + t.taskCount, 0);

    const totalTasks = supervisorTasks.reduce((sum, t) => sum + t.taskPoint, 0);

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        {t('supervisor.myStats') || 'My Statistics'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t('supervisor.viewOnlyDesc') || 'View your task performance and history'}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title={t('task.today')}
                        value={todayTasks}
                        icon={<CheckCircle className="w-6 h-6 text-primary" />}
                        variant="default"
                    />
                    <StatCard
                        title={t('task.weekly')}
                        value={weekTasks}
                        icon={<TrendingUp className="w-6 h-6 text-primary" />}
                        variant="default"
                    />
                    <StatCard
                        title={t('task.monthly')}
                        value={monthTasks}
                        icon={<CalendarDays className="w-6 h-6 text-primary" />}
                        variant="default"
                    />
                    <StatCard
                        title={t('dashboard.totalPoints')}
                        value={totalTasks}
                        icon={<BarChart3 className="w-6 h-6 text-white" />}
                        variant="primary"
                    />
                </div>

                {/* Task History */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            {t('supervisor.taskHistory') || 'Task History'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {supervisorTasks.length > 0 ? (
                                [...supervisorTasks]
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <CheckCircle className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{task.description || t('task.entry')}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {task.date.toString().split('T')[0]}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="font-medium">{task.taskType || t('task.type')}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {task.taskPoint} pts.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-primary">{task.taskCount}</p>
                                                <p className="text-xs text-muted-foreground">{t('dashboard.tasks') || 'tasks'}</p>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{t('supervisor.noTasks') || 'No tasks recorded yet'}</p>
                                    <p className="text-sm mt-1">{t('supervisor.adminWillAdd') || 'The admin will add your task data'}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default SupervisorStats;