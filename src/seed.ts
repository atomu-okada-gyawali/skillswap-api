import mongoose from "mongoose";
import { MONGODB_URI } from "./config";
import { UserModel } from "./models/user.model";
import { TagModel } from "./models/tag.model";
import { PostModel } from "./models/post.model";
import { ProposalModel } from "./models/proposal.model";
import { ScheduleModel } from "./models/schedule.model";
import { ChatModel } from "./models/chat.model";
import { MessageModel } from "./models/message.model";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await UserModel.deleteMany({});
    await TagModel.deleteMany({});
    await PostModel.deleteMany({});
    await ProposalModel.deleteMany({});
    await ScheduleModel.deleteMany({});
    await ChatModel.deleteMany({});
    await MessageModel.deleteMany({});
    console.log("Cleared existing data");

    const hashedPassword = await bcrypt.hash("password123", 10);

    const admin = await UserModel.create({
      email: "test1@email.com",
      password: hashedPassword,
      username: "test1",
      fullName: "Admin admin",
      role: "admin",
    });

    const user1 = await UserModel.create({
      email: "john@example.com",
      password: hashedPassword,
      username: "johndoe",
      fullName: "John Doe",
      role: "user",
    });

    const user2 = await UserModel.create({
      email: "jane@example.com",
      password: hashedPassword,
      username: "janedoe",
      fullName: "Jane Smith",
      role: "user",
    });

    const user3 = await UserModel.create({
      email: "mike@example.com",
      password: hashedPassword,
      username: "mikebrown",
      fullName: "Mike Brown",
      role: "user",
    });

    console.log("Created users");

    const tag1 = await TagModel.create({ name: "JavaScript", tagImage: "https://example.com/js.png" });
    const tag2 = await TagModel.create({ name: "Python", tagImage: "https://example.com/python.png" });
    const tag3 = await TagModel.create({ name: "React", tagImage: "https://example.com/react.png" });
    const tag4 = await TagModel.create({ name: "Node.js", tagImage: "https://example.com/node.png" });
    const tag5 = await TagModel.create({ name: "UI/UX Design", tagImage: "https://example.com/design.png" });
    const tag6 = await TagModel.create({ name: "Graphic Design", tagImage: "https://example.com/graphic.png" });
    const tag7 = await TagModel.create({ name: "Data Science", tagImage: "https://example.com/data.png" });
    const tag8 = await TagModel.create({ name: "Machine Learning", tagImage: "https://example.com/ml.png" });

    console.log("Created tags");

    const post1 = await PostModel.create({
      userId: user1._id,
      title: "Learn JavaScript from scratch",
      description: "I want to learn JavaScript programming. Looking for someone who can teach me basics to advanced concepts.",
      postPhoto: "https://example.com/js-post.jpg",
      tag: tag1._id,
      requirements: ["Patience", "Good communication"],
      locationType: "remote",
      availability: "weekends",
      duration: "3 months",
    } as any);

    const post2 = await PostModel.create({
      userId: user2._id,
      title: "Teach Python & Machine Learning",
      description: "Experienced Python developer offering to teach Machine Learning concepts and Data Science.",
      postPhoto: "https://example.com/python-post.jpg",
      tag: tag2._id,
      requirements: ["Basic programming knowledge"],
      locationType: "hybrid",
      availability: "part-time",
      duration: "2 months",
    } as any);

    const post3 = await PostModel.create({
      userId: user3._id,
      title: "React Development mentorship",
      description: "Senior React developer offering mentorship for frontend development. Will cover hooks, state management, and best practices.",
      postPhoto: "https://example.com/react-post.jpg",
      tag: tag3._id,
      requirements: ["HTML/CSS basics", "JavaScript knowledge"],
      locationType: "remote",
      availability: "full-time",
      duration: "1 month",
    } as any);

    const post4 = await PostModel.create({
      userId: user1._id,
      title: "UI/UX Design Skills Exchange",
      description: "Product designer offering to teach UI/UX design in exchange for Python programming lessons.",
      postPhoto: "https://example.com/uiux-post.jpg",
      tag: tag5._id,
      requirements: ["Figma basics", "Design eye"],
      locationType: "remote",
      availability: "flexible",
      duration: "2 months",
    } as any);

    const post5 = await PostModel.create({
      userId: user2._id,
      title: "Graphic Design for Developers",
      description: "Graphic designer looking to learn Node.js for backend development. Can teach logo design, branding, and visual identity.",
      postPhoto: "https://example.com/graphic-post.jpg",
      tag: tag6._id,
      requirements: ["Creativity", "Basic computer skills"],
      locationType: "on-site",
      availability: "weekends",
      duration: "3 months",
    } as any);

    console.log("Created posts");

    const posts = await PostModel.find().limit(5).lean();
    const post1Id = posts[0]._id;
    const post2Id = posts[1]._id;

    const proposal1 = await ProposalModel.create({
      senderId: user2._id.toString(),
      receiverId: user1._id.toString(),
      postId: post1Id.toString(),
      offeredSkill: "Python",
      message: "I can teach you Python while you help me understand JavaScript basics. Let's learn together!",
      status: "pending",
    });

    const proposal2 = await ProposalModel.create({
      senderId: user1._id.toString(),
      receiverId: user2._id.toString(),
      postId: post2Id.toString(),
      offeredSkill: "JavaScript",
      message: "I'd love to learn Machine Learning from you. I can teach you JavaScript in return.",
      status: "accepted",
    });

    const proposal3 = await ProposalModel.create({
      senderId: user3._id.toString(),
      receiverId: user1._id.toString(),
      postId: post1Id.toString(),
      offeredSkill: "React",
      message: "I can teach you React and JavaScript best practices. Looking forward to collaborating!",
      status: "pending",
    });

    console.log("Created proposals");

    const proposals = await ProposalModel.find().limit(3).lean();
    const proposal1Db = proposals[0];
    const proposal2Db = proposals[1];

    const schedule1 = await ScheduleModel.create({
      proposalId: proposal2Db._id.toString(),
      proposedDate: new Date("2026-03-10"),
      proposedTime: "10:00 AM",
      durationMinutes: 60,
      accepted: true,
    });

    const schedule2 = await ScheduleModel.create({
      proposalId: proposal1Db._id.toString(),
      proposedDate: new Date("2026-03-15"),
      proposedTime: "2:00 PM",
      durationMinutes: 90,
      accepted: false,
    });

    console.log("Created schedules");

    await ChatModel.create([
      { proposalId: proposal2Db._id },
      { proposalId: proposal1Db._id },
    ]);

    const chats = await ChatModel.find().lean();

    console.log("Created chats");

    await MessageModel.create([
      {
        chatId: chats[0]._id,
        senderId: user2._id,
        content: "Hi! Excited to start learning Python with you!",
      },
      {
        chatId: chats[0]._id,
        senderId: user1._id,
        content: "Great! Let's begin with Python basics. How familiar are you with programming?",
      },
      {
        chatId: chats[0]._id,
        senderId: user2._id,
        content: "I know the basics. Looking forward to the Machine Learning part!",
      },
      {
        chatId: chats[1]._id,
        senderId: user2._id,
        content: "Hello! I saw your JavaScript learning post. Would love to help!",
      },
    ]);

    console.log("Created messages");

    console.log("\n=== Seed Complete ===");
    console.log(`Users: ${4} (1 admin + 3 users)`);
    console.log(`Tags: 8`);
    console.log(`Posts: 5`);
    console.log(`Proposals: 3`);
    console.log(`Schedules: 2`);
    console.log(`Chats: 2`);
    console.log(`Messages: 4`);

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
