const express = require('express');
const router = express.Router();
const db = require('../config/db');

// RFID Scan — this is called by ESP8266
router.post('/scan', async (req, res) => {
  try {
    const { rfidUID } = req.body;

    // Find student by RFID
    const snapshot = await db.collection('students')
      .where('rfidUID', '==', rfidUID).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentDoc = snapshot.docs[0];
    const student = studentDoc.data();

    // Get today's date and time
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    // Save attendance
    await db.collection('attendance').add({
      studentId: studentDoc.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      className: student.className,
      date,
      time,
      status: 'present',
      createdAt: now
    });

    res.json({
      message: 'Attendance marked!',
      student: student.name,
      time
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all attendance records
router.get('/all', async (req, res) => {
  try {
    const snapshot = await db.collection('attendance')
      .orderBy('createdAt', 'desc').get();

    const records = [];
    snapshot.forEach(doc => {
      records.push({ id: doc.id, ...doc.data() });
    });

    res.json(records);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance by date
router.get('/date/:date', async (req, res) => {
  try {
    const snapshot = await db.collection('attendance')
      .where('date', '==', req.params.date).get();

    const records = [];
    snapshot.forEach(doc => {
      records.push({ id: doc.id, ...doc.data() });
    });

    res.json(records);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;