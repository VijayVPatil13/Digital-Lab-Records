// server/listFaculty.js
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import the User model

// Load environment variables (to get MONGODB_URI)
dotenv.config();

const listFaculty = async () => {
  try {
    // 1. Connect to the MongoDB database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- MongoDB Connection Established ---');

    // 2. Query the User collection for documents where role is 'Faculty'
    const facultyList = await User.find({ role: 'Faculty' }, 'firstName lastName email').lean();

    // 3. Display the results
    console.log(`\n--- Found ${facultyList.length} Faculty Members ---`);
    if (facultyList.length > 0) {
        facultyList.forEach((faculty, index) => {
            console.log(`\n${index + 1}. Name: ${faculty.firstName} ${faculty.lastName}`);
            console.log(`   Email: ${faculty.email}`);
            console.log(`   ID:    ${faculty._id}`);
        });
    } else {
        console.log('No faculty members found in the database.');
    }

  } catch (err) {
    console.error('\n--- SCRIPT ERROR ---');
    console.error(err.message);
  } finally {
    // 4. Disconnect from the database
    mongoose.disconnect();
    console.log('\n--- MongoDB Disconnected ---');
  }
};

listFaculty();
