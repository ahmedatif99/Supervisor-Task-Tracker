import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTasks, SupervisorStats } from '@/contexts/TaskContext';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { RankBadge } from '@/components/RankBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Award,
  Calendar,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterPeriod = 'daily' | 'weekly' | 'monthly' | 'all';

const Dashboard = () => {
  const { t, isRTL } = useLanguage();
  const { getSupervisorStats, getTasksByPeriod } = useTasks();
  const [filter, setFilter] = useState<FilterPeriod>('weekly');

  const stats = getSupervisorStats(filter);
  const tasks = getTasksByPeriod(filter);
  
  const totalTasks = tasks.reduce((sum, t) => sum + t.taskCount, 0);
  const avgDaily = stats.length > 0 ? Math.round(totalTasks / stats.length) : 0;
  const topPerformer = stats[0];

  const filterOptions: { value: FilterPeriod; label: string }[] = [
    { value: 'daily', label: t('dashboard.daily') },
    { value: 'weekly', label: t('dashboard.weekly') },
    { value: 'monthly', label: t('dashboard.monthly') },
    { value: 'all', label: t('dashboard.all') },
  ];

  const getProgressValue = (stat: SupervisorStats) => {
    const maxTasks = stats[0]?.totalTasks || 1;
    return (stat.totalTasks / maxTasks) * 100;
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground mt-1">
              Monitor supervisor performance and task completion
            </p>
          </div>
          
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "transition-all",
                    filter === option.value && "shadow-md"
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={t('dashboard.totalTasks')}
            value={totalTasks}
            icon={<BarChart3 className="w-6 h-6 text-primary" />}
            variant="primary"
          />
          <StatCard
            title={t('dashboard.supervisors')}
            value={stats.length}
            icon={<Users className="w-6 h-6 text-primary" />}
          />
          <StatCard
            title={t('dashboard.avgDaily')}
            value={avgDaily}
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
          />
          <StatCard
            title={t('dashboard.topPerformer')}
            value={topPerformer?.name || '-'}
            icon={<Award className="w-6 h-6 text-primary" />}
          />
        </div>

        {/* Rankings Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              {t('dashboard.rankings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">{t('dashboard.rank')}</TableHead>
                  <TableHead>{t('dashboard.name')}</TableHead>
                  <TableHead className="text-center">{t('dashboard.tasks')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('dashboard.performance')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat, index) => (
                  <TableRow 
                    key={stat.id}
                    className="hover:bg-muted/50 transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell>
                      <RankBadge rank={index + 1} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{stat.name}</p>
                        <p className="text-sm text-muted-foreground">{stat.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-2xl font-bold text-primary">
                        {stat.totalTasks}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={getProgressValue(stat)} 
                          className="h-2 flex-1"
                        />
                        <span className="text-sm text-muted-foreground w-12">
                          {Math.round(getProgressValue(stat))}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {stats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No data available for this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.slice(0, 5).map((task, index) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      index === 0 ? "bg-success" : "bg-muted-foreground"
                    )} />
                    <div>
                      <p className="font-medium">{task.supervisorName}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.date} • {task.timeFrom} - {task.timeTo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{task.taskCount}</p>
                    <p className="text-xs text-muted-foreground">tasks</p>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
