import OpenAI from 'openai';
import type { CampaignScripts } from './types';
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function generateScripts(goal: string): Promise<CampaignScripts> {
  const prompt = `
You are a project manager for a leading call center company. The client gave the following goal and now you need to design a scripts that include "outbound", "inbound", and "voicemail" arrays of conversation steps.


${goal}

Here's some examples:

Customer Retention and Upselling
{
  "outbound": [
    { "step": "Introduction", "content": "Introduce yourself by name and state the company you represent." },
    { "step": "Verify", "content": "Confirm you are speaking with the correct customer by verifying basic details like their name or account information." },
    { "step": "Purpose", "content": "Explain the purpose of the call, highlighting why you value their business and want to assist further." },
    { "step": "Understand", "content": "Ask open-ended questions to understand their satisfaction with the current product or service." },
    { "step": "Offer", "content": "Present specific value-added services, upgrades, or discounts tailored to their needs and preferences." },
    { "step": "Confirm", "content": "Check their interest in the offer and answer any questions they may have." },
    { "step": "Close", "content": "Finalize the offer or schedule a follow-up if they need more time to decide." }
  ],
  "inbound": [
    { "step": "Greeting", "content": "Welcome the customer warmly and thank them for reaching out." },
    { "step": "Verify", "content": "Confirm their account details to ensure you're speaking with the correct person." },
    { "step": "Listen", "content": "Ask about their experience with your service and listen actively to their concerns or needs." },
    { "step": "Acknowledge", "content": "Acknowledge their feedback and show empathy for any challenges they mention." },
    { "step": "Propose", "content": "Propose solutions to address their concerns or introduce relevant promotions and upgrades." },
    { "step": "Answer", "content": "Clarify any doubts or questions they have regarding the proposed solution or offer." },
    { "step": "Confirm", "content": "Confirm the next steps, such as processing an upgrade, applying a discount, or scheduling a follow-up." }
  ],
  "voicemail": [
    { "step": "Greeting", "content": "State your name, your company, and the purpose of the call." },
    { "step": "Value", "content": "Briefly mention a benefit or promotion that would interest the customer." },
    { "step": "Contact", "content": "Provide your contact information, including a direct callback number." },
    { "step": "Reassure", "content": "Reassure them that their satisfaction is important and invite them to call back for assistance." },
    { "step": "Close", "content": "Thank them for their time and express appreciation for their business." }
  ]
}


Lead Generation and Nurturing
{
  "outbound": [
    { "step": "Introduction", "content": "Introduce yourself by name and state the company you represent briefly." },
    { "step": "Purpose", "content": "Clearly explain the reason for your call and how it aligns with their potential needs." },
    { "step": "Availability", "content": "Politely confirm if they are available to discuss their needs or schedule a convenient time." },
    { "step": "Inquiry", "content": "Ask open-ended questions to gather information about their needs or interests." },
    { "step": "Highlight", "content": "Highlight a specific value, feature, or product that matches their profile or stated needs." },
    { "step": "Interest", "content": "Confirm their interest and address any initial questions or concerns they have." },
    { "step": "Next Steps", "content": "Discuss and agree on the next steps, such as scheduling a detailed follow-up or providing more information." }
  ],
  "inbound": [
    { "step": "Greeting", "content": "Welcome the caller and thank them for reaching out." },
    { "step": "Inquiry", "content": "Ask clarifying questions to understand their needs, interests, or challenges." },
    { "step": "Match", "content": "Identify and propose a product or service that aligns with their requirements." },
    { "step": "Details", "content": "Provide relevant details about the proposed solution, including benefits and features." },
    { "step": "Confirm", "content": "Confirm their understanding and interest in the proposed solution." },
    { "step": "Follow-Up", "content": "Agree on the next steps, such as scheduling a follow-up or sending additional resources." }
  ],
  "voicemail": [
    { "step": "Introduction", "content": "State your name, company, and the purpose of the call." },
    { "step": "Purpose", "content": "Briefly mention the valuable offer, product, or opportunity relevant to them." },
    { "step": "Benefit", "content": "Highlight how the offer or product could address their needs or add value." },
    { "step": "Callback", "content": "Leave a callback number and suggest a convenient time to reach you." },
    { "step": "Close", "content": "Thank them for their time and express interest in discussing further." }
  ]
}



Appointment Scheduling and Reminders
{
  "outbound": [
    { "step": "Introduction", "content": "Introduce yourself, your company, and the purpose of the call." },
    { "step": "Verify", "content": "Confirm the customer's identity using basic details (e.g., name or account number)." },
    { "step": "Availability", "content": "Ask if the customer is available to discuss scheduling an appointment." },
    { "step": "Options", "content": "Present multiple time slots or dates for them to choose from." },
    { "step": "Schedule", "content": "Confirm and finalize the appointment slot based on their preference." },
    { "step": "Details", "content": "Provide the full details of the appointment, including date, time, location, and any instructions." },
    { "step": "Remind", "content": "Inform them of any reminders they’ll receive, such as texts or emails, before the appointment." }
  ],
  "inbound": [
    { "step": "Greeting", "content": "Welcome the customer and thank them for calling." },
    { "step": "Verify", "content": "Confirm their identity and retrieve their appointment details." },
    { "step": "Request", "content": "Ask if they’d like to schedule, reschedule, or cancel an appointment." },
    { "step": "Options", "content": "Present available time slots if scheduling or rescheduling." },
    { "step": "Confirm", "content": "Finalize the new appointment and confirm all details, including reminders." },
    { "step": "Follow-Up", "content": "Provide instructions on any documents or preparation needed for the appointment." }
  ],
  "voicemail": [
    { "step": "Greeting", "content": "State your name, your company, and the reason for the call." },
    { "step": "Verify", "content": "Mention the customer's name or account details (if applicable) to personalize the message." },
    { "step": "Appointment", "content": "Provide details of the scheduled appointment, including the date, time, and location." },
    { "step": "Reschedule", "content": "Offer them the option to call back to reschedule if the appointment time doesn’t work." },
    { "step": "Callback", "content": "Leave your callback number and encourage them to call back for assistance." },
    { "step": "Thank", "content": "Thank them for their time and confirm your eagerness to assist further." }
  ]
}`;

  const ScriptStep = z.object({
    step: z.string(),
    content: z.string()
  });

  const ScriptFormat = z.object({
    outbound: z.array(ScriptStep),
    inbound: z.array(ScriptStep),
    voicemail: z.array(ScriptStep)
  });

  const completion = await openai.beta.chat.completions.parse({
  model: "gpt-4o",
  messages: [
    { role: "system", content: prompt },
  ],
  response_format: zodResponseFormat(ScriptFormat, "event"),
});

  const response = completion.choices[0].message.content;
  if (!response) throw new Error('Failed to generate scripts');

  // Validate the response with Zod
  const parsedResponse = ScriptFormat.parse(JSON.parse(response));
  return parsedResponse;
}