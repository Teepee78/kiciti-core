function urlLogger(req, res, next) {
  console.log(`${req.method} ${req.url}`);

	next();
}


export default urlLogger;
