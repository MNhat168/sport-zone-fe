import type { LucideIcon } from "lucide-react";

export type LessonType = {
    id: string;
    type: 'single' | 'pair' | 'group' | string;
    name: string;
    description: string;
    field?: string; // field id
    lessonPrice?: number; // smallest currency unit (e.g., VND)
    user?: string;
    icon?: LucideIcon;
    createdAt?: string;
    updatedAt?: string;
};
