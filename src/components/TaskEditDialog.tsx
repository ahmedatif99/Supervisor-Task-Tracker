import { useState, useEffect } from 'react';
import { Task, TASK_TYPES, TASK_POINTS, TaskType } from '@/services/taskService';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar, CheckCircle, Tag, TrendingUp, Loader2 } from 'lucide-react';

interface TaskEditDialogProps {
    task: Task | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, data: Partial<Task>) => Promise<void>;
}

export const TaskEditDialog = ({ task, open, onOpenChange, onSave }: TaskEditDialogProps) => {
    const { t } = useLanguage();
    const [date, setDate] = useState('');
    const [taskType, setTaskType] = useState<TaskType>('Other');
    const [taskCount, setTaskCount] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    // Calculate points automatically
    const calculatedPoints = taskCount ? parseFloat(taskCount) * TASK_POINTS[taskType] : 0;

    useEffect(() => {
        if (task) {
            setDate(task.date.toString().split('T')[0]);
            setTaskType(task.taskType || 'Other');
            setTaskCount(task.taskCount.toString());
            setDescription(task.description || '');
        }
    }, [task]);

    const handleSave = async () => {
        if (!task) return;

        setSaving(true);
        try {
            await onSave(task.id, {
                date,
                taskType,
                taskCount: parseInt(taskCount),
                taskPoint: calculatedPoints,
                description,
            });
            onOpenChange(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('task.edit') || 'Edit Task'}</DialogTitle>
                    <DialogDescription>
                        {task?.supervisorName} - {t('task.editDescription') || 'Update task details'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-date" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {t('task.date')}
                        </Label>
                        <Input
                            id="edit-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-10"
                        />
                    </div>

                    {/* Task Type */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-taskType" className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            {t('task.type') || 'Task Type'}
                        </Label>
                        <Select value={taskType} onValueChange={(val) => setTaskType(val as TaskType)}>
                            <SelectTrigger className="h-10">
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

                    <div className="grid grid-cols-2 gap-4">
                        {/* Task Count */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-taskCount" className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                                {t('task.count')}
                            </Label>
                            <Input
                                id="edit-taskCount"
                                type="number"
                                min="1"
                                value={taskCount}
                                onChange={(e) => setTaskCount(e.target.value)}
                                className="h-10"
                            />
                        </div>

                        {/* Calculated Points (Read-only) */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-taskPoint" className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                {t('task.points') || 'Points'}
                            </Label>
                            <Input
                                id="edit-taskPoint"
                                type="text"
                                value={calculatedPoints.toFixed(2)}
                                readOnly
                                className="h-10 bg-muted"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">{t('task.description')}</Label>
                        <Textarea
                            id="edit-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('task.descriptionPlaceholder') || 'Describe the tasks completed...'}
                            className="min-h-[80px] resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        {t('common.cancel') || 'Cancel'}
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t('common.save') || 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};