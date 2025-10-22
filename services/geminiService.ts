import { GoogleGenAI, Type } from "@google/genai";
import type { Team, Hackathon, TeamAnalysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this prototype, we'll log an error.
  console.warn("API_KEY is not set. AI analysis will be mocked.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        score: {
            type: Type.NUMBER,
            description: 'A score from 0 to 100 representing how well the team\'s skills match the hackathon\'s requirements.'
        },
        summary: {
            type: Type.STRING,
            description: 'A brief, one-sentence summary of the team\'s strengths and weaknesses for this specific hackathon.'
        },
        missingSkills: {
            type: Type.ARRAY,
            description: 'A list of critical skills required by the hackathon that the team is missing.',
            items: { type: Type.STRING }
        },
        suggestions: {
            type: Type.STRING,
            description: 'Actionable suggestions for team improvement, like "Consider finding a member with UI/UX experience to handle the front-end design."'
        }
    },
    required: ['score', 'summary', 'missingSkills', 'suggestions']
};

export const analyzeTeamBalance = async (
  team: Team,
  hackathon: Hackathon
): Promise<TeamAnalysis> => {
  try {
    if (!API_KEY) {
      // Simulate a successful response if no API key is present for local testing
      console.warn("API_KEY not found. Returning mock AI analysis.");
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      const currentSkills = team.members.flatMap(m => m.skills);
      const missing = hackathon.requiredSkills.filter(s => !currentSkills.includes(s));
      return {
        score: 100 - (missing.length * 20),
        summary: "Strong backend and AI skills, but lacks a dedicated front-end designer.",
        missingSkills: missing.length > 0 ? missing : ["UI/UX Design"],
        suggestions: "Recruit a team member with strong UI/UX and design skills to create a polished user interface. Familiarity with Firebase would also be beneficial for rapid prototyping."
      };
    }

    const teamSkills = Array.from(new Set(team.members.flatMap(member => member.skills))).join(', ');
    const requiredSkills = hackathon.requiredSkills.join(', ');

    const prompt = `
      Analyze the balance of a hackathon team based on the hackathon's requirements.

      Hackathon Details:
      - Title: "${hackathon.title}"
      - Theme: "${hackathon.theme}"
      - Required Skills: ${requiredSkills}

      Team Details:
      - Team Name: "${team.name}"
      - Team Members: ${team.members.map(m => m.name).join(', ')}
      - Combined Team Skills: ${teamSkills}

      Your task is to provide a detailed analysis and return it in JSON format:
      1. Calculate a "score" from 0 to 100. A high score means the team is well-balanced and meets the skill requirements. A low score indicates significant skill gaps.
      2. Write a concise one-sentence "summary" of the team's balance.
      3. List the most critical "missingSkills" from the hackathon requirements. If there are none, return an empty array.
      4. Provide a concrete, actionable "suggestions" on how to improve the team, such as the type of member they should recruit.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.5,
        },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (parsedResponse.score === undefined || !parsedResponse.summary || !parsedResponse.missingSkills || !parsedResponse.suggestions) {
        throw new Error("Invalid AI response structure.");
    }
    
    return parsedResponse as TeamAnalysis;

  } catch (error) {
    console.error("Error analyzing team balance:", error);
    throw new Error("Failed to get AI analysis. Please check your API key and the console for details.");
  }
};