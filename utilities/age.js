function validateAge(dob) {
	let today = new Date();
  let birthDate = new Date(dob);

  let age = today.getFullYear() - birthDate.getFullYear();

  return age > 18;
}

export default validateAge;
