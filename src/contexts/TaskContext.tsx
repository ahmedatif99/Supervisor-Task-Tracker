import React, { createContext, useContext, useState } from 'react';

export interface Task {
  id: string;
  supervisorId: string;
  supervisorName: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  taskCount: number;
  description: string;
  createdAt: Date;
}

export interface SupervisorStats {
  id: string;
  name: string;
  email: string;
  totalTasks: number;
  dailyTasks: number;
  weeklyTasks: number;
  monthlyTasks: number;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  getTasksByPeriod: (period: 'daily' | 'weekly' | 'monthly' | 'all') => Task[];
  getSupervisorStats: (period: 'daily' | 'weekly' | 'monthly' | 'all') => SupervisorStats[];
  getSupervisorTasks: (supervisorId: string) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Demo data
const initialTasks: Task[] = [
  { id: '1', supervisorId: '2', supervisorName: 'Ahmed Hassan', date: new Date().toISOString().split('T')[0], timeFrom: '09:00', timeTo: '10:00', taskCount: 5, description: 'Morning inspection', createdAt: new Date() },
  { id: '2', supervisorId: '2', supervisorName: 'Ahmed Hassan', date: new Date().toISOString().split('T')[0], timeFrom: '10:00', timeTo: '11:00', taskCount: 3, description: 'Team meeting', createdAt: new Date() },
  { id: '3', supervisorId: '3', supervisorName: 'Sara Mohamed', date: new Date().toISOString().split('T')[0], timeFrom: '09:00', timeTo: '10:00', taskCount: 7, description: 'Quality check', createdAt: new Date() },
  { id: '4', supervisorId: '4', supervisorName: 'Omar Ali', date: new Date().toISOString().split('T')[0], timeFrom: '08:00', timeTo: '09:00', taskCount: 4, description: 'Safety rounds', createdAt: new Date() },
  { id: '5', supervisorId: '5', supervisorName: 'Fatima Khalil', date: new Date().toISOString().split('T')[0], timeFrom: '10:00', timeTo: '11:00', taskCount: 6, description: 'Documentation', createdAt: new Date() },
];

const demoSupervisors = [
  { id: '2', name: 'Ahmed Hassan', email: 'ahmed@company.com' },
  { id: '3', name: 'Sara Mohamed', email: 'sara@company.com' },
  { id: '4', name: 'Omar Ali', email: 'omar@company.com' },
  { id: '5', name: 'Fatima Khalil', email: 'fatima@company.com' },
  { id: '6', name: 'Youssef Nasser', email: 'youssef@company.com' },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

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
    
    // Initialize with demo supervisors
    demoSupervisors.forEach((sup) => {
      statsMap.set(sup.id, {
        id: sup.id,
        name: sup.name,
        email: sup.email,
        totalTasks: 0,
        dailyTasks: 0,
        weeklyTasks: 0,
        monthlyTasks: 0,
      });
    });

    // Calculate stats
    periodTasks.forEach((task) => {
      const existing = statsMap.get(task.supervisorId);
      if (existing) {
        existing.totalTasks += task.taskCount;
      }
    });

    // Sort by total tasks descending
    return Array.from(statsMap.values()).sort((a, b) => b.totalTasks - a.totalTasks);
  };

  const getSupervisorTasks = (supervisorId: string): Task[] => {
    return tasks.filter((task) => task.supervisorId === supervisorId);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        getTasksByPeriod,
        getSupervisorStats,
        getSupervisorTasks,
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
