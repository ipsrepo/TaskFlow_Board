export const handleApiError = (error) => {
    if (error.response) {
        return {
            success: false,
            status: error.response.status,
            message: error.response.data?.message || "Server error",
            data: error.response.data,
        };
    }

    if (error.request) {
        return {
            success: false,
            status: 0,
            message: "Network error",
        };
    }

    return {
        success: false,
        status: 500,
        message: error.message || "Unknown error",
    };
};