import { useState } from 'react';
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
import { Calendar, Clock, FileText, CheckCircle, TrendingUp, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

const TaskEntry = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addTask, getSupervisorTasks } = useTasks();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [taskCount, setTaskCount] = useState('');
  const [description, setDescription] = useState('');

  const supervisorTasks = user ? getSupervisorTasks(user.id) : [];
  
  const todayTasks = supervisorTasks
    .filter(t => t.date === new Date().toISOString().split('T')[0])
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!timeFrom || !timeTo || !taskCount) {
      toast.error('Please fill in all required fields');
      return;
    }

    addTask({
      supervisorId: user?.id || '',
      supervisorName: user?.name || '',
      date,
      timeFrom,
      timeTo,
      taskCount: parseInt(taskCount),
      description,
    });

    toast.success(t('task.success'));
    setTimeFrom('');
    setTimeTo('');
    setTaskCount('');
    setDescription('');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('task.entry')}</h1>
          <p className="text-muted-foreground mt-1">
            Enter your hourly task data
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
            title={t('task.weekly')}
            value={weekTasks}
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            variant="default"
          />
          <StatCard
            title={t('task.monthly')}
            value={monthTasks}
            icon={<CalendarDays className="w-6 h-6 text-primary" />}
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
              Record your completed tasks for a specific time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                {/* Time From */}
                <div className="space-y-2">
                  <Label htmlFor="timeFrom" className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {t('task.timeFrom')}
                  </Label>
                  <Input
                    id="timeFrom"
                    type="time"
                    value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>

                {/* Time To */}
                <div className="space-y-2">
                  <Label htmlFor="timeTo" className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {t('task.timeTo')}
                  </Label>
                  <Input
                    id="timeTo"
                    type="time"
                    value={timeTo}
                    onChange={(e) => setTimeTo(e.target.value)}
                    className="h-12"
                    required
                  />
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
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('task.description')}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the tasks completed..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full md:w-auto h-12 px-8 gradient-primary text-primary-foreground font-semibold"
              >
                {t('task.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        {supervisorTasks.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {supervisorTasks.slice(-5).reverse().map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{task.description || 'Task Entry'}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.date} • {task.timeFrom} - {task.timeTo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{task.taskCount}</p>
                      <p className="text-xs text-muted-foreground">tasks</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TaskEntry;
