import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COMMITMENT_LABELS: Record<string, string> = {
  hobby: "Hobby",
  side_project: "Side Project",
  serious: "Serious",
  professional: "Professional",
};

export const STAGE_LABELS: Record<string, string> = {
  idea: "Idea",
  concept: "Concept",
  development: "Development",
  ready: "Ready",
  production: "Production",
  completed: "Completed",
};

export const COLLAB_LABELS: Record<string, string> = {
  paid: "Paid",
  passion: "Passion Project",
  both: "Paid or Passion",
};
