import { useContext } from "react";
import { ProjectContext } from "../context/ProjectContext";

const useProject = () => {
    const ctx = useContext(ProjectContext);
    if (!ctx) throw new Error("useProject must be used within ProjectProvider");
    return ctx;
};

export default useProject;