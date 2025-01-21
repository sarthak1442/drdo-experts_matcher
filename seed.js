const mongoose = require("mongoose");
const JobPost = require("./models/JobPost");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI_DRDO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedPosts = async () => {
  await JobPost.deleteMany({});
  await JobPost.create([
    {
      title: "Job Post 1",
      description: "Description for job post 1",
      drdoLink:
        "https://affairscloud.com/jobs/drdo-vrde-recruitment-2024-apprentice-posts-52-vacancies-apply-now/",
      details: { someDetail: "Detail 1" },
    },
    {
      title: "Job Post 2",
      description: "Description for job post 2",
      drdoLink:
        "https://affairscloud.com/jobs/drdo-dmrl-recruitment-2024-apprentice-posts-127-vacancies-apply-now/",
      details: { someDetail: "Detail 2" },
    },
  ]);
  mongoose.connection.close();
};

seedPosts();


