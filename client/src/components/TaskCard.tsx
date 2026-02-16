import { useState, forwardRef } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Check, Trash2, Edit2, X } from "lucide-react";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import type { TaskResponse } from "@shared/routes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TaskCardProps {
  task: TaskResponse;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(({ task }, ref) => {
  const { toast } = useToast();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: task.title, description: task.description || "" });

  const handleToggleComplete = () => {
    updateTask.mutate(
      { id: task.id, isCompleted: !task.isCompleted },
      {
        onSuccess: () => {
          toast({
            title: !task.isCompleted ? "Task completed" : "Task uncompleted",
            description: !task.isCompleted ? "Great job!" : "Keep going!",
          });
        },
      }
    );
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        toast({ title: "Task deleted", variant: "destructive" });
      },
    });
  };

  const handleSaveEdit = () => {
    updateTask.mutate(
      { id: task.id, title: editForm.title, description: editForm.description },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast({ title: "Task updated" });
        },
      }
    );
  };

  return (
    <>
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`
          group relative p-6 rounded-2xl border transition-all duration-300
          ${task.isCompleted 
            ? "bg-muted/30 border-border/50" 
            : "bg-card border-border hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5"
          }
        `}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={handleToggleComplete}
            className={`
              mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${task.isCompleted
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/30 hover:border-primary/50"
              }
            `}
          >
            {task.isCompleted && <Check className="w-3.5 h-3.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <h3 
              className={`
                text-lg font-semibold leading-none mb-2 transition-all
                ${task.isCompleted ? "text-muted-foreground line-through decoration-border" : "text-foreground"}
              `}
            >
              {task.title}
            </h3>
            {task.description && (
              <p 
                className={`
                  text-sm leading-relaxed
                  ${task.isCompleted ? "text-muted-foreground/60" : "text-muted-foreground"}
                `}
              >
                {task.description}
              </p>
            )}
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/50 font-medium">
              <span>{format(new Date(task.createdAt), "MMM d, yyyy")}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={editForm.title} 
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What needs to be done?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add some details..."
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={!editForm.title.trim() || updateTask.isPending}
            >
              {updateTask.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
TaskCard.displayName = "TaskCard";
