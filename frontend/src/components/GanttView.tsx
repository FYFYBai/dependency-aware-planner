// src/components/GanttView.tsx
import { useEffect, useRef } from "react";
import Gantt from "frappe-gantt";
import type { Task } from "../api/projects";

export default function GanttView({ tasks }: { tasks: Task[] }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const ganttTasks = (tasks ?? []).map((t) => ({
      id: String(t.id),
      name: t.name || `Task #${t.id}`,
      start: t.startDate
        ? new Date(t.startDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      end: t.dueDate
        ? new Date(t.dueDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      progress: 0,
      dependencies: (t.dependencyIds ?? []).map(String).join(","),
    }));

    hostRef.current.innerHTML = "";

    new Gantt(hostRef.current, ganttTasks, {
      view_mode: "Day",
      language: "en",
      popup: ({ task }: any) =>
        `<div class="p-2"><strong>${task.name}</strong><br/>Start: ${task.start}<br/>End: ${task.end}</div>`,
    } as any);
  }, [tasks]);

  return (
    <div
      ref={hostRef}
      className="w-full bg-white border border-gray-200 rounded"
      style={{ height: "calc(100vh - 120px)", minHeight: "700px" }}
    />
  );
}
