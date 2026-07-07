import {createBrowserRouter, Navigate} from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "../components/Common/ProtectedRoute";

import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";

import SmartDashboard from "../components/Dashboard/SmartDashboard";
import TaskList from "../components/Tasks/TaskList";
import ProjectList from "../components/Projects/ProjectList";
import ProjectDetail from "../components/Projects/ProjectDetail";
import BoardProjectSelector from '../components/Kanban/BoardProjectSelector';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import TaskDetail from "../components/Tasks/TaskDetail";
import UserProfile from "../components/Tasks/UserProfile";
import UserManagement from "../components/Tasks/UserManagement";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/register",
        element: <Register/>
    },

    {
        element: <ProtectedRoute/>,
        children: [
            {
                element: <AppLayout/>,
                children: [
                    {
                        path: "/dashboard",
                        element: <SmartDashboard/>
                    },
                    {
                        path: "/my-tasks",
                        element: <TaskList myTasks/>
                    },
                    {
                        path: "/projects",
                        element: <ProjectList/>
                    },
                    {
                        path: "/projects/:id",
                        element: <ProjectDetail/>
                    },
                    {
                        path: "/board",
                        element: <BoardProjectSelector/>
                    },
                    {
                        path: "/board/:id",
                        element: <KanbanBoard/>
                    },
                    {
                        path: "/projects/:projectId/tasks",
                        element: <TaskList/>
                    },
                    {
                        path: "/tasks/:id",
                        element: <TaskDetail/>
                    },
                    {
                        path: "/profile",
                        element: <UserProfile/>
                    },

                    {
                        element: <ProtectedRoute roles={['admin']}/>,
                        children: [
                            {
                                path: "/users",
                                element: <UserManagement/>
                            }
                        ]
                    }
                ]
            }
        ]
    },

    // Fallback routes
    {
        path: "/",
        element: <Navigate to="/dashboard" replace/>
    },
    {
        path: "*",
        element: <Navigate to="/dashboard" replace/>
    }
]);