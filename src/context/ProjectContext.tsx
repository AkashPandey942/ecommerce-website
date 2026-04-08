"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ProjectContextType {
  credits: number;
  spendCredits: (amount: number) => boolean;
  currentProject: any;
  setProjectData: (data: any) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState(250);
  const [currentProject, setCurrentProject] = useState<any>(null);

  // Persistence for demo (Staff level improvement)
  useEffect(() => {
    const saved = localStorage.getItem("saas_credits");
    if (saved) setCredits(parseInt(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("saas_credits", credits.toString());
  }, [credits]);

  const spendCredits = (amount: number) => {
    if (credits >= amount) {
      setCredits((prev) => prev - amount);
      return true;
    }
    return false;
  };

  const setProjectData = (data: any) => {
    setCurrentProject(data);
  };

  return (
    <ProjectContext.Provider value={{ credits, spendCredits, currentProject, setProjectData }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
