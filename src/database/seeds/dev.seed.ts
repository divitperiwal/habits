import { db } from "@/config/database.config";
import { users, habits, trackingLogs } from "@/database/schema";
import { hashPassword } from "@/utils/security/hashing";
import { toDateOnly } from "@/utils/helper/date";

const seed = async () => {
    console.log("Seeding database...");

    await db.delete(trackingLogs);
    await db.delete(habits);
    await db.delete(users);

    // create users
    const [user1, user2, user3] = await db
        .insert(users)
        .values([
            { name: "John Doe", email: "john@example.com", password: await hashPassword("password123") },
            { name: "Jane Smith", email: "jane@example.com", password: await hashPassword("password123") },
            { name: "Alex Kumar", email: "alex@example.com", password: await hashPassword("password123") },
        ])
        .returning({ id: users.id, email: users.email });

    console.log("Users created:", user1!.email, user2!.email, user3!.email);

    // user1 habits
    const [run, read, meditate, review, water, code, sleep, stretch] = await db
        .insert(habits)
        .values([
            {
                userId: user1!.id,
                name: "Morning Run",
                description: "Run 5km every morning",
                frequency: "daily",
                tags: ["fitness", "health"],
                reminderTime: "06:30",
            },
            {
                userId: user1!.id,
                name: "Read Books",
                description: "Read for 30 minutes",
                frequency: "daily",
                tags: ["learning"],
                reminderTime: "21:00",
            },
            {
                userId: user1!.id,
                name: "Meditation",
                description: "10 minutes of mindfulness",
                frequency: "daily",
                tags: ["health", "mindfulness"],
                reminderTime: "07:00",
            },
            {
                userId: user1!.id,
                name: "Weekly Review",
                description: "Review goals and plan next week",
                frequency: "weekly",
                tags: ["productivity"],
                reminderTime: "18:00",
            },
            {
                userId: user1!.id,
                name: "Drink Water",
                description: "Drink 8 glasses of water",
                frequency: "daily",
                tags: ["health"],
            },
            {
                userId: user1!.id,
                name: "Code Practice",
                description: "Solve one LeetCode problem",
                frequency: "daily",
                tags: ["learning", "productivity"],
                reminderTime: "20:00",
            },
            {
                userId: user1!.id,
                name: "Sleep by 11pm",
                description: "No screens after 10:30pm",
                frequency: "daily",
                tags: ["health"],
                reminderTime: "22:30",
            },
            {
                userId: user1!.id,
                name: "Morning Stretch",
                description: "15 minutes stretching routine",
                frequency: "daily",
                tags: ["fitness", "health"],
                reminderTime: "06:00",
            },
        ])
        .returning({ id: habits.id, name: habits.name });

    console.log("Habits created for user1");

    // user2 habits
    const [journal, workout, vitamins, piano, noSugar] = await db
        .insert(habits)
        .values([
            {
                userId: user2!.id,
                name: "Journaling",
                description: "Write daily journal",
                frequency: "daily",
                tags: ["mindfulness"],
                reminderTime: "22:00",
            },
            {
                userId: user2!.id,
                name: "Workout",
                description: "Gym 3 times a week",
                frequency: "weekly",
                tags: ["fitness"],
                reminderTime: "17:00",
            },
            {
                userId: user2!.id,
                name: "Take Vitamins",
                description: "Daily vitamins after breakfast",
                frequency: "daily",
                tags: ["health"],
                reminderTime: "09:00",
            },
            {
                userId: user2!.id,
                name: "Piano Practice",
                description: "Practice piano for 20 minutes",
                frequency: "daily",
                tags: ["learning", "music"],
                reminderTime: "19:00",
            },
            {
                userId: user2!.id,
                name: "No Sugar",
                description: "Avoid added sugar",
                frequency: "daily",
                tags: ["health", "diet"],
            },
        ])
        .returning({ id: habits.id, name: habits.name });

    console.log("Habits created for user2");

    // user3 habits
    await db.insert(habits).values([
        {
            userId: user3!.id,
            name: "Cold Shower",
            description: "2 minute cold shower every morning",
            frequency: "daily",
            tags: ["health", "fitness"],
            reminderTime: "07:00",
        },
        {
            userId: user3!.id,
            name: "Gratitude Journal",
            description: "Write 3 things you are grateful for",
            frequency: "daily",
            tags: ["mindfulness"],
            reminderTime: "08:00",
        },
        {
            userId: user3!.id,
            name: "Weekly Meal Prep",
            description: "Prep meals for the week",
            frequency: "weekly",
            tags: ["health", "diet"],
            reminderTime: "11:00",
        },
    ]);

    console.log("Habits created for user3");

    // tracking logs - 30 days for user1
    const today = new Date();
    const logs = [];

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = toDateOnly(date);

        // run - perfect streak all 30 days
        logs.push({ habitId: run!.id, userId: user1!.id, date: dateStr, note: `Ran 5km - day ${i + 1}` });

        // read - every other day (15 day streak broken)
        if (i % 2 === 0) {
            logs.push({ habitId: read!.id, userId: user1!.id, date: dateStr });
        }

        // meditate - last 10 days only
        if (i < 10) {
            logs.push({ habitId: meditate!.id, userId: user1!.id, date: dateStr });
        }

        // water - missed every 5th day
        if (i % 5 !== 0) {
            logs.push({ habitId: water!.id, userId: user1!.id, date: dateStr });
        }

        // code - last 7 days only
        if (i < 7) {
            logs.push({ habitId: code!.id, userId: user1!.id, date: dateStr, note: "Solved a medium problem" });
        }

        // sleep - random misses
        if (i % 4 !== 0) {
            logs.push({ habitId: sleep!.id, userId: user1!.id, date: dateStr });
        }

        // stretch - last 5 days
        if (i < 5) {
            logs.push({ habitId: stretch!.id, userId: user1!.id, date: dateStr });
        }
    }

    // tracking logs - 14 days for user2
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = toDateOnly(date);

        // journal - every day
        logs.push({ habitId: journal!.id, userId: user2!.id, date: dateStr });

        // vitamins - missed last 3 days
        if (i > 2) {
            logs.push({ habitId: vitamins!.id, userId: user2!.id, date: dateStr });
        }

        // piano - every 3 days
        if (i % 3 === 0) {
            logs.push({ habitId: piano!.id, userId: user2!.id, date: dateStr, note: "Practiced scales" });
        }

        // no sugar - first 7 days only
        if (i < 7) {
            logs.push({ habitId: noSugar!.id, userId: user2!.id, date: dateStr });
        }
    }

    await db.insert(trackingLogs).values(logs);

    console.log("Tracking logs created");
    console.log("Seeding complete!");
    console.log("\nTest credentials:");
    console.log("  john@example.com / password123");
    console.log("  jane@example.com / password123");
    console.log("  alex@example.com / password123");

    process.exit(0);
};

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});