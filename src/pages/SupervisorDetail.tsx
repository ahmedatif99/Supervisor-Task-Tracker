import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTasks, Task } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
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
import {
    ArrowLeft,
    ArrowRight,
    User,
    BarChart3,
    Calendar,
    Clock,
    FileText,
    Pencil,
    Trash2,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SupervisorDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();
    const { isAdmin } = useAuth();
    const { getSupervisorById, getSupervisorTasks, updateTask, deleteTask, loading } = useTasks();

    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit form state
    const [editDate, setEditDate] = useState('');
    const [editTaskCount, setEditTaskCount] = useState('');
    const [editTaskPoint, setEditTaskPoint] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const supervisor = getSupervisorById(id || '');
    const tasks = getSupervisorTasks(id || '');

    // Calculate stats
    const totalTasks = tasks.reduce((sum, task) => sum + task.taskCount, 0);
    const uniqueDays = new Set(tasks.map(task => task.date)).size;
    const avgPerDay = uniqueDays > 0 ? Math.round(totalTasks / uniqueDays) : 0;

    const openEditDialog = (task: Task) => {
        setEditingTask(task);
        setEditDate(task.date);
        setEditTaskCount(task.taskCount.toString());
        setEditTaskPoint(task.taskPoint?.toString() || '0');
        setEditDescription(task.description || '');
    };

    const handleUpdateTask = async () => {
        if (!editingTask) return;

        setIsSubmitting(true);
        try {
            const updated = await updateTask(editingTask.id, {
                date: editDate,
                taskCount: parseInt(editTaskCount),
                taskPoint: parseInt(editTaskPoint) || 0,
                description: editDescription,
            });

            if (updated) {
                toast.success(t('task.updateSuccess') || 'Task updated successfully');
                setEditingTask(null);
            } else {
                toast.error(t('task.updateError') || 'Failed to update task');
            }
        } catch (error) {
            toast.error('Error updating task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async () => {
        if (!deletingTaskId) return;

        setIsSubmitting(true);
        try {
            const success = await deleteTask(deletingTaskId);
            if (success) {
                toast.success(t('task.deleteSuccess') || 'Task deleted successfully');
            } else {
                toast.error(t('task.deleteError') || 'Failed to delete task');
            }
        } catch (error) {
            toast.error('Error deleting task');
        } finally {
            setIsSubmitting(false);
            setDeletingTaskId(null);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (!supervisor) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                    <p className="text-muted-foreground">{t('supervisorDetail.notFound')}</p>
                    <Button onClick={() => navigate('/dashboard')}>
                        {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
                        {t('supervisorDetail.backToDashboard')}
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in">
                {/* Header with Back Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="shrink-0"
                        >
                            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                {supervisor.name}
                            </h1>
                            <p className="text-muted-foreground mt-1">{supervisor.email}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatCard
                        title={t('supervisorDetail.totalTasks')}
                        value={totalTasks}
                        icon={<BarChart3 className="w-6 h-6 text-primary" />}
                        variant="primary"
                    />
                    <StatCard
                        title={t('supervisorDetail.daysWorked')}
                        value={uniqueDays}
                        icon={<Calendar className="w-6 h-6 text-primary" />}
                    />
                    <StatCard
                        title={t('supervisorDetail.avgPerDay')}
                        value={avgPerDay}
                        icon={<Clock className="w-6 h-6 text-primary" />}
                    />
                </div>

                {/* Tasks Table */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            {t('supervisorDetail.allTasks')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={isRTL && "text-right"}>{t('task.date')}</TableHead>
                                    <TableHead className="text-center">{t('dashboard.tasks')}</TableHead>
                                    <TableHead className="text-center">{t('task.points') || 'Points'}</TableHead>
                                    <TableHead className={isRTL ? "hidden md:table-cell text-right" : "hidden md:table-cell"}>{t('task.description')}</TableHead>
                                    {isAdmin && <TableHead className="w-24">{t('actions') || 'Actions'}</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.length > 0 ? (
                                    tasks.map((task, index) => (
                                        <TableRow
                                            key={task.id}
                                            className="hover:bg-muted/50 transition-colors animate-slide-up"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">{task.date}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-xl font-bold text-primary">
                                                    {task.taskCount}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-lg font-semibold text-muted-foreground">
                                                    {task.taskPoint || 0}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <p className={cn(
                                                    "text-sm text-muted-foreground truncate max-w-xs",
                                                    !task.description && "italic"
                                                )}>
                                                    {task.description || t('supervisorDetail.noDescription')}
                                                </p>
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditDialog(task)}
                                                            className="h-8 w-8"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setDeletingTaskId(task.id)}
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-12 text-muted-foreground">
                                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>{t('supervisor.noTasks')}</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Task Dialog */}
            <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('task.edit') || 'Edit Task'}</DialogTitle>
                        <DialogDescription>
                            {t('task.editDescription') || 'Update the task details below'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="editDate">{t('task.date')}</Label>
                            <Input
                                id="editDate"
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editTaskCount">{t('task.count')}</Label>
                                <Input
                                    id="editTaskCount"
                                    type="number"
                                    min="1"
                                    value={editTaskCount}
                                    onChange={(e) => setEditTaskCount(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editTaskPoint">{t('task.points') || 'Points'}</Label>
                                <Input
                                    id="editTaskPoint"
                                    type="number"
                                    min="0"
                                    value={editTaskPoint}
                                    onChange={(e) => setEditTaskPoint(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editDescription">{t('task.description')}</Label>
                            <Textarea
                                id="editDescription"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="min-h-[80px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingTask(null)}>
                            {t('cancel') || 'Cancel'}
                        </Button>
                        <Button onClick={handleUpdateTask} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('save') || 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingTaskId} onOpenChange={() => setDeletingTaskId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('task.deleteConfirmTitle') || 'Delete Task'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('task.deleteConfirmDescription') || 'Are you sure you want to delete this task? This action cannot be undone.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel') || 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteTask}
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

export default SupervisorDetail;