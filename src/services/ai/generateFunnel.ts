import OpenAI from 'openai';
import type { CampaignFunnel } from './types';
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function generateFunnel(goal: string): Promise<CampaignFunnel> {
  const prompt = `
You are a project manager for a leading call center company. The client gave the following goal and now you need to design a funnel for the dashbaord that show relevent steps that lead up to a final desired outcome.

${goal}

Here's some examples:

Inbound Calls (IVR Replacement, Customer Support)
[
  "Calls Received",
  "Handled by Agent",
  "Issue Understood",
  "Issue Resolved",
  "Issue Closed"
]

Outbound Calls (Admissions Support, Payment Collections)
[
  "Not Contacted",
  "Contacted",
  "Interest Confirmed",
  "Action Initiated",
  "Payment or Action Completed"
]

Inbound Calls (Customer Feedback Collection)
[
  "Calls Received",
  "Survey Invited",
  "Survey Initiated",
  "Survey Completed",
  "Feedback Recorded and Analyzed",
  "Action Taken on Feedback"
]

Outbound Calls (Debt Recovery)
[
  "Not Contacted",
  "Contacted",
  "Commitment to Repay",
  "Partial Payment Received",
  "Full Debt Recovered"
]

Outbound Calls (Appointment Scheduling)
[
  "Not Contacted",
  "Contacted",
  "Appointment Offered",
  "Appointment Scheduled",
  "Appointment Attended and Completed"
]

Inbound Calls (Tech Support)
[
  "Calls Received",
  "Issue Understood",
  "Troubleshooting Started",
  "Issue Resolved",
  "Support Satisfaction Achieved"
]
`;

  const FunnelSchema = z.object({
   funnel_stages: z.array(z.string())
  }).required();

  const completion = await openai.beta.chat.completions.parse({
  model: "gpt-4o",
  messages: [
    { role: "system", content: prompt },
  ],
  response_format: zodResponseFormat(FunnelSchema, "event"),
});

  const response = completion.choices[0].message.content;
  if (!response) throw new Error('Failed to generate scripts');

  // Validate the response with Zod
  const parsedResponse = FunnelSchema.parse(JSON.parse(response));
  return parsedResponse;
}