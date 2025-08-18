---
allowed-tools: Read, Edit, MultiEdit, Write
argument-hint: [feedback about conversational tone]
description: Review and improve land persona prompts for more natural conversation
model: claude-opus-4-1-20250805
---

## Current Prompt Templates

### Base Persona Prompt
!`cat /Users/miguele/Code/ranger/acquisition-arena/config/initializers/prompts/land_persona.rb`

### Parcel Details Sub-Prompt
!`cat /Users/miguele/Code/ranger/acquisition-arena/config/initializers/prompts/land_parcel_sub_details.rb`

### Current Agent Service Implementation
!`head -220 /Users/miguele/Code/ranger/acquisition-arena/app/services/eleven_labs_agent_service.rb | tail -45`

## Your Task

You've been given feedback about improving the conversational tone of the land persona AI agents. The feedback is:
**$ARGUMENTS**

Please analyze and improve the prompts with these requirements:

### 1. Primary Improvement Focus
- Address the specific feedback provided
- Make the persona sound more natural and conversational
- Reduce any robotic or scripted patterns
- Enhance emotional authenticity based on persona characteristics

### 2. Regression Prevention Analysis
You MUST review the entire prompt system to prevent regressions:

#### Character Consistency Checks:
- Ensure personality traits remain properly expressed
- Maintain the balance between all characteristic scores (0-1 scale)
- Preserve the persona's unique voice and background story
- Keep emotional responses aligned with temper_level and emotional_attachment scores

#### Natural Dialogue Flow:
- Check that conversation starters remain natural
- Verify objection patterns match personality (skepticism_level, decision_making_speed)
- Ensure responses vary based on chattiness_level
- Maintain realistic speech patterns for the character

#### Property Integration:
- Confirm property details are woven naturally into conversation
- Preserve the ability to reference specific parcel features
- Keep knowledge_level affecting how technical the seller gets
- Maintain urgency and price_flexibility in negotiation context

#### Technical Requirements:
- Keep all variable placeholders intact ({persona_name}, {characteristics}, etc.)
- Preserve the modular structure for dynamic variable injection
- Maintain compatibility with ElevenLabs conversation API
- Ensure first_message remains appropriate

### 3. Implementation Steps

1. Analyze the current prompts for the specific issue mentioned in feedback
2. Identify patterns that make the conversation feel unnatural
3. Propose specific improvements while checking each against regression risks
4. Update the prompt templates in the appropriate files
5. Verify all interconnected components still work together

### 4. Output Requirements

After making improvements, provide:

1. **Summary of Changes**: Bullet points of specific improvements made
2. **Regression Check Results**: List any potential risks and how they were mitigated
3. **Example Comparison**: Show a before/after example of how the persona would respond
4. **Technical Validation**: Confirm all placeholders and structure remain intact
5. **Detailed Explanation**: Thorough reasoning for why these changes improve naturalness without causing regressions

### Important Notes:
- The prompts use Ruby heredoc syntax (<<~PROMPT)
- Variable interpolation happens at runtime with .gsub() calls
- ElevenLabs expects specific prompt structure for conversation agents
- Changes should work across ALL personas, not just specific ones
- Consider how different characteristic combinations will sound with your changes

Begin by carefully analyzing the current prompts and the feedback, then propose and implement improvements that make the conversations feel genuinely human while maintaining all system functionality.