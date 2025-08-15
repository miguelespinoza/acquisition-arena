# ElevenLabs Prompts System

## Overview

The prompt system uses constants for maintainability and template substitution for dynamic content. Prompts are organized in separate files within `app/constants/prompts/` directory and used by ElevenLabs agent services.

## Prompt Templates

### Base Persona Prompt (`Prompts::Persona::BASE_PROMPT`)

**File**: `app/constants/prompts/persona.rb`

Used when creating ElevenLabs agents for personas. Contains the core personality and behavioral instructions.

**Template variables:**
- `{persona_name}` - The persona's name (e.g., "Sarah Thompson")
- `{persona_description}` - Description from the persona record
- `{personality_traits}` - Generated from characteristics (temper, chattiness, etc.)
- `{motivation_level}` - Selling motivation description
- `{conversation_style}` - Communication style based on skepticism and attachment

**Usage:**
```ruby
# Automatically used when creating agents
persona.create_elevenlabs_agent!

# The service generates the prompt like this:
service = ElevenLabsAgentService.new
prompt = service.generate_base_prompt(persona)
# Uses Prompts::Persona::BASE_PROMPT with substitutions
```

## Services Using Prompts

### ElevenLabsAgentService

Creates the base persona prompt when agents are created:

```ruby
class ElevenLabsAgentService
  def generate_base_prompt(persona)
    # Extract characteristics
    personality_traits = build_personality_description(persona.characteristics)
    motivation_level = determine_motivation_level(persona.characteristics)
    conversation_style = determine_conversation_style(persona.characteristics)
    
    # Apply template substitutions
    Prompts::Persona::BASE_PROMPT
      .gsub('{persona_name}', persona.name)
      .gsub('{persona_description}', persona.description)
      .gsub('{personality_traits}', personality_traits)
      .gsub('{motivation_level}', motivation_level)
      .gsub('{conversation_style}', conversation_style)
      .strip
  end
end
```

## Prompt Flow Example

### Agent Creation
```ruby
persona = Persona.create!(
  name: "Sarah Thompson", 
  description: "Motivated seller",
  characteristics: { temper_level: 0.2, chattiness_level: 0.8, ... }
)

# Creates agent with base prompt
persona.create_elevenlabs_agent!
# Stored in persona.conversation_prompt
```

### Training Session
```ruby
# Use the stored conversation prompt directly
conversation.startSession({
  agentId: persona.elevenlabs_agent_id,
  user_id: user_id
})
```

## Adding New Prompts

### 1. Add to Constants
```ruby
# app/constants/prompts/new_feature.rb
module Prompts
  module NewFeature
    TEMPLATE = <<~PROMPT
      Your prompt content here with {variable_placeholders}.
    PROMPT
  end
end
```

### 2. Create Service Method
```ruby
class YourService
  def generate_prompt(data)
    Prompts::NewFeature::TEMPLATE
      .gsub('{variable_name}', data.value)
      .gsub('{another_variable}', other_value)
      .strip
  end
end
```

### 3. Use in Application
```ruby
# In controller or other service
prompt = YourService.new.generate_prompt(data)
# Use prompt in API calls, overrides, etc.
```

## Benefits of This System

1. **Maintainability** - All prompts in one place, easy to update
2. **Consistency** - Template variables ensure consistent formatting
3. **Testability** - Easy to test prompt generation separately
4. **Flexibility** - Can easily add new variables or modify templates
5. **Version Control** - Changes to prompts are tracked in git
6. **Reusability** - Same templates can be used across different services

## Testing Prompts

```ruby
# In tests
RSpec.describe ElevenLabsAgentService do
  it "generates base prompt with persona details" do
    persona = create(:persona, name: "Sarah", description: "Motivated seller")
    
    service = ElevenLabsAgentService.new
    prompt = service.generate_base_prompt(persona)
    
    expect(prompt).to include("Sarah")
    expect(prompt).to include("Motivated seller")
  end
end
```

This system provides a clean separation between prompt templates and the logic that populates them, making the codebase more maintainable and the prompts easier to iterate on.