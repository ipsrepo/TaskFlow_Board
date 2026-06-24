import {ProjectProvider} from "./ProjectContext";
import {TaskProvider} from "./TaskContext";
import {StatusBoardProvider} from "./StatusBoardContext";
import {AuthProvider} from "./AuthContext.jsx";

export const AppProvider = ({children}) => {
    return (
        <AuthProvider>
            <ProjectProvider>
                <TaskProvider>
                    <StatusBoardProvider>{children}</StatusBoardProvider>
                </TaskProvider>
            </ProjectProvider>
        </AuthProvider>
    );
};