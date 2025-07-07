const JobPost = require("../models/JobPost");

exports.getAdminDashboard = async (req, res) => {
  try {
    const jobPosts = await JobPost.find({});
    console.log("Fetched job posts:", jobPosts);
    res.render("Job-dashboard", { jobPosts: jobPosts || [] });
  } catch (err) {
    console.error("Error fetching job posts:", err);
    res.status(500).send("Server Error");
  }
};

exports.proceedPage = async (req, res) => {
  try {
    const jobPost = await JobPost.findById(req.params.id);
    res.render("proceed-page", { jobPost });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
