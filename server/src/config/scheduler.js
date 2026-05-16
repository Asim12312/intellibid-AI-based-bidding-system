import cron from 'node-cron';
import { runProfileBuilder } from '../modules/profile-builder/profileBuilder.job.js';

export const startScheduler = () => {
    // Hourly: rebuild profiles for active users
    cron.schedule('0 * * * *', async () => {
        await runProfileBuilder();
    });

    // Daily at 2am: full rebuild for all users
    cron.schedule('0 2 * * *', async () => {
        console.log('[Scheduler] Running nightly full profile rebuild...');
        await runProfileBuilder();
    });

    console.log('[Scheduler] Cron jobs started. Profile builder runs hourly.');
};
