export interface Step {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional: boolean;
  data?: any;
}

export interface StepProcess {
  id: string;
  title: string;
  description: string;
  steps: Step[];
  currentStepIndex: number;
  userId: string;
  guildId?: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
}

export class StepsManager {
  private processes = new Map<string, StepProcess>();

  createProcess(
    id: string,
    title: string,
    description: string,
    steps: Omit<Step, "completed">[],
    userId: string,
    guildId?: string
  ): StepProcess {
    const process: StepProcess = {
      id,
      title,
      description,
      steps: steps.map(step => ({ ...step, completed: false })),
      currentStepIndex: 0,
      userId,
      guildId,
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false
    };

    this.processes.set(id, process);
    return process;
  }

  getProcess(id: string): StepProcess | undefined {
    return this.processes.get(id);
  }

  getUserProcesses(userId: string): StepProcess[] {
    return Array.from(this.processes.values()).filter(p => p.userId === userId);
  }

  getGuildProcesses(guildId: string): StepProcess[] {
    return Array.from(this.processes.values()).filter(p => p.guildId === guildId);
  }

  nextStep(processId: string): boolean {
    const process = this.processes.get(processId);
    if (!process) return false;

    if (process.currentStepIndex < process.steps.length - 1) {
      // Mark current step as completed
      process.steps[process.currentStepIndex].completed = true;
      process.currentStepIndex++;
      process.updatedAt = new Date();
      
      // Check if all steps are completed
      if (process.currentStepIndex === process.steps.length - 1) {
        process.completed = true;
      }
      
      return true;
    }
    
    return false;
  }

  previousStep(processId: string): boolean {
    const process = this.processes.get(processId);
    if (!process) return false;

    if (process.currentStepIndex > 0) {
      process.currentStepIndex--;
      process.updatedAt = new Date();
      process.completed = false;
      return true;
    }
    
    return false;
  }

  skipStep(processId: string): boolean {
    const process = this.processes.get(processId);
    if (!process) return false;

    const currentStep = process.steps[process.currentStepIndex];
    if (currentStep && currentStep.optional) {
      return this.nextStep(processId);
    }
    
    return false;
  }

  completeStep(processId: string, stepId: string, data?: any): boolean {
    const process = this.processes.get(processId);
    if (!process) return false;

    const step = process.steps.find(s => s.id === stepId);
    if (!step) return false;

    step.completed = true;
    step.data = data;
    process.updatedAt = new Date();

    // Check if all steps are completed
    const allCompleted = process.steps.every(s => s.completed || s.optional);
    if (allCompleted) {
      process.completed = true;
    }

    return true;
  }

  resetProcess(processId: string): boolean {
    const process = this.processes.get(processId);
    if (!process) return false;

    process.currentStepIndex = 0;
    process.completed = false;
    process.updatedAt = new Date();
    
    process.steps.forEach(step => {
      step.completed = false;
      step.data = undefined;
    });

    return true;
  }

  deleteProcess(processId: string): boolean {
    return this.processes.delete(processId);
  }

  getCurrentStep(processId: string): Step | undefined {
    const process = this.processes.get(processId);
    if (!process) return undefined;

    return process.steps[process.currentStepIndex];
  }

  getProgress(processId: string): number {
    const process = this.processes.get(processId);
    if (!process) return 0;

    const completedSteps = process.steps.filter(s => s.completed).length;
    return Math.round((completedSteps / process.steps.length) * 100);
  }

  updateStepData(processId: string, stepId: string, data: any): boolean {
    const process = this.processes.get(processId);
    if (!process) return false;

    const step = process.steps.find(s => s.id === stepId);
    if (!step) return false;

    step.data = { ...step.data, ...data };
    process.updatedAt = new Date();
    return true;
  }

  getAllProcesses(): StepProcess[] {
    return Array.from(this.processes.values());
  }

  cleanupOldProcesses(maxAge: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, process] of this.processes) {
      if (now - process.updatedAt.getTime() > maxAge) {
        this.processes.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }
}

export const stepsManager = new StepsManager();