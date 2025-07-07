

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const authRouter = require("./routes/authRoutes");
const jobController = require("./controllers/jobController");
const { authMiddleware } = require("./middlewares/authMiddleware");
//const { ObjectId } = require("mongodb").ObjectId;
const app = express();
const PORT = process.env.PORT || 5000;



mongoose
  .connect(process.env.MONGODB_URI_DRDO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Connect to Candidates Database
const candidatesDB = mongoose.createConnection(
  process.env.MONGODB_URI_CANDIDATES,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
// Connect to Experts Database
const expertsDB = mongoose.createConnection(
  process.env.MONGODB_URI_EXPERTS,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

// Session Configuration
app.use(
  session({
    secret: "secret_key", // Change this to a strong secret key
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:process.env.MONGODB_URI_DRDO,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Middleware to log request URLs
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  next();
});
// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// Set EJS as the template engine
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

// Set the public directory for serving static files
app.use(express.static(path.join(__dirname, "public")));



app.get("/admin-dashboard", (req, res) => {
  res.render("admin-dashboard", { user: req.session.user });
});

// Define a Schema and Model
const candidateSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  roll: String,
  postname: String,
  expertise: [String],
  postcode: String,
  experience: String,
});

const Candidate = candidatesDB.model("Candidate", candidateSchema);

// Handle form submission
app.post("/submit-candidate", async (req, res) => {
  try {
    const expertiseArray = req.body.expertise
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
    console.log(expertiseArray);

    const newCandidate = new Candidate({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      roll: req.body.roll,
      postname: req.body.postname,
      expertise: expertiseArray,
      postcode: req.body.postcode,
      experience: req.body.experience,
    });

    await newCandidate.save(); // Use async/await to handle the save operation
    res.redirect("/admin-dashboard"); // Redirect to the admin dashboard page
  } catch (err) {
    console.error("Error saving candidate data:", err);
    res.status(500).send("Error saving candidate data.");
  }
});

const expertSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  id: String,
  department: String,
  expertise: [String],
  experience: String,
  category: String,
  availability: String,
});

const Expert = expertsDB.model("Expert", expertSchema);

// Handle form submission
app.post("/submit-expert", async (req, res) => {
  try {
    const expertiseArray = req.body.expertise
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
    //console.log(expertiseArray);

    const newExpert = new Expert({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      id: req.body.id,
      department: req.body.department,
      expertise: expertiseArray,
      availability: req.body.availability,
      category: req.body.category,
      experience: req.body.experience,
    });

    await newExpert.save(); // Use async/await to handle the save operation
    res.redirect("/admin-dashboard"); // Redirect to the admin dashboard page
  } catch (err) {
    console.error("Error saving Expert data:", err);
    res.status(500).send("Error saving expert data.");
  }
});

// Routing
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

// Apply authentication middleware to all routes
app.use(authMiddleware);

app.get("/add-candidate", (req, res) => {
  res.render("add-candidate", { user: req.session.user });
});

app.get("/add-experts", (req, res) => {
  res.render("add-experts", { user: req.session.user });
});


app.get("/candidates-list", async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    res.render("candidates-list", { candidates, user: req.session.user });
  } catch (err) {
    console.error("Error fetching candidates:", err);
    res.status(500).send("Error fetching candidates.");
  }
});

app.get("/experts-list", async (req, res) => {
  try {
    const experts = await Expert.find({});
    res.render("experts-list", { experts, user: req.session.user });
  } catch (err) {
    console.error("Error fetching experts:", err);
    res.status(500).send("Error fetching experts.");
  }
});

app.get("/Job-dashboard", jobController.getAdminDashboard);

app.get("/api/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    res.json(candidates);
  } catch (err) {
    console.error("Error fetching candidates:", err);
    res.status(500).json({ error: "Error fetching candidates." });
  }
});

// Route handler for editing expert
app.get("/edit-candidateForm/:id", async (req, res) => {
  try {
    const candidateId = req.params.id;
    //console.log("Candidate ID from query:", candidateId);

    // Fetch expert data by custom 'id' field
    const candidate = await Candidate.findById(candidateId);
    //console.log("Query Result:", candidate);

    if (!candidate) {
      return res.status(404).send("Candidate data not found.");
    }
    res.render("edit-candidateForm", { candidate });
  } catch (err) {
    console.error("Error fetching candidate data:", err);
    res.status(500).send("Error fetching candidate data.");
  }
});

// Route to handle expert information update
app.post("/update-candidate/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const expertiseArray = req.body.expertise
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const updatedData = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      roll: req.body.roll,
      postcode: req.body.postcode,
      expertise: expertiseArray,
      postname: req.body.postname,
      experience: req.body.experience,
    };

    await Candidate.findByIdAndUpdate(id, updatedData, { new: true }); // Update expert in the database

    res.redirect("/admin-dashboard"); // Redirect to the experts list page
  } catch (err) {
    console.error("Error updating candidate data:", err);
    res.status(500).send("Error updating candidate data.");
  }
});

app.post("/delete-candidate/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Candidate.findByIdAndDelete(id);
    res.redirect("/candidates-list");
  } catch (err) {
    console.error("Error deleting candidate:", err);
    res.status(500).send("Error deleting candidate.");
  }
});

// Route handler for editing expert
app.get("/edit-expertForm/:id", async (req, res) => {
  try {
    const expertId = req.params.id;
    //console.log("Expert ID from query:", expertId);
    if (!mongoose.Types.ObjectId.isValid(expertId)) {
      return res.status(400).send("Invalid ID format.");
    }
    // Fetch expert data by custom 'id' field
    const expert = await Expert.findById(expertId);
    //console.log("Query Result:", expert);

    if (!expert) {
      return res.status(404).send("Expert data not  found.");
    }
    //res.render("edit-expertForm", { expert, user: req.session.user });
    res.render("edit-expertForm", { expert });
  } catch (err) {
    console.error("Error fetching expert data:", err);
    res.status(500).send("Error fetching expert data.");
  }
});

// Route to handle expert information update
app.post("/update-expert/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const expertiseArray = req.body.expertise
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const updatedData = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      user_id: req.body.user_id,
      department: req.body.department,
      expertise: expertiseArray,
      availability: req.body.availability,
      experience: req.body.experience,
      category: req.body.category,
    };

    await Expert.findByIdAndUpdate(id, updatedData, { new: true }); // Update expert in the database

    res.redirect("/admin-dashboard"); // Redirect to the experts list page
  } catch (err) {
    console.error("Error updating expert data:", err);
    res.status(500).send("Error updating expert data.");
  }
});

app.post("/delete-expert/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Expert.findByIdAndDelete(id);
    res.redirect("/experts-list");
  } catch (err) {
    console.error("Error deleting expert:", err);
    res.status(500).send("Error deleting expert.");
  }
});

// Function to calculate relevancy score based on matching expertise and experience
function calculateRelevancyScore(
  candidateExpertise,
  expertExpertise,
  experienceYears
) {
  // Ensure all inputs are valid numbers
  if (!candidateExpertise || !expertExpertise || isNaN(experienceYears)) {
    console.error(
      "Invalid inputs for relevancy score calculation:",
      candidateExpertise,
      expertExpertise,
      experienceYears
    );
    return 0; // Return a default value or handle the case as needed
  }
  const matchingSkills = expertExpertise.filter((skill) =>
    candidateExpertise.includes(skill)
  );

  // Return a default value or handle the case as needed

  const skillMatchScore = matchingSkills.length * 20; // 20 points per matching skill

  // Add experience years to the skill match score
  const totalScore = skillMatchScore + Number(experienceYears);

  return totalScore; // Add years of experience to score
}

app.get("/boardpanel-list", async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    //console.log("Candidates:", candidates);
    const experts = await Expert.find({});
    const relevanceScores = {};

    res.render("boardpanel-list", {
      candidates,
      relevanceScores,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error matching candidates and experts:", err);
    res.status(500).send("Error matching candidates and experts.");
  }
});

// Match candidate with experts based on department and availability
app.get("/interview-panel/:candidateId", async (req, res) => {
  try {
    //console.log("Route /interview-panel/:candidateId was hit");
    const candidate = await Candidate.findById(req.params.candidateId);

    if (!candidate) {
      return res.status(404).send("Candidate not found");
    }

    //console.log("Candidate's postname:", candidate.postname);

    // Fetch DRDO experts with the same department and availability
    const drdoExperts = await Expert.find({
      department: new RegExp(`^${candidate.postname}$`, "i"),
      category: "drdo",
      availability: "Available",
    });

    // Fetch Industry experts with the same department and availability
    const industryExperts = await Expert.find({
      department: new RegExp(`^${candidate.postname}$`, "i"),
      category: "industry",
      availability: "Available",
    });

    // Fetch Academia experts with the same department and availability
    const academicExperts = await Expert.find({
      department: new RegExp(`^${candidate.postname}$`, "i"),
      category: "academia",
      availability: "Available",
    });

    //console.log(drdoExperts, industryExperts, academicExperts);
    // Debug: Log results of the queries
    //console.log("DRDO Experts:", drdoExperts);
    //console.log("Industry Experts:", industryExperts);
    //console.log("Academic Experts:", academicExperts);

    

    // Calculate relevancy score for DRDO experts
    const matchedDRDOExperts = drdoExperts.map((expert) => {
      const score = calculateRelevancyScore(
        candidate.expertise,
        expert.expertise,
        expert.experience
      );
      return { ...expert.toObject(), score };
    });

    // Calculate relevancy score for Industry experts
    const matchedIndustryExperts = industryExperts.map((expert) => {
      const score = calculateRelevancyScore(
        candidate.expertise,
        expert.expertise,
        expert.experience
      );
      return { ...expert.toObject(), score };
    });

    // Calculate relevancy score for Academia experts
    const matchedAcademicExperts = academicExperts.map((expert) => {
      const score = calculateRelevancyScore(
        candidate.expertise,
        expert.expertise,
        expert.experience
      );
      return { ...expert.toObject(), score };
    });

    // Sort experts by relevancy score (higher score first)
    matchedDRDOExperts.sort((a, b) => b.score - a.score);
    matchedIndustryExperts.sort((a, b) => b.score - a.score);
    matchedAcademicExperts.sort((a, b) => b.score - a.score);

    res.render("interview-panel", {
      candidate,
      drdoExperts: matchedDRDOExperts,
      industryExperts: matchedIndustryExperts,
      academicExperts: matchedAcademicExperts,
    });
  } catch (err) {
    console.error("Error fetching interview panel data:", err);
    res.status(500).send("Error fetching interview panel data.");
  }
});

//Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
