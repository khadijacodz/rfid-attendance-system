const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Add new student
router.post('/add', async (req, res) => {
  try {
    const { name, rollNumber, rfidUID, className } = req.body;

    // Check if RFID already exists
    const rfidCheck = await db.collection('students')
      .where('rfidUID', '==', rfidUID).get();

    if (!rfidCheck.empty) {
      return res.status(400).json({ message: 'RFID already registered' });
    }

    // Save student
    await db.collection('students').add({
      name,
      rollNumber,
      rfidUID,
      className,
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Student added successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all students
router.get('/all', async (req, res) => {
  try {
    const snapshot = await db.collection('students').get();
    const students = [];

    snapshot.forEach(doc => {
      students.push({ id: doc.id, ...doc.data() });
    });

    res.json(students);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete student
router.delete('/delete/:id', async (req, res) => {
  try {
    await db.collection('students').doc(req.params.id).delete();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;