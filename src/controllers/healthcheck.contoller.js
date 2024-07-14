import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponseHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(true, "Server is running", null));
})

export { healthCheck };