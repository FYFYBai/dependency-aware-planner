import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import type { Task } from "../api/projects";

interface GraphViewProps {
  tasks: Task[];
}

export default function GraphView({ tasks }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        // Nodes
        ...tasks.map((t) => ({
          data: {
            id: String(t.id),
            label: t.name,
            labelLength: t.name.length,
          },
        })),
        // Edges
        ...tasks.flatMap((t) =>
          (t.dependencyIds || []).map((depId) => ({
            data: { source: String(depId), target: String(t.id) },
          }))
        ),
      ],
      style: [
        {
          selector: "node",
          style: {
            shape: "round-rectangle",
            "background-color": "#007bff",
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            color: "#fff",
            "font-size": "12px",
            padding: "8px",
            height: "40px",
            // Width will be at least 120, and grows with label length
            width: "mapData(labelLength, 0, 50, 120, 300)",
            "border-width": 2,
            "border-color": "#0056b3",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#888",
            "target-arrow-color": "#888",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],
      layout: { name: "breadthfirst", directed: true, padding: 20 },
    });

    return () => {
      cy.destroy();
    };
  }, [tasks]);

  return <div ref={containerRef} style={{ height: "800px", width: "100%" }} />;
}
