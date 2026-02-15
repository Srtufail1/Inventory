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
    blue: "border-blue-500/30 bg-blue-500/10 dark:bg-blue-500/5",
    orange: "border-orange-500/30 bg-orange-500/10 dark:bg-orange-500/5",
    purple: "border-purple-500/30 bg-purple-500/10 dark:bg-purple-500/5",
    green: "border-green-500/30 bg-green-500/10 dark:bg-green-500/5",
    red: "border-red-500/30 bg-red-500/10 dark:bg-red-500/5",
    teal: "border-teal-500/30 bg-teal-500/10 dark:bg-teal-500/5",
  };
  const iconColorMap = {
    blue: "text-blue-600 dark:text-blue-400",
    orange: "text-orange-600 dark:text-orange-400",
    purple: "text-purple-600 dark:text-purple-400",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    teal: "text-teal-600 dark:text-teal-400",
  };

  return (
    <div
      className={`border rounded-xl p-4 transition-all hover:shadow-md ${colorMap[color]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold mt-0.5 ${iconColorMap[color]}`}>
            {typeof value === "number" ? value.toLocaleString("en-IN") : value}
          </p>
          {change !== undefined && change !== 0 && (
            <div
              className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
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
        <div className={`${iconColorMap[color]} opacity-70`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
