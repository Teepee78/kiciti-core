import Joi from "joi";


const createSchema = Joi.object({
  username: Joi.string().min(2).max(50),
  first_name:  Joi.string().min(2).max(50).required(),
  middle_name: Joi.string().min(2).max(50),
  surname: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(4).required(),
  dob: Joi.date().required(),
  country: Joi.string().required(),
  gender: Joi.string().valid("male", "female").required(),
});


async function validateAccount(req, res, next) {
  const result = await createSchema.validate(req.body);

  if (result.error) return res.status(400).json({
    message: result.error.details[0].message,
    data: req.body
  });

  // Convert values to lowercase and trim
  req.body.username = req.body.username.toLowerCase().trim();
  req.body.first_name = req.body.first_name.toLowerCase().trim();
  if (req.body.hasOwnProperty("middle_name")) {
    req.body.middle_name = req.body.middle_name.toLowerCase().trim();
  }
  req.body.surname = req.body.surname.toLowerCase().trim();
  req.body.email = req.body.email.toLowerCase().trim();
  req.body.country = req.body.country.toLowerCase().trim();
  req.body.gender = req.body.gender.toLowerCase().trim();


  next();
};


export default validateAccount;
