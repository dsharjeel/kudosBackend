import { aysncHandler } from "../utils/aysncHandler.js";

const registerUser = aysncHandler(async (req, res) => {
    res.status(201).json({
        success: true,
        message: "User registered successfully",
    });
});

export { registerUser };