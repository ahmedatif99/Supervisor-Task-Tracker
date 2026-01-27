import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTasks, SupervisorStats, Supervisor } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { RankBadge } from '@/components/RankBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { TASK_TYPES, TaskType } from '@/services/taskService';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  BarChart3,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Filter,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  CalendarIcon,
  X, Tag
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CircularProgress } from '@/components/CircularProgress';

type FilterPeriod = 'daily' | 'weekly' | 'monthly' | 'all' | 'specific';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { isAdmin } = useAuth();
  const {
    getSupervisorStats,
    getTasksByPeriod,
    supervisors,
    tasks: allTasks,
    addSupervisor,
    updateSupervisor,
    deleteSupervisor,
    loading
  } = useTasks();
  const [filter, setFilter] = useState<FilterPeriod>('weekly');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | 'all'>('all');

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  const [deletingSupervisorId, setDeletingSupervisorId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('supervisor');

  // Get tasks based on filter type
  const getFilteredTasks = () => {
    let filteredTasks = allTasks;

    if (filter === 'specific' && selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      filteredTasks = filteredTasks.filter(task => task.date === dateStr);
    } else {
      filteredTasks = getTasksByPeriod(filter === 'specific' ? 'all' : filter);
    }

    // Filter by task type
    if (selectedTaskType !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.taskType === selectedTaskType);
    }
    return filteredTasks;
  };

  // Get stats based on filter type
  const getFilteredStats = () => {
    if (filter === 'specific' && selectedDate || selectedTaskType !== 'all') {
      // Custom filtering needed
      let dayTasks = allTasks;

      if (filter === 'specific' && selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        dayTasks = dayTasks.filter(task => task.date === dateStr);
      } else if (filter !== 'specific') {
        dayTasks = getTasksByPeriod(filter);
      }

      // Filter by task type
      if (selectedTaskType !== 'all') {
        dayTasks = dayTasks.filter(task => task.taskType === selectedTaskType);
      }
      const statsMap = new Map<string, SupervisorStats>();
      supervisors.forEach((sup) => {
        statsMap.set(sup.id, {
          id: sup.id,
          name: sup.name,
          email: sup.email,
          totalTasks: 0,
          dailyTasks: 0,
          weeklyTasks: 0,
          monthlyTasks: 0,
          totalPoints: 0,
        });
      });

      dayTasks.forEach((task) => {
        const existing = statsMap.get(task.supervisorId);
        if (existing) {
          existing.totalTasks += task.taskCount;
          existing.totalPoints += task.taskPoint || 0;
        }
      });

      return Array.from(statsMap.values()).sort((a, b) => b.totalPoints - a.totalPoints);
    }
    return getSupervisorStats(filter === 'specific' ? 'all' : filter);
  };

  const stats = getFilteredStats();
  const tasks = getFilteredTasks();

  // const stats = getSupervisorStats(filter);
  // const tasks = getTasksByPeriod(filter);

  const totalTasks = tasks.reduce((sum, t) => sum + t.taskCount, 0);
  const avgDaily = stats.length > 0 ? Math.round(totalTasks / stats.length) : 0;
  const topPerformer = stats[0];

  const filterOptions: { value: FilterPeriod; label: string }[] = [
    { value: 'daily', label: t('dashboard.daily') },
    { value: 'weekly', label: t('dashboard.weekly') },
    { value: 'monthly', label: t('dashboard.monthly') },
    { value: 'all', label: t('dashboard.all') },
  ];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFilter('specific');
    }
  };

  const clearDateFilter = () => {
    setSelectedDate(undefined);
    setFilter('weekly');
  };

  const clearTaskTypeFilter = () => {
    setSelectedTaskType('all');
  };

  const getProgressValue = (stat: SupervisorStats) => {
    const maxPoints = stats[0]?.totalPoints || 1;
    return (stat.totalPoints / maxPoints) * 100;
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('supervisor');
  };

  const openEditDialog = (supervisor: Supervisor) => {
    setEditingSupervisor(supervisor);
    setFormName(supervisor.name);
    setFormEmail(supervisor.email);
    setFormRole(supervisor.role);
  };

  const handleAddSupervisor = async () => {
    if (!formName || !formEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const newSupervisor = await addSupervisor({
        name: formName,
        email: formEmail,
        role: formRole,
        totalPoints: 0,
        totalTask: 0,
        rank: 0,
      });

      if (newSupervisor) {
        toast.success(t('supervisor.addSuccess') || 'Supervisor added successfully');
        setIsAddDialogOpen(false);
        resetForm();
      } else {
        toast.error('Failed to add supervisor');
      }
    } catch (error) {
      toast.error('Error adding supervisor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSupervisor = async () => {
    if (!editingSupervisor || !formName || !formEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateSupervisor(editingSupervisor.id, {
        name: formName,
        email: formEmail,
        role: formRole,
      });

      if (updated) {
        toast.success(t('supervisor.updateSuccess') || 'Supervisor updated successfully');
        setEditingSupervisor(null);
        resetForm();
      } else {
        toast.error('Failed to update supervisor');
      }
    } catch (error) {
      toast.error('Error updating supervisor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupervisor = async () => {
    if (!deletingSupervisorId) return;

    setIsSubmitting(true);
    try {
      const success = await deleteSupervisor(deletingSupervisorId);
      if (success) {
        toast.success(t('supervisor.deleteSuccess') || 'Supervisor deleted successfully');
      } else {
        toast.error('Failed to delete supervisor');
      }
    } catch (error) {
      toast.error('Error deleting supervisor');
    } finally {
      setIsSubmitting(false);
      setDeletingSupervisorId(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('Monitor.supervisor')}
            </p>
          </div>

          <div className="grid md:flex items-center gap-6 ">
            {/* Add Supervisor Button */}
            {isAdmin && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('supervisor.add') || 'Add Supervisor'}
              </Button>
            )}

            {/* Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-1 p-1 bg-muted rounded-lg">
                {filterOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filter === option.value && !selectedDate ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setFilter(option.value);
                      setSelectedDate(undefined);
                    }}
                    className={cn(
                      "transition-all",
                      filter === option.value && !selectedDate && "shadow-md"
                    )}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={selectedDate ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      "gap-2",
                      selectedDate && "shadow-md"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : (t('selectDate') || 'Pick a date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover z-50" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {/* Clear date filter */}
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDateFilter}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              {/* Task Type Filter */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <Select
                  value={selectedTaskType}
                  onValueChange={(val) => setSelectedTaskType(val as TaskType | 'all')}
                >
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Task Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {TASK_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTaskType !== 'all' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTaskTypeFilter}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
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
                  <TableHead className="hidden md:table-cell text-center">{t('dashboard.performance')}</TableHead>
                  <TableHead className="text-center">{t('dashboard.totalPoints')}</TableHead>
                  {isAdmin && <TableHead className="w-24">{t('actions') || 'Actions'}</TableHead>}
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat, index) => {
                  const supervisor = supervisors.find(s => s.id === stat.id);
                  return (
                    <TableRow
                      key={stat.id}
                      className="hover:bg-muted/50 transition-colors animate-slide-up cursor-pointer group"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => navigate(`/supervisor/${stat.id}`)}
                    >
                      <TableCell>
                        <RankBadge
                          rank={stat.totalPoints >= 80 ? 1 : stat.totalPoints >= 50 ? 2 : 3}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">{stat.name}</p>
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
                          <CircularProgress
                            value={getProgressValue(stat)}
                            className="h-2 flex-1"
                            strokeWidth={5}
                            size={50}
                          />
                        </div>
                      </TableCell>
                      <TableCell className='text-center'>

                        <span className={`${stat.totalPoints >= 90 ? `text-blue-500` : stat.totalPoints >= 75 ? 'text-red-700' : stat.totalPoints >= 50 ? 'text-orange-600' : 'text-red-700'} text-sm text-muted-foreground w-12`}>
                          {stat.totalPoints.toFixed(1)} pts
                        </span>
                      </TableCell>
                      {isAdmin && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => supervisor && openEditDialog(supervisor)}
                              className="h-8 w-8"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingSupervisorId(stat.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {isRTL ? (
                            <ChevronLeft className="w-5 h-5 text-primary" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {stats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
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
              {t('recent.activity') || 'Recent Activity'}
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
                        {task.date.toString().split('T')[0]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{task.taskCount}</p>
                    <p className="text-xs text-muted-foreground">{t('tasks') || 'tasks'}</p>
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

      {/* Add Supervisor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('supervisor.add') || 'Add Supervisor'}</DialogTitle>
            <DialogDescription>
              {t('Addanew') || 'Add a new supervisor to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="addName">{t('supervisor.name') || 'Name'}</Label>
              <Input
                id="addName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t("Ename")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addEmail">{t('supervisor.email') || 'Email'}</Label>
              <Input
                id="addEmail"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder={t("Emname")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button onClick={handleAddSupervisor} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('add') || 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supervisor Dialog */}
      <Dialog open={!!editingSupervisor} onOpenChange={() => { setEditingSupervisor(null); resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('supervisor.edit') || 'Edit Supervisor'}</DialogTitle>
            <DialogDescription>
              {t('supervisor.editDescription') || 'Update supervisor details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">{t('supervisor.name') || 'Name'}</Label>
              <Input
                id="editName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">{t('supervisor.email') || 'Email'}</Label>
              <Input
                id="editEmail"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingSupervisor(null); resetForm(); }}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button onClick={handleUpdateSupervisor} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('save') || 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSupervisorId} onOpenChange={() => setDeletingSupervisorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('supervisor.deleteConfirmTitle') || 'Delete Supervisor'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('supervisor.deleteConfirmDescription') || 'Are you sure you want to delete this supervisor? This will also remove all their tasks. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSupervisor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('delete') || 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Dashboard;