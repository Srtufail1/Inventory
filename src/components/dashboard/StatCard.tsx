import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const StatCard = ({
  title,
  value,
  icon,
  color,
  change,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "orange" | "purple" | "green" | "red" | "teal";
  change?: number;
}) => {
  const colorMap = {
    blue: "border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:border-blue-500/20 dark:from-blue-950/30 dark:to-blue-900/20",
    orange: "border-orange-200/60 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:border-orange-500/20 dark:from-orange-950/30 dark:to-orange-900/20",
    purple: "border-purple-200/60 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:border-purple-500/20 dark:from-purple-950/30 dark:to-purple-900/20",
    green: "border-green-200/60 bg-gradient-to-br from-green-50 to-green-100/50 dark:border-green-500/20 dark:from-green-950/30 dark:to-green-900/20",
    red: "border-red-200/60 bg-gradient-to-br from-red-50 to-red-100/50 dark:border-red-500/20 dark:from-red-950/30 dark:to-red-900/20",
    teal: "border-teal-200/60 bg-gradient-to-br from-teal-50 to-teal-100/50 dark:border-teal-500/20 dark:from-teal-950/30 dark:to-teal-900/20",
  };
  const iconColorMap = {
    blue: "text-blue-600 dark:text-blue-400",
    orange: "text-orange-600 dark:text-orange-400",
    purple: "text-purple-600 dark:text-purple-400",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    teal: "text-teal-600 dark:text-teal-400",
  };
  const iconBgMap = {
    blue: "bg-blue-100 dark:bg-blue-900/40",
    orange: "bg-orange-100 dark:bg-orange-900/40",
    purple: "bg-purple-100 dark:bg-purple-900/40",
    green: "bg-green-100 dark:bg-green-900/40",
    red: "bg-red-100 dark:bg-red-900/40",
    teal: "bg-teal-100 dark:bg-teal-900/40",
  };

  return (
    <div
      className={`border rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${colorMap[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${iconColorMap[color]}`}>
            {typeof value === "number" ? value.toLocaleString("en-IN") : value}
          </p>
          {change !== undefined && change !== 0 && (
            <div
              className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                change > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {change > 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>
                {Math.abs(change)}% vs last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${iconBgMap[color]} ${iconColorMap[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
