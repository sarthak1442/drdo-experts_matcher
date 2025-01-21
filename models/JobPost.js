const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema({
    title: String,
    description: String,
    drdoLink: String,
    details: Object,
});

module.exports = mongoose.model('JobPosts', jobPostSchema);
