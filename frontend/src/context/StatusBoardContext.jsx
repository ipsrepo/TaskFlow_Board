import { createContext, useCallback, useState } from "react";
import * as statusBoardService from "../services/statusBoard.service";

export const StatusBoardContext = createContext(null);

export const StatusBoardProvider = ({ children }) => {
    const [statusBoards, setStatusBoards] = useState([]);

    const fetchStatusBoards = useCallback(async (projectId) => {
        const res = await statusBoardService.getStatusBoards(projectId);
        if (res.success) setStatusBoards(res.statusBoards || []);
        return res;
    }, []);

    const createStatusBoard = useCallback(async (id, data) => {
        const res = await statusBoardService.createStatusBoard(id, data);
        if (res.success) setStatusBoards(res.statusBoards || []);
        return res;
    }, []);

    const updateStatusBoard = useCallback(async (id, name, data) => {
        const res = await statusBoardService.updateStatusBoard(
            id,
            name,
            data
        );
        if (res.success) setStatusBoards(res.statusBoards || []);
        return res;
    }, []);

    const deleteStatusBoard = useCallback(async (id, name) => {
        const res = await statusBoardService.deleteStatusBoard(id, name);
        if (res.success) setStatusBoards(res.statusBoards || []);
        return res;
    }, []);

    return (
        <StatusBoardContext.Provider
            value={{
                statusBoards,
                fetchStatusBoards,
                createStatusBoard,
                updateStatusBoard,
                deleteStatusBoard,
            }}
        >
            {children}
        </StatusBoardContext.Provider>
    );
};