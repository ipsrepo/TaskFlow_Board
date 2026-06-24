import api from "../utils/api";
import requestHandler from "../utils/requestHandler";

const API = "/projects";

export const getStatusBoards = (projectId) =>
    requestHandler(() =>
        api.get(`${API}/${projectId}/status-boards`)
    );

export const createStatusBoard = (projectId, boardData) =>
    requestHandler(() =>
        api.post(`${API}/${projectId}/status-boards`, boardData)
    );

export const updateStatusBoard = (
    projectId,
    boardName,
    boardData
) =>
    requestHandler(() =>
        api.put(
            `${API}/${projectId}/status-boards/${boardName}`,
            boardData
        )
    );

export const deleteStatusBoard = (
    projectId,
    boardName
) =>
    requestHandler(() =>
        api.delete(
            `${API}/${projectId}/status-boards/${boardName}`
        )
    );