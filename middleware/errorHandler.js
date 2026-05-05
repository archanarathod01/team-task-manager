module.exports = (err, req, res, next) => {
  console.error("🔥 ERROR:", err.stack);

  // अगर headers already sent हैं तो next करो
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};