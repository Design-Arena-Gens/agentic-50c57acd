"use client";

import { useMemo, useState } from "react";

export interface PersonalInformation {
  fullName?: string;
  dob?: string;
  birthplace?: string;
  background?: string;
}

export interface StoryFormData {
  personalInformation?: PersonalInformation;
  childhoodMemories?: string;
  educationJourney?: string;
  careerAchievements?: string;
  familyRelationships?: string;
  lifeChallengesLessons?: string;
  dreamsBeliefsFutureGoals?: string;
}

const sections = [
  {
    key: "personalInformation",
    title: "Personal Information",
    description: "Introduce yourself with the basics that define your origin story."
  },
  {
    key: "childhoodMemories",
    title: "Childhood Memories",
    description: "Capture early experiences, family traditions, and formative moments."
  },
  {
    key: "educationJourney",
    title: "Education Journey",
    description: "Outline schools, mentors, and lessons learned along the way."
  },
  {
    key: "careerAchievements",
    title: "Career & Achievements",
    description: "Highlight milestones, projects, and proud accomplishments."
  },
  {
    key: "familyRelationships",
    title: "Family & Relationships",
    description: "Describe the people who shaped your world and shared your path."
  },
  {
    key: "lifeChallengesLessons",
    title: "Life Challenges & Lessons",
    description: "Reflect on obstacles, resilience, and wisdom gained."
  },
  {
    key: "dreamsBeliefsFutureGoals",
    title: "Dreams, Beliefs & Future Goals",
    description: "Share your guiding values, aspirations, and vision ahead."
  }
] as const;

interface StoryFormProps {
  data: StoryFormData;
  onChange: (data: StoryFormData) => void;
  onSave: (data: StoryFormData) => void;
}

export default function StoryForm({ data, onChange, onSave }: StoryFormProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeSection = sections[activeIndex];

  const progress = useMemo(() => Math.round(((activeIndex + 1) / sections.length) * 100), [
    activeIndex
  ]);

  const updateData = (key: keyof StoryFormData, value: any) => {
    const next: StoryFormData = {
      personalInformation: {
        fullName: data.personalInformation?.fullName ?? "",
        dob: data.personalInformation?.dob ?? "",
        birthplace: data.personalInformation?.birthplace ?? "",
        background: data.personalInformation?.background ?? ""
      },
      ...data
    };
    next[key] = value;
    onChange(next);
  };

  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>{activeSection.title}</h2>
          <p style={{ marginTop: "8px", opacity: 0.7 }}>{activeSection.description}</p>
        </div>
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "999px",
            background: "rgba(56,189,248,0.15)",
            color: "#38bdf8",
            fontSize: "0.85rem",
            fontWeight: 600
          }}
        >
          {progress}% complete
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "8px",
          marginTop: "16px",
          marginBottom: "24px"
        }}
      >
        {sections.map((section, idx) => (
          <button
            key={section.key}
            className="btn btn-secondary"
            style={{
              padding: "8px 12px",
              fontSize: "0.85rem",
              opacity: activeIndex === idx ? 1 : 0.65,
              border:
                activeIndex === idx ? "1px solid rgba(56, 189, 248, 0.9)" : "1px solid transparent"
            }}
            onClick={() => setActiveIndex(idx)}
            type="button"
          >
            {idx + 1}. {section.title}
          </button>
        ))}
      </div>

      {activeSection.key === "personalInformation" ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div>
            <label>Full Name</label>
            <input
              className="input"
              type="text"
              value={data.personalInformation?.fullName ?? ""}
              onChange={(e) =>
                updateData("personalInformation", {
                  ...data.personalInformation,
                  fullName: e.target.value
                })
              }
            />
          </div>
          <div>
            <label>Date of Birth</label>
            <input
              className="input"
              type="date"
              value={data.personalInformation?.dob ?? ""}
              onChange={(e) =>
                updateData("personalInformation", {
                  ...data.personalInformation,
                  dob: e.target.value
                })
              }
            />
          </div>
          <div>
            <label>Birthplace</label>
            <input
              className="input"
              type="text"
              value={data.personalInformation?.birthplace ?? ""}
              onChange={(e) =>
                updateData("personalInformation", {
                  ...data.personalInformation,
                  birthplace: e.target.value
                })
              }
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label>Background</label>
            <textarea
              className="input"
              style={{ minHeight: "120px" }}
              value={data.personalInformation?.background ?? ""}
              onChange={(e) =>
                updateData("personalInformation", {
                  ...data.personalInformation,
                  background: e.target.value
                })
              }
            />
          </div>
        </div>
      ) : (
        <div>
          <textarea
            className="input"
            style={{ minHeight: "260px" }}
            value={(data as any)[activeSection.key] ?? ""}
            onChange={(e) => updateData(activeSection.key, e.target.value)}
            placeholder="Write freely, reflect deeply, and capture as many details as you can remember..."
          />
          <p style={{ marginTop: "12px", opacity: 0.6 }}>
            Tip: Think about sensory details, emotions, people involved, and how this shaped you.
          </p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
        <button
          className="btn btn-secondary"
          onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
          type="button"
          disabled={activeIndex === 0}
        >
          Previous
        </button>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-secondary" type="button" onClick={() => onSave(data)}>
            Save Section
          </button>
          <button
            className="btn"
            onClick={() => {
              if (activeIndex < sections.length - 1) {
                setActiveIndex((index) => Math.min(sections.length - 1, index + 1));
              } else {
                onSave(data);
              }
            }}
            type="button"
          >
            {activeIndex === sections.length - 1 ? "Finish & Save" : "Next"}
          </button>
        </div>
      </div>
    </section>
  );
}
