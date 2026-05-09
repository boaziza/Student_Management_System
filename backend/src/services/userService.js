const crypto  = require('crypto');
const jwt     = require('jsonwebtoken');
const userModel = require('../models/userModel');
const userDto = require('../dtos/userDto');
const deviceModel = require('../models/deviceModel');

function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha512').update(salt + password).digest('hex');
  return { salt, hash };
}

function verifyPassword(inputPassword, storedHash, storedSalt) {
  const inputHash = crypto.createHash('sha512').update(storedSalt + inputPassword).digest('hex');
  return inputHash === storedHash; // true = correct password
}

async function register(data) {
  const existing = await userModel.findByEmail(data.email);
  if (existing) throw new Error('Email already in use');

  const { salt, hash } = hashPassword(data.password);

  const user = await userModel.create({
    email:         data.email,
    password_hash: hash,
    password_salt: salt,
    role:          data.role,
    first_name:    data.first_name,
    last_name:     data.last_name,
    phone:         data.phone,
  });

  return userDto(user);
}

async function login(data) {
    const user = await userModel.findByEmail(data.email);
    if (!user) throw new Error('Invalid email or password');

    if (!verifyPassword(data.password, user.password_hash, user.password_salt)) {
      throw new Error('Invalid email or password');
    }

    const device = await deviceModel.findOne(user.id, data.device_id);

    if (!device) {            
        throw new Error('Device not registered');
    };

    if (!device.is_verified){ 
        throw new Error('Device not verified by admin');
    };
    const token = jwt.sign(
        { id: user.id, role: user.role, device_id: data.device_id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return { token, user: userDto(user) };

}

async function getAllUser() {
    const allUsers = await userModel.findAll();
    if (allUsers.length === 0) throw new Error('No users found');

    return allUsers.map(userDto);
}

async function getUserById(id) {
    const user = await userModel.findById(id);
    if (!user) throw new Error('User not found');

    return userDto(user);
}

async function updateUser(id, data) {
    const user = await userModel.findById(id);
    if (!user) throw new Error('User not found');

    let password_hash = user.password_hash;
    let password_salt = user.password_salt;

    if (data.password) {
        const { salt, hash } = hashPassword(data.password);
        password_hash = hash;
        password_salt = salt
    }

    const updated = await userModel.update(id, {
        email:         data.email,
        password_hash: password_hash,
        password_salt: password_salt,
        role:          data.role,
        first_name:    data.first_name,
        last_name:     data.last_name,
        phone:         data.phone,
    });

    return userDto(updated);

}

async function deleteUser(id) {
    const user = await userModel.findById(id);
    if (!user) throw new Error('User not found');

    const deletedUser = await userModel.remove(id);

    return userDto(deletedUser);
}



module.exports = { register, login, updateUser, deleteUser, getUserById, getAllUser  };
