import {createRoot} from 'react-dom/client';
import {RouterProvider} from "react-router-dom";
import {router} from "./app/router";
import {AppProvider} from "./context/AppProvider.jsx";
import './index.css';

createRoot(document.getElementById('root')).render(
    <AppProvider>
        <RouterProvider router={router}/>
    </AppProvider>
);