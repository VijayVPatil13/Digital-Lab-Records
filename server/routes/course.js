// File: ElectronicLabJournal/server/routes/course.js

const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// ADD new course
router.post("/", async (req, res) => {
  try {
    const { title, description, faculty } = req.body;

    const newCourse = new Course({
      title,
      description,
      faculty,
    });

    await newCourse.save();

    res.status(201).json({ message: "Course added successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Error saving course", error });
  }
});

// GET all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error });
  }
});

module.exports = router;
