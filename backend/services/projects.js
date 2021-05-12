const { Project } = require("../models");

/**
 * Returns all projects.
 */
async function getAllProjects() {
  return Project.find();
}

/**
 * Returns an array of projects that the user is a contributor to.
 */
async function getUserProjects(user_id) {
  return Project.find().or([
    {
      project_manager: user_id,
    },
    {
      outreach: user_id,
    },
    {
      designers: user_id,
    },
    {
      developers: user_id,
    },
  ]);
}

module.exports = {
  getAllProjects,
  getUserProjects,
};