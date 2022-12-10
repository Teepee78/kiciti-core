import Joi from "joi";


const createSchema = Joi.object({
  username: Joi.string().min(2).max(50),
  first_name:  Joi.string().min(2).max(50).required(),
  middle_name: Joi.string().min(2).max(50),
  surname: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(4).required(),
  dob: Joi.date().required(),
  gender: Joi.string().valid("male", "female").required(),
});


async function validateAccount(req, res, next) {
  const result = await createSchema.validate(req.body);

  if (result.error) return res.status(400).json({
    message: result.error.details[0].message,
    data: req.body
  });

  next();
};


export default validateAccount;
