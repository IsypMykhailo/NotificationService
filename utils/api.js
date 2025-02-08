exports.apiResponse = (status, data, error = null) => {
    return {
        status: status,
        success: status >= 200 && status <= 299,
        error: error,
        data: data
    }
}