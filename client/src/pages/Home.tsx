import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks } from "@/hooks/use-tasks";
import { TaskCard } from "@/components/TaskCard";
import { CreateTaskForm } from "@/components/CreateTaskForm";
import { Loader2, Calendar, CheckCircle2, ListFilter } from "lucide-react";
import { format } from "date-fns";
import type { TaskResponse } from "@shared/routes";

export default function Home() {
  const { data: tasks, isLoading, error } = useTasks();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTasks = tasks?.filter((task) => {
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  const activeCount = tasks?.filter(t => !t.isCompleted).length || 0;
  const completedCount = tasks?.filter(t => t.isCompleted).length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Failed to load tasks</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm underline hover:text-primary"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <header className="pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground mb-2">
                My Tasks
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(), "EEEE, MMMM do")}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="px-4 py-2 rounded-xl bg-card border shadow-sm text-sm">
                <span className="block text-xs text-muted-foreground uppercase font-semibold tracking-wider">Active</span>
                <span className="text-xl font-bold text-primary">{activeCount}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-card border shadow-sm text-sm">
                <span className="block text-xs text-muted-foreground uppercase font-semibold tracking-wider">Done</span>
                <span className="text-xl font-bold text-green-600">{completedCount}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="px-4 pb-20 max-w-4xl mx-auto">
        <CreateTaskForm />

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div className="bg-muted/50 p-1 rounded-lg flex items-center gap-1">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-4 py-1.5 rounded-md text-sm font-medium transition-all
                  ${filter === f 
                    ? "bg-white shadow text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  }
                `}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks && filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  {filter === 'completed' ? (
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground/50" />
                  ) : (
                    <ListFilter className="w-8 h-8 text-muted-foreground/50" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  {filter === 'completed' ? "No completed tasks yet" : "No tasks found"}
                </h3>
                <p className="text-muted-foreground">
                  {filter === 'completed' 
                    ? "Finish some tasks to see them here." 
                    : "Create a new task to get started."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
