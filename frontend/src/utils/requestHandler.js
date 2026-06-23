import {handleApiError} from "./errorHandler";

const requestHandler = async (apiCall) => {
    try {
        const response = await apiCall();
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export default requestHandler;