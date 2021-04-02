const { STAGES } = require("../constants");
const { Application, ApplicationPipeline } = require("../models");

/**
 * Returns statistics related to the number of applications
 * between two dates. The dates refer to when the application
 * was created, not necessarily updated.
 */
async function getApplicationStats(start_date, end_date) {
  const pipelines = await ApplicationPipeline.find().populate("role").exec();
  const roles = pipelines.map((pipeline) => pipeline.role);
  const stats = {};
  for (const role of roles) {
    const criteria = {
      role,
      created_at: {
        $gte: start_date,
        $lte: end_date,
      },
    };
    stats[role.name] = {};
    for (const stage of STAGES) {
      stats[role.name][stage] = await Application.countDocuments({
        ...criteria,
        completed: false,
        current_stage: stage,
      }).exec();
    }
    stats[role.name].Accepted = await Application.countDocuments({
      ...criteria,
      completed: true,
      accepted: true,
    }).exec();
    stats[role.name].Rejected = await Application.countDocuments({
      ...criteria,
      completed: true,
      accepted: false,
    }).exec();
  }
  return stats;
}

module.exports = {
  getApplicationStats,
};
