import { format } from "date-fns";

export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd MMM yyyy");
  } catch {
    return "N/A";
  }
};

export const actionColors: Record<string, string> = {
  create:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400",
  update:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400",
  delete: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400",
};
