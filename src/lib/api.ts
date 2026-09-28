import axios from 'axios';
import { AddTaskOptions } from '../types';

const API_BASE = '/api';

export const api = {
  // Tasks
  getAllTasks: () => axios.get(`${API_BASE}/get-tasks`),
  getRunningTasks: () => axios.get(`${API_BASE}/get-tasks/running`),
  getFinishedTasks: () => axios.get(`${API_BASE}/get-tasks/finished`),
  getTask: (id: string) => axios.get(`${API_BASE}/get-tasks/${id}`),
  addTask: (options: AddTaskOptions) => axios.post(`${API_BASE}/add-task`, options),
  removeFinished: () => axios.get(`${API_BASE}/remove-finished`),
  removeFinishedFailed: () => axios.get(`${API_BASE}/remove-finished/failed`),
  removeFinishedById: (id: string) => axios.get(`${API_BASE}/remove-finished/${id}`),
};
