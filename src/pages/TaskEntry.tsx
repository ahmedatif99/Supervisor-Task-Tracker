import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/contexts/TaskContext';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, FileText, CheckCircle, Users, TrendingUp, Loader2, Tag, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TASK_TYPES, TASK_POINTS, TaskType, Task } from '@/services/taskService';
import { TaskEditDialog } from '@/components/TaskEditDialog';



const TaskEntry = () => {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const { addTask, updateTask, supervisors, tasks, loading } = useTasks();

  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  // const [selectTaskType, setSelectTaskType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  // const [timeFrom, setTimeFrom] = useState('');
  // const [timeTo, setTimeTo] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('Other');
  // Auto-calculate points based on task type and count

  // const [taskType, setTaskType] = useState('');
  const [taskCount, setTaskCount] = useState('');
  const calculatedPoints = taskCount ? parseFloat(taskCount) * TASK_POINTS[taskType] : 0;
  const [taskPoint, setTaskPoint] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit dialog state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Only admin can access this page
  if (!isAdmin) {
    return <Navigate to="/my-stats" replace />;
  }

  const todayTasks = tasks
    .filter(t => t.date.toString().split('T')[0] === new Date().toISOString().split('T')[0])
    .reduce((sum, t) => sum + t.taskCount, 0);

  const totalSupervisors = supervisors.length;
  const totalAllTasks = tasks.reduce((sum, t) => sum + t.taskCount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupervisor || !taskCount || !taskType) {
      toast.error(t('task.fillRequired') || 'Please fill in all required fields');
      return;
    }

    const supervisor = supervisors.find(s => s.id === selectedSupervisor);
    if (!supervisor) {
      toast.error('Supervisor not found');
      return;
    }


    setSubmitting(true);
    try {
      const newTask = await addTask({
        supervisorId: supervisor.id,
        supervisorName: supervisor.name,
        date,
        taskType,
        taskCount: parseInt(taskCount),
        taskPoint: calculatedPoints,
        description,
      });

      if (newTask) {
        toast.success(t('task.success'));
        setSelectedSupervisor('');
        setTaskType('Other');
        setTaskCount('');
        setTaskPoint('');
        setDescription('');
      } else {
        toast.error('Failed to add task');
      }
    } catch (error) {
      toast.error('Error adding task');
    } finally {
      setSubmitting(false);
    }
  };

  // Get recent tasks for display
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleSaveTask = async (id: string, data: Partial<Task>) => {
    const updated = await updateTask(id, data);
    if (updated) {
      toast.success(t('task.updateSuccess') || 'Task updated successfully');
    } else {
      toast.error(t('task.updateError') || 'Failed to update task');
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
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('task.entry')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('task.adminEntryDesc') || 'Enter task data for supervisors'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title={t('task.today')}
            value={todayTasks}
            icon={<CheckCircle className="w-6 h-6 text-primary" />}
            variant="default"
          />
          <StatCard
            title={t('dashboard.supervisors')}
            value={totalSupervisors}
            icon={<Users className="w-6 h-6 text-primary" />}
            variant="default"
          />
          <StatCard
            title={t('dashboard.totalTasks')}
            value={totalAllTasks}
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            variant="primary"
          />
        </div>

        {/* Task Entry Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t('task.entry')}
            </CardTitle>
            <CardDescription>
              {t('task.selectSupervisor') || 'Select a supervisor and record their completed tasks'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Supervisor Selection */}
              <div className="space-y-2">
                <Label htmlFor="supervisor" className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  {t('task.supervisor') || 'Supervisor'}
                </Label>
                <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={t('task.selectSupervisorPlaceholder') || 'Select a supervisor...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{supervisor.name}</span>
                          <span className="text-xs text-muted-foreground">{supervisor.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {t('task.date')}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12"
                  />
                </div>

                {/* Task Type */}
                <div className="space-y-2">
                  <Label htmlFor="taskType" className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    {t('task.type') || 'Task Type'}
                  </Label>
                  <Select value={taskType} onValueChange={(val) =>
                    setTaskType(val as TaskType)
                  }>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>


                {/* Task Count */}
                <div className="space-y-2">
                  <Label htmlFor="taskCount" className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    {t('task.count')}
                  </Label>
                  <Input
                    id="taskCount"
                    type="number"
                    min="1"
                    value={taskCount}
                    onChange={(e) => setTaskCount(e.target.value)}
                    placeholder="0"
                    className="h-12"
                    required
                  />
                </div>

                {/* Task Points */}
                {/* Calculated Points (Read-only) */}

                <div className="space-y-2">
                  <Label htmlFor="taskPoint" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    {t('task.points') || 'Points'} ({TASK_POINTS[taskType]} {t('task.per')})
                  </Label>
                  <Input
                    id="taskPoint"
                    type="number"
                    min="0"
                    value={calculatedPoints.toFixed(2)}
                    // onChange={(e) => setTaskPoint(e.target.value)}
                    placeholder="0"
                    className="h-12"
                    readOnly
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('task.description')}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('task.descriptionPlaceholder') || 'Describe the tasks completed...'}
                  className="min-h-[200px] resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full md:w-auto h-12 px-8 gradient-primary text-primary-foreground font-semibold"
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('task.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        {recentTasks.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t('task.recentEntries') || 'Recent Entries'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{task.supervisorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.date.toString().split('T')[0]}
                          {task.taskType && task.taskType !== 'Other' && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {task.taskType}
                            </span>
                          )}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{task.taskCount}</p>
                        <p className="text-xs text-muted-foreground">{task.taskPoint?.toFixed(2)} pts</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTask(task)}
                        className="h-9 w-9"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Task Edit Dialog */}
        <TaskEditDialog
          task={editingTask}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveTask}
        />
      </div>
    </Layout>
  );
};

export default TaskEntry;