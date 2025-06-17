import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Step {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  type: 'action' | 'info' | 'warning';
}

interface Task {
  id: string;
  title: string;
  description: string;
  steps: Step[];
  mode: 'text' | 'image' | 'voice' | 'screen';
  originalImage?: string;
  originalTranscript?: string;
  originalCapture?: string;
  createdAt: string;
}

interface TaskContextType {
  currentTask: Task | null;
  setCurrentTask: (task: Task) => void;
  taskHistory: Task[];
  addToHistory: (task: Task) => void;
  clearHistory: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskHistory, setTaskHistory] = useState<Task[]>([]);

  const addToHistory = (task: Task) => {
    setTaskHistory(prev => [task, ...prev.slice(0, 9)]); // Keep last 10 tasks
  };

  const clearHistory = () => {
    setTaskHistory([]);
  };

  const handleSetCurrentTask = (task: Task) => {
    setCurrentTask(task);
    addToHistory(task);
  };

  return (
    <TaskContext.Provider
      value={{
        currentTask,
        setCurrentTask: handleSetCurrentTask,
        taskHistory,
        addToHistory,
        clearHistory,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};