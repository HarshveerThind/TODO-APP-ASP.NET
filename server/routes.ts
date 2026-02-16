
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema } from "@shared/schema";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // GET /api/tasks
  app.get(api.tasks.list.path, async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  // GET /api/tasks/:id
  app.get(api.tasks.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const task = await storage.getTask(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(task);
  });

  // POST /api/tasks
  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // PUT /api/tasks/:id
  app.put(api.tasks.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    try {
      const taskData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(id, taskData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // DELETE /api/tasks/:id
  app.delete(api.tasks.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    await storage.deleteTask(id);
    res.status(204).send();
  });

  // Seed data
  const existingTasks = await storage.getTasks();
  if (existingTasks.length === 0) {
    await storage.createTask({
      title: "Learn Replit Agent",
      description: "Understand how to build apps effectively",
      isCompleted: false
    });
    await storage.createTask({
      title: "Build a Todo App",
      description: "Create a simple CRUD application",
      isCompleted: true
    });
    await storage.createTask({
      title: "Master Fullstack Development",
      description: "Learn React, Node, and SQL",
      isCompleted: false
    });
  }

  return httpServer;
}
