const express = require('express');
const router = express.Router();
const Baby = require('../models/Baby');
const FeedingLog = require('../models/FeedingLog');
const SleepLog = require('../models/SleepLog');
const Vaccination = require('../models/Vaccination');
const Milestone = require('../models/Milestone');
const { protect } = require('../middleware/auth');

// Get comprehensive dashboard analytics for a baby
router.get('/dashboard/:babyId', protect, async (req, res) => {
    try {
        const { babyId } = req.params;
        
        console.log('Analytics request - Baby ID:', babyId);
        console.log('Analytics request - User ID:', req.user._id);
        
        // Verify baby exists and belongs to user
        const baby = await Baby.findOne({ _id: babyId, parent: req.user._id });
        
        console.log('Baby found:', baby ? 'Yes' : 'No');
        
        if (!baby) {
            // Debug: check if baby exists at all
            const babyExists = await Baby.findById(babyId);
            console.log('Baby exists in DB:', babyExists ? 'Yes (user mismatch)' : 'No');
            
            return res.status(404).json({
                success: false,
                message: 'Baby not found'
            });
        }

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get last 7 days for weekly insights
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // FEEDING ANALYTICS
        const todayFeedings = await FeedingLog.find({
            baby: babyId,
            time: { $gte: today, $lt: tomorrow }
        }).sort({ time: -1 });

        console.log('Today feedings found:', todayFeedings.length);
        console.log('Today date range:', today, 'to', tomorrow);

        const weekFeedings = await FeedingLog.find({
            baby: babyId,
            time: { $gte: sevenDaysAgo, $lt: tomorrow }
        }).sort({ time: -1 });

        console.log('Week feedings found:', weekFeedings.length);

        // Calculate feeding metrics
        const totalFeedingsToday = todayFeedings.length;
        const avgFeedingsPerDay = weekFeedings.length / 7;
        
        // Find most common feeding hour
        const feedingHours = weekFeedings.map(f => new Date(f.time).getHours());
        const hourCounts = {};
        feedingHours.forEach(hour => {
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        const peakHour = Object.keys(hourCounts).reduce((a, b) => 
            hourCounts[a] > hourCounts[b] ? a : b, 0);
        const peakTime = peakHour ? `${peakHour}:00 ${peakHour >= 12 ? 'PM' : 'AM'}` : '--';

        // Calculate next feeding suggestion (3 hours from last feeding)
        let nextSuggestion = null;
        if (todayFeedings.length > 0) {
            const lastFeeding = new Date(todayFeedings[0].time);
            nextSuggestion = new Date(lastFeeding.getTime() + 3 * 60 * 60 * 1000);
        }

        // SLEEP ANALYTICS
        const todaySleep = await SleepLog.find({
            baby: babyId,
            startTime: { $gte: today, $lt: tomorrow }
        });

        console.log('Today sleep sessions found:', todaySleep.length);

        const weekSleep = await SleepLog.find({
            baby: babyId,
            startTime: { $gte: sevenDaysAgo, $lt: tomorrow }
        });

        console.log('Week sleep sessions found:', weekSleep.length);

        // Calculate sleep hours
        const calculateSleepHours = (logs) => {
            return logs.reduce((total, log) => {
                const start = new Date(log.startTime);
                const end = log.endTime ? new Date(log.endTime) : new Date();
                const hours = (end - start) / (1000 * 60 * 60);
                return total + hours;
            }, 0);
        };

        const totalSleepToday = calculateSleepHours(todaySleep);
        const avgSleepPerDay = calculateSleepHours(weekSleep) / 7;

        // VACCINATION ANALYTICS
        const allVaccinations = await Vaccination.find({ baby: babyId }).sort({ dueDate: 1 });
        const completedVaccinations = allVaccinations.filter(v => v.status === 'completed');
        const upcomingVaccinations = allVaccinations.filter(v => v.status === 'upcoming' || v.status === 'pending');
        
        const nextVaccination = upcomingVaccinations[0];
        const vaccinationProgress = allVaccinations.length > 0 
            ? Math.round((completedVaccinations.length / allVaccinations.length) * 100)
            : 0;

        // MILESTONE ANALYTICS
        const milestones = await Milestone.find({ baby: babyId }).sort({ ageInMonths: 1 });
        const completedMilestones = milestones.filter(m => m.status === 'completed');
        const milestoneProgress = milestones.length > 0
            ? Math.round((completedMilestones.length / milestones.length) * 100)
            : 0;

        // Build response
        const analytics = {
            baby: {
                name: baby.name,
                dateOfBirth: baby.dateOfBirth,
                gender: baby.gender,
                ageInDays: baby.ageInDays,
                ageInWeeks: baby.ageInWeeks,
                ageInMonths: baby.ageInMonths,
                ageFormatted: baby.ageFormatted
            },
            feeding: {
                totalToday: totalFeedingsToday,
                avgPerDay: Math.round(avgFeedingsPerDay * 10) / 10,
                peakTime: peakTime,
                lastFeedingTime: todayFeedings[0]?.time || null,
                nextSuggestion: nextSuggestion
            },
            sleep: {
                totalHoursToday: Math.round(totalSleepToday * 10) / 10,
                sessionsToday: todaySleep.length,
                avgPerDay: Math.round(avgSleepPerDay * 10) / 10,
                weeklyTrend: weekSleep.length
            },
            vaccination: {
                total: allVaccinations.length,
                completed: completedVaccinations.length,
                upcoming: upcomingVaccinations.length,
                progress: vaccinationProgress,
                nextVaccine: nextVaccination?.name || null,
                nextDueDate: nextVaccination?.dueDate || null
            },
            milestones: {
                total: milestones.length,
                completed: completedMilestones.length,
                progress: milestoneProgress
            }
        };

        res.json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
});

// Auto-generate vaccinations and milestones for a baby
router.post('/auto-generate/:babyId', protect, async (req, res) => {
    try {
        const { babyId } = req.params;
        
        const baby = await Baby.findOne({ _id: babyId, parent: req.user._id });
        if (!baby) {
            return res.status(404).json({
                success: false,
                message: 'Baby not found'
            });
        }

        const birthDate = new Date(baby.dateOfBirth);
        const vaccinations = [];
        const milestones = [];

        // Generate vaccination schedule
        const vaccineSchedule = [
            { name: 'BCG', ageMonths: 0, description: 'Bacillus Calmette-Guerin (Tuberculosis)' },
            { name: 'Hepatitis B (1st dose)', ageMonths: 0, description: 'First dose at birth' },
            { name: 'OPV 0', ageMonths: 0, description: 'Oral Polio Vaccine (birth dose)' },
            { name: 'Hepatitis B (2nd dose)', ageMonths: 1, description: 'Second dose' },
            { name: 'DTaP 1', ageMonths: 2, description: 'Diphtheria, Tetanus, Pertussis' },
            { name: 'IPV 1', ageMonths: 2, description: 'Inactivated Polio Vaccine' },
            { name: 'Hib 1', ageMonths: 2, description: 'Haemophilus influenzae type b' },
            { name: 'PCV 1', ageMonths: 2, description: 'Pneumococcal Conjugate Vaccine' },
            { name: 'Rotavirus 1', ageMonths: 2, description: 'Rotavirus Vaccine' },
            { name: 'DTaP 2', ageMonths: 4, description: 'Second dose' },
            { name: 'IPV 2', ageMonths: 4, description: 'Second dose' },
            { name: 'Hib 2', ageMonths: 4, description: 'Second dose' },
            { name: 'PCV 2', ageMonths: 4, description: 'Second dose' },
            { name: 'Rotavirus 2', ageMonths: 4, description: 'Second dose' },
            { name: 'DTaP 3', ageMonths: 6, description: 'Third dose' },
            { name: 'IPV 3', ageMonths: 6, description: 'Third dose' },
            { name: 'Hib 3', ageMonths: 6, description: 'Third dose' },
            { name: 'PCV 3', ageMonths: 6, description: 'Third dose' },
            { name: 'Hepatitis B (3rd dose)', ageMonths: 6, description: 'Third dose' },
            { name: 'Influenza', ageMonths: 6, description: 'Annual flu vaccine' },
            { name: 'MMR 1', ageMonths: 12, description: 'Measles, Mumps, Rubella' },
            { name: 'Varicella 1', ageMonths: 12, description: 'Chickenpox vaccine' },
            { name: 'Hepatitis A 1', ageMonths: 12, description: 'First dose' },
            { name: 'PCV 4', ageMonths: 15, description: 'Booster dose' },
            { name: 'DTaP 4', ageMonths: 18, description: 'Booster dose' },
            { name: 'Hepatitis A 2', ageMonths: 18, description: 'Second dose' }
        ];

        for (const vaccine of vaccineSchedule) {
            const dueDate = new Date(birthDate);
            dueDate.setMonth(dueDate.getMonth() + vaccine.ageMonths);
            
            const existing = await Vaccination.findOne({
                baby: babyId,
                name: vaccine.name
            });
            
            if (!existing) {
                const vaccination = new Vaccination({
                    baby: babyId,
                    name: vaccine.name,
                    dueDate: dueDate,
                    ageMonths: vaccine.ageMonths,
                    description: vaccine.description,
                    status: dueDate < new Date() ? 'overdue' : 'upcoming'
                });
                await vaccination.save();
                vaccinations.push(vaccination);
            }
        }

        // Generate milestone schedule
        const milestoneSchedule = [
            { name: 'First Smile', ageMonths: 2, category: 'Social', description: 'Smiles at people' },
            { name: 'Holds Head Up', ageMonths: 3, category: 'Physical', description: 'Holds head steady when upright' },
            { name: 'Laughs', ageMonths: 4, category: 'Social', description: 'Laughs out loud' },
            { name: 'Rolls Over', ageMonths: 4, category: 'Physical', description: 'Rolls from tummy to back' },
            { name: 'Reaches for Toys', ageMonths: 5, category: 'Physical', description: 'Reaches for and grasps toys' },
            { name: 'Sits Without Support', ageMonths: 6, category: 'Physical', description: 'Sits without support' },
            { name: 'Babbles', ageMonths: 6, category: 'Language', description: 'Makes babbling sounds' },
            { name: 'Crawls', ageMonths: 8, category: 'Physical', description: 'Crawls forward on belly' },
            { name: 'Says "Mama" or "Dada"', ageMonths: 9, category: 'Language', description: 'First words' },
            { name: 'Pulls to Stand', ageMonths: 9, category: 'Physical', description: 'Pulls self to standing position' },
            { name: 'Waves Bye-bye', ageMonths: 10, category: 'Social', description: 'Waves goodbye' },
            { name: 'Walks Holding On', ageMonths: 11, category: 'Physical', description: 'Walks while holding furniture' },
            { name: 'First Steps', ageMonths: 12, category: 'Physical', description: 'Takes first independent steps' },
            { name: 'Uses Simple Gestures', ageMonths: 12, category: 'Social', description: 'Shakes head no, points' },
            { name: 'Drinks from Cup', ageMonths: 13, category: 'Self-Care', description: 'Drinks from cup with help' },
            { name: 'Walks Independently', ageMonths: 15, category: 'Physical', description: 'Walks without support' },
            { name: 'Uses Spoon', ageMonths: 18, category: 'Self-Care', description: 'Feeds self with spoon' },
            { name: 'Runs', ageMonths: 18, category: 'Physical', description: 'Runs steadily' },
            { name: 'Two-Word Phrases', ageMonths: 24, category: 'Language', description: 'Combines two words' },
            { name: 'Kicks Ball', ageMonths: 24, category: 'Physical', description: 'Kicks ball forward' }
        ];

        for (const milestone of milestoneSchedule) {
            const existing = await Milestone.findOne({
                baby: babyId,
                name: milestone.name
            });
            
            if (!existing) {
                const newMilestone = new Milestone({
                    baby: babyId,
                    name: milestone.name,
                    category: milestone.category,
                    description: milestone.description,
                    ageInMonths: milestone.ageMonths,
                    status: baby.ageInMonths >= milestone.ageMonths ? 'pending' : 'upcoming'
                });
                await newMilestone.save();
                milestones.push(newMilestone);
            }
        }

        res.json({
            success: true,
            message: 'Successfully generated vaccinations and milestones',
            data: {
                vaccinationsCreated: vaccinations.length,
                milestonesCreated: milestones.length
            }
        });

    } catch (error) {
        console.error('Auto-generate error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating data',
            error: error.message
        });
    }
});

module.exports = router;
