const userService = require('../services/userService');

async function register(req, res) {
  try {
    const user = await userService.register(req.body);
    res.status(200).json({ message: 'User registered', data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function login(req, res) {
  try {

    const user = await userService.login(req.body);
    res.status(200).json({ message: 'User logged in', data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getUserById(req, res) {
  try {

    const user = await userService.getUserById(req.params.id);
    res.status(200).json({ message: 'User', data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getAllUsers(req, res) {
  try {

    const allUsers = await userService.getAllUser();
    res.status(200).json({ message: 'All users', data: allUsers });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function updateUser(req, res) {
  try {

    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({ message: 'User updated', data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteUser(req, res) {
  try {

    const user = await userService.deleteUser(req.params.id);

    res.status(200).json({ message: 'User deleted', data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { register, deleteUser, updateUser, getAllUsers, getUserById, login };
