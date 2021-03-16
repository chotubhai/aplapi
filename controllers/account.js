const User = require("../models/User");

const get = async (request, response) => {
  response.status(200).send({
    ...request.user.toJSON(),
    password: undefined,
    password2: undefined,
  });
};

const update = async (request, response) => {
  const { firstname, lastname, email } = request.body;

  if (email && email !== request.user.email) {
    const user = User.findOne({ email });
    if (user)
      return response.status(400).send({ message: "email already taken" });
  }

  await User.updateOne(
    { _id: request.user.id },
    {
      firstname: firstname || request.user.firstname,
      lastname: lastname || request.user.lastname,
      email: email || request.user.email,
    }
  );

  response.status(200).send({ message: "profile updated" });
};

const changePassword = async (request, response) => {
  const { current_password, new_password } = request.body;

  if (!new_password || new_password.length < 8)
    return response
      .status(400)
      .send({ message: "password must be at least 5 characters" });

  if (!(await request.user.comparepassword(current_password)))
    return response.status(400).send({ message: "passwords don't match" });

  request.user.password = new_password;
  await request.user.save();

  // User.updateOne({ _id: request.user.id }, { password: new_password });

  response.status(200).send({ message: "password changed" });
};

const remove = async (request, response) => {
  await User.deleteOne({ _id: request.user.id });

  response.status(200).send({ message: "account delete" });
};

module.exports = { remove, changePassword, update, get };
