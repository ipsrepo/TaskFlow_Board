import { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';

const useTask = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTask must be used within TaskProvider');
  return ctx;
};

export default useTask;
