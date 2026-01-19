import { Client, Account, Databases, ID, Query } from 'appwrite';
const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
export const SUPERVISORS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_SUPERVISORS_COLLECTION_ID || '';
export const TASKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID || '';

export { Query };
export {ID};
export default client;


// Sign Up
export const signup = async (email, password, name) => {
    try {
       const acc =  await account.create(ID.unique(), email, password, name);
       
        // Automatically log them in after signup
        await login(email, password);
    } catch (error) {
        console.error(error.message);
    }
};

// Login
export const login = async (email, password) => {
    try {
        await account.createEmailPasswordSession(email, password);
        window.location.href = "/dashboard";
    } catch (error) {
        console.error("Login failed", error.message);
    }
};

// Logout
export const logout = async () => {
    await account.deleteSession('current');
};

// Create Task Document

export const createTask = async (data) => {
    try {
        const response = await databases.createDocument(
            'YOUR_DATABASE_ID',
            'YOUR_COLLECTION_ID',
            ID.unique(),
            {
                supervisor_name: data.name,
                task_description: data.description,
                hours_worked: data.hours,
                date: new Date().toISOString()
            }
        );
        console.log("Success:", response);
    } catch (error) {
        console.error("Post error:", error.message);
    }
};


export const getTasks = async () => {
    try {
        const response = await databases.listDocuments(
            'YOUR_DATABASE_ID',
            'YOUR_COLLECTION_ID',
            [
                Query.orderDesc("$createdAt"), // Show newest tasks first
                Query.limit(25)               // Limit to 25 results
            ]
        );
        return response.documents;
    } catch (error) {
        console.error("Get error:", error.message);
    }
};

