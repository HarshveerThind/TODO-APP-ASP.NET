import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateTaskForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createTask = useCreateTask();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask.mutate(
      { title, description, isCompleted: false },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setIsOpen(false);
          toast({ title: "Task created successfully" });
        },
      }
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <button
              onClick={() => setIsOpen(true)}
              className="
                w-full p-4 rounded-xl border border-dashed border-border 
                bg-background/50 hover:bg-accent/5 hover:border-accent/30
                text-muted-foreground hover:text-accent font-medium
                flex items-center justify-center gap-2 
                transition-all duration-300 group
              "
            >
              <div className="p-1.5 rounded-full bg-muted group-hover:bg-accent/10 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              Create new task
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="bg-card p-6 rounded-2xl shadow-lg border border-border/50 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
            
            <h3 className="text-lg font-semibold mb-4">New Task</h3>
            
            <div className="space-y-4">
              <div>
                <Input
                  autoFocus
                  placeholder="What do you need to do?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 rounded-none border-b border-border focus:border-primary transition-colors"
                />
              </div>
              
              <div>
                <Textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px] resize-none border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 bg-transparent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!title.trim() || createTask.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]"
                >
                  {createTask.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
