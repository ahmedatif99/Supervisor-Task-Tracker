import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supervisorService, Supervisor } from '@/services/supervisorService';
import { taskService, Task } from '@/services/taskService';
import { toast } from 'sonner';

export type { Supervisor, Task };

export interface SupervisorStats {
  id: string;
  name: string;
  email: string;
  totalTasks: number;
  dailyTasks: number;
  weeklyTasks: number;
  monthlyTasks: number;
  totalPoints: number;
}

interface TaskContextType {
  tasks: Task[];
  supervisors: Supervisor[];
  loading: boolean;
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task | null>;
  updateTask: (id: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  // Supervisor operations
  addSupervisor: (supervisor: Omit<Supervisor, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Supervisor | null>;
  updateSupervisor: (id: string, data: Partial<Omit<Supervisor, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Supervisor | null>;
  deleteSupervisor: (id: string) => Promise<boolean>;
  // Query operations
  getTasksByPeriod: (period: 'daily' | 'weekly' | 'monthly' | 'all') => Task[];
  getSupervisorStats: (period: 'daily' | 'weekly' | 'monthly' | 'all') => SupervisorStats[];
  getSupervisorTasks: (supervisorId: string) => Task[];
  getSupervisorById: (supervisorId: string) => Supervisor | undefined;
  // Refresh data
  refreshData: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data from Appwrite
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [supervisorsData, tasksData] = await Promise.all([
        supervisorService.getAll(),
        taskService.getAll(),
      ]);
      setSupervisors(supervisorsData.filter(sup => sup.role === 'supervisor'));
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Task CRUD operations
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> => {
    const newTask = await taskService.create(task);
    if (newTask) {
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    }
    return null;
  };

  const updateTask = async (id: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task | null> => {
    const updatedTask = await taskService.update(id, data);
    if (updatedTask) {
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      return updatedTask;
    }
    return null;
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    const success = await taskService.delete(id);
    if (success) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
    return success;
  };

  // Supervisor CRUD operations
  const addSupervisor = async (supervisor: Omit<Supervisor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supervisor | null> => {
    const newSupervisor = await supervisorService.create(supervisor);
    if (newSupervisor) {
      setSupervisors((prev) => [...prev, newSupervisor]);
      return newSupervisor;
    }
    return null;
  };

  const updateSupervisor = async (id: string, data: Partial<Omit<Supervisor, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Supervisor | null> => {
    const updatedSupervisor = await supervisorService.update(id, data);
    if (updatedSupervisor) {
      setSupervisors((prev) => prev.map((s) => (s.id === id ? updatedSupervisor : s)));
      return updatedSupervisor;
    }
    return null;
  };

  const deleteSupervisor = async (id: string): Promise<boolean> => {
    const success = await supervisorService.delete(id);
    if (success) {
      setSupervisors((prev) => prev.filter((s) => s.id !== id));
    }
    return success;
  };

  // Query operations
  const getTasksByPeriod = (period: 'daily' | 'weekly' | 'monthly' | 'all'): Task[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return tasks.filter((task) => {
      const taskDate = new Date(task.date);
      switch (period) {
        case 'daily':
          return taskDate >= today;
        case 'weekly':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return taskDate >= weekAgo;
        case 'monthly':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return taskDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const getSupervisorStats = (period: 'daily' | 'weekly' | 'monthly' | 'all'): SupervisorStats[] => {
    const periodTasks = getTasksByPeriod(period);

    const statsMap = new Map<string, SupervisorStats>();

    // Initialize with supervisors
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

    // Calculate stats
    periodTasks.forEach((task) => {
      const existing = statsMap.get(task.supervisorId);
      if (existing) {
        existing.totalTasks += task.taskCount;
        existing.totalPoints += task.taskPoint || 0;
      }
    });

    // Sort by total tasks descending
    return Array.from(statsMap.values()).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const getSupervisorTasks = (supervisorId: string): Task[] => {
    return tasks.filter((task) => task.supervisorId === supervisorId);
  };

  const getSupervisorById = (supervisorId: string): Supervisor | undefined => {
    return supervisors.find((s) => s.id === supervisorId);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        supervisors,
        loading,
        addTask,
        updateTask,
        deleteTask,
        addSupervisor,
        updateSupervisor,
        deleteSupervisor,
        getTasksByPeriod,
        getSupervisorStats,
        getSupervisorTasks,
        getSupervisorById,
        refreshData,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};