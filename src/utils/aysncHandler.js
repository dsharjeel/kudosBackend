// using try catch block to handle async functions
const aysncHandler = (fn) => async (req, res, next) => {
    try {
        return await fn(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            succuss: false,
            message: error.message || "An unknown error occurred!",
        });
    }
};

// Using promise to handle async functions
// const aysncHandler = (requestHandler) => {
//   return (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//   };
// };

export { aysncHandler };
