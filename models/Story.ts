import { Schema, model, models, Types } from "mongoose";

const TimelineSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  imageUrl: { type: String },
  category: { type: String, default: "general" }
});

const StorySchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    data: {
      personalInformation: {
        fullName: String,
        dob: String,
        birthplace: String,
        background: String
      },
      childhoodMemories: String,
      educationJourney: String,
      careerAchievements: String,
      familyRelationships: String,
      lifeChallengesLessons: String,
      dreamsBeliefsFutureGoals: String
    },
    timeline: { type: [TimelineSchema], default: [] },
    generatedDrafts: [
      {
        style: { type: String, enum: ["emotional", "professional", "simple", "poetic"] },
        content: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    selectedDraft: { type: String },
    title: { type: String, default: "My Autobiography" },
    coverImage: { type: String },
    fontFamily: { type: String, default: "inter" },
    favoriteQuotes: { type: [String], default: [] },
    sharedSlug: { type: String, unique: true, sparse: true }
  },
  { timestamps: true }
);

const Story = models.Story || model("Story", StorySchema);

export default Story;
