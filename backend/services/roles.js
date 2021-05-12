const { Role, User } = require("../models");
const { ServiceError } = require("./errors");

/**
 * Returns an array of all roles in Oktavian
 */
async function getAllRoles() {
  return Role.find();
}

/**
 * Edit an existing role
 */
async function editRole(rawRole) {
  const role = await Role.findById(rawRole._id);
  if (role === null) {
    throw ServiceError(404, "Role does not exist");
  }
  role.set(rawRole);
  return role.save();
}

/**
 * Create a new role
 */
async function createRole(rawRole) {
  const role = await Role.findOne({ name: rawRole.name });
  if (role !== null) {
    throw ServiceError(409, `A role named '${rawRole.name}' already exists`);
  }
  return Role.create(rawRole);
}

/**
 * Delete a role
 */
async function deleteRole(id) {
  const role = await Role.findById(id);
  if (role === null) {
    throw ServiceError(404, "Role does not exist");
  }

  const usersWithRole = await User.find({ role }).exec();
  await Promise.all(
    usersWithRole.map((user) => async () => {
      delete user.role;
      return user.save();
    })
  );

  return role.delete();
}

module.exports = {
  getAllRoles,
  editRole,
  createRole,
  deleteRole,
};
