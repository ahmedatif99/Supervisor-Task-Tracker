import { databases, DATABASE_ID, SUPERVISORS_COLLECTION_ID, Query } from '@/lib/appwrite';
import { ID } from 'appwrite';

export interface AppwriteSupervisor {
  $id: string;
  name: string;
  email: string;
  total_points: number;
  total_task: number;
  rank: number;
  role: string;
   working_days: number;
  $createdAt: string;
  $updatedAt: string;
}

export interface Supervisor {
  id: string;
  name: string;
  email: string;
  totalPoints: number;
  totalTask: number;
  rank: number;
   workingDays: number;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Transform Appwrite document to our Supervisor type
const transformSupervisor = (doc: AppwriteSupervisor): Supervisor => ({
  id: doc.$id,
  name: doc.name,
  email: doc.email,
  totalPoints: doc.total_points || 0,
  totalTask: doc.total_task || 0,
  rank: doc.rank || 0,
  role: doc.role || 'supervisor',
  workingDays: doc.working_days || 22, // Default to 22 working days
  createdAt: doc.$createdAt,
  updatedAt: doc.$updatedAt,
});

export const supervisorService = {
  // Get all supervisors
  async getAll(): Promise<Supervisor[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SUPERVISORS_COLLECTION_ID,
        [Query.orderDesc('total_task'), Query.limit(100)]
      );
      return response.documents.map((doc) => transformSupervisor(doc as unknown as AppwriteSupervisor));
    } catch (error) {
      console.error('Error fetching supervisors:', error);
      return [];
    }
  },

  // Get supervisor by ID
  async getById(id: string): Promise<Supervisor | null> {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        SUPERVISORS_COLLECTION_ID,
        id
      );
      return transformSupervisor(doc as unknown as AppwriteSupervisor);
    } catch (error) {
      console.error('Error fetching supervisor:', error);
      return null;
    }
  },

  // Create a new supervisor
  async create(data: Omit<Supervisor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supervisor | null> {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        SUPERVISORS_COLLECTION_ID,
        ID.unique(),
        {
          name: data.name,
          email: data.email,
          total_points: data.totalPoints || 0,
          total_task: data.totalTask || 0,
          rank: data.rank || 0,
          role: data.role || 'supervisor',
           working_days: data.workingDays || 22,
        }
      );
      return transformSupervisor(doc as unknown as AppwriteSupervisor);
    } catch (error) {
      console.error('Error creating supervisor:', error);
      return null;
    }
  },

  // Update supervisor
  async update(id: string, data: Partial<Omit<Supervisor, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Supervisor | null> {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.totalPoints !== undefined) updateData.total_points = data.totalPoints;
      if (data.totalTask !== undefined) updateData.total_task = data.totalTask;
      if (data.rank !== undefined) updateData.rank = data.rank;
      if (data.role !== undefined) updateData.role = data.role;
       if (data.workingDays !== undefined) updateData.working_days = data.workingDays;

      const doc = await databases.updateDocument(
        DATABASE_ID,
        SUPERVISORS_COLLECTION_ID,
        id,
        updateData
      );
      return transformSupervisor(doc as unknown as AppwriteSupervisor);
    } catch (error) {
      console.error('Error updating supervisor:', error);
      return null;
    }
  },

  // Delete supervisor
  async delete(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        SUPERVISORS_COLLECTION_ID,
        id
      );
      return true;
    } catch (error) {
      console.error('Error deleting supervisor:', error);
      return false;
    }
  },
};