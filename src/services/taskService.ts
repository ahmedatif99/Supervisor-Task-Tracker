import { databases, DATABASE_ID, TASKS_COLLECTION_ID, Query } from '@/lib/appwrite';
import { ID } from 'appwrite';

export const TASK_TYPES = [
  'Google Review',
  'Documents Order',
  'Documents Vendor',
  'Tickets Document',
  'Ticket Filtering',
  'Email Support',
  'Stock Management',
  'Apple Store Reviews',
  'Email Sales',
  'Tickets Data',
  'Live Chat',
  'Other',
] as const;

export type TaskType = typeof TASK_TYPES[number];

export const TASK_POINTS: Record<TaskType, number> = {
  'Google Review': 1,
  'Documents Order': 1,
  'Documents Vendor': 1,
  'Tickets Document': 1,
  'Ticket Filtering': 0.1,
  'Email Support': 1,
  'Stock Management': 0.05,
  'Apple Store Reviews': 1,
  'Email Sales': 1,
  'Tickets Data': 1,
  'Live Chat': 1,
  'Other': 1,
};



export interface AppwriteTask {
  $id: string;
  supervisor_id: string;
  supervisor_name: string;
  date: string;
  task_count: number;
  description: string;
  task_point: number;
  task_type?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Task {
  id: string;
  supervisorId: string;
  supervisorName: string;
  date: string;
  taskType: TaskType;
  taskCount: number;
  description: string;
  taskPoint: number;
  createdAt: string;
  updatedAt: string;
}

// Transform Appwrite document to our Task type
const transformTask = (doc: AppwriteTask): Task => ({
  id: doc.$id,
  supervisorId: doc.supervisor_id,
  supervisorName: doc.supervisor_name,
  date: doc.date,
  taskType: (doc.task_type as TaskType) || 'Other',
  taskCount: doc.task_count || 0,
  description: doc.description || '',
  taskPoint: doc.task_point || 0,
  createdAt: doc.$createdAt,
  updatedAt: doc.$updatedAt,
});

export const taskService = {
  // Get all tasks
  async getAll(): Promise<Task[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [Query.orderDesc('$createdAt'), Query.limit(500)]
      );
      return response.documents.map((doc) => transformTask(doc as unknown as AppwriteTask));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  // Get tasks by supervisor ID
  async getBySupervisorId(supervisorId: string): Promise<Task[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [Query.equal('supervisor_id', supervisorId), Query.orderDesc('date'), Query.limit(100)]
      );
      return response.documents.map((doc) => transformTask(doc as unknown as AppwriteTask));
    } catch (error) {
      console.error('Error fetching tasks by supervisor:', error);
      return [];
    }
  },

  // Get task by ID
  async getById(id: string): Promise<Task | null> {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        id
      );
      return transformTask(doc as unknown as AppwriteTask);
    } catch (error) {
      console.error('Error fetching task:', error);
      return null;
    }
  },

  // Create a new task
  async create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        ID.unique(),
        {
          supervisor_id: data.supervisorId,
          supervisor_name: data.supervisorName,
          date: data.date,
          task_type: data.taskType || 'Other',
          task_count: data.taskCount,
          description: data.description || '',
          task_point: data.taskPoint || 0,
        }
      );
      return transformTask(doc as unknown as AppwriteTask);
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  },

  // Update task
  async update(id: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task | null> {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.supervisorId !== undefined) updateData.supervisor_id = data.supervisorId;
      if (data.supervisorName !== undefined) updateData.supervisor_name = data.supervisorName;
      if (data.date !== undefined) updateData.date = data.date;
      if (data.taskCount !== undefined) updateData.task_count = data.taskCount;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.taskPoint !== undefined) updateData.task_point = data.taskPoint;
      if (data.taskType !== undefined) updateData.task_type = data.taskType;

      const doc = await databases.updateDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        id,
        updateData
      );
      return transformTask(doc as unknown as AppwriteTask);
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  },

  // Delete task
  async delete(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        id
      );
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  },

  // Get tasks by date range
  async getByDateRange(startDate: string, endDate: string): Promise<Task[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.greaterThanEqual('date', startDate),
          Query.lessThanEqual('date', endDate),
          Query.orderDesc('date'),
          Query.limit(500)
        ]
      );
      return response.documents.map((doc) => transformTask(doc as unknown as AppwriteTask));
    } catch (error) {
      console.error('Error fetching tasks by date range:', error);
      return [];
    }
  },
};