// server/migrations/migrateLabSessions.js
// Migration script to add startTime and endTime to existing LabSession documents

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const LabSession = require('../models/LabSession');

async function migrateLabSessions() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/electronic-lab-journal');
        console.log('Connected to MongoDB');

        // Find all lab sessions without startTime or endTime
        const sessionsToUpdate = await LabSession.find({
            $or: [
                { startTime: { $exists: false } },
                { endTime: { $exists: false } }
            ]
        });

        console.log(`Found ${sessionsToUpdate.length} sessions to update`);

        if (sessionsToUpdate.length === 0) {
            console.log('No sessions to update. All sessions have startTime and endTime.');
            await mongoose.connection.close();
            return;
        }

        // Update each session
        let updatedCount = 0;
        for (const session of sessionsToUpdate) {
            try {
                // Use the existing date field as startTime if not set
                // Set endTime to 2 hours after startTime if not set
                const startTime = session.startTime || session.date;
                const endTime = session.endTime || new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

                await LabSession.findByIdAndUpdate(
                    session._id,
                    {
                        startTime: startTime,
                        endTime: endTime
                    },
                    { runValidators: true }
                );

                updatedCount++;
                console.log(`✓ Updated session: ${session.title} (ID: ${session._id})`);
            } catch (error) {
                console.error(`✗ Error updating session ${session._id}:`, error.message);
            }
        }

        console.log(`\nMigration complete! Updated ${updatedCount} sessions.`);

        // Verify the migration
        const verifyCount = await LabSession.countDocuments({
            startTime: { $exists: true },
            endTime: { $exists: true }
        });

        console.log(`Verification: ${verifyCount} sessions now have both startTime and endTime`);

        await mongoose.connection.close();
        console.log('Migration finished. MongoDB connection closed.');
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

// Run the migration
migrateLabSessions();
