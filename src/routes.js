import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { BuildRotuePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: BuildRotuePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select(
        'tasks',
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: 'POST',
    path: BuildRotuePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title && !description) return res.writeHead(400).end('NotContent');

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      database.insert('tasks', task);
      return res.writeHead(201).end();
    },
  },
  {
    method: 'PUT',
    path: BuildRotuePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;
      const { newTitle, newDescription } = req.body;

      if (!newTitle && !newDescription)
        return res.writeHead(400).end('NotContent');

      const tasksArray = database.select('tasks');
      const task = tasksArray.find((task) => task.id === id);
      if (!task.id) return res.writeHead(400).end('ID-Invalid');

      database.update('tasks', id, {
        title: newTitle ? newTitle : task.title,
        description: newDescription ? newDescription : task.description,
        updated_at: new Date(),
      });
      return res.writeHead(204).end();
    },
  },
  {
    method: 'DELETE',
    path: BuildRotuePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      const tasksArray = database.select('tasks');
      const task = tasksArray.find((task) => task.id === id);

      if (!task.id) return res.writeHead(400).end('ID-Invalid');

      database.delete('tasks', id);

      return res.writeHead(204).end();
    },
  },
  {
    method: 'PATCH',
    path: BuildRotuePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params;

      const tasksArray = database.select('tasks');
      const task = tasksArray.find((task) => task.id === id);
      if (!task.id) return res.writeHead(400).end('ID-Invalid');

      database.update('tasks', id, {
        ...task,
        completed_at: new Date(),
      });

      return res.writeHead(204).end();
    },
  },
];
