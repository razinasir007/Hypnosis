// ErrorHandler.js
const ErrorHandler = (err, req, res, next) => {
  // console.log("Middleware Error Hadnling");
  const errStatus = err.status || 500;
  const errMsg = err.message || "Something went wrong";
  return res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
  });
};

module.exports = { ErrorHandler };
