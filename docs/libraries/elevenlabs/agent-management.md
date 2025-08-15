# ElevenLabs Agent Management

## Overview

This system provides idempotent operations to create and manage ElevenLabs agents for personas. Each persona can have one ElevenLabs agent, and the system ensures agents are only created when needed.

## Database Schema

The following fields were added to the `personas` table:

- `elevenlabs_agent_id` - Unique identifier for the ElevenLabs agent
- `voice_id` - Voice used for this persona
- `conversation_prompt` - Base conversation prompt for the persona
- `voice_settings` - JSON object with voice customization settings
- `agent_created_at` - Timestamp when the agent was created

## Model Methods

### Persona Model Methods

```ruby
# Check if persona has an agent
persona.has_elevenlabs_agent?
# => true/false

# Create agent synchronously (idempotent)
persona.create_elevenlabs_agent!
# => Creates agent immediately, raises error on failure

# Get calculated voice ID for this persona
persona.voice_id
# => "21m00Tcm4TlvDq8ikWAM" (calculated from characteristics)
```

### Scopes

```ruby
# Find personas without agents
Persona.without_agents
# => ActiveRecord::Relation

# Find personas with agents  
Persona.with_agents  
# => ActiveRecord::Relation
```

## Rake Tasks

### Create Missing Agents

```bash
rails elevenlabs:create_missing_agents
```

This task will:
- Check for personas without agents
- Show a list of personas needing agents  
- Prompt for confirmation
- Create agents synchronously with progress feedback
- **Note: This will be slow but reliable**

### List Agent Status

```bash
rails elevenlabs:list_agent_status
```

Shows a report of all personas and their agent status.

### Recreate Specific Agent

```bash
rails elevenlabs:recreate_agent[123]
```

Force recreate an agent for persona ID 123.

### Test API Connection

```bash
rails elevenlabs:test_connection
```

Test the ElevenLabs API connection and credentials.


## Configuration

### Development Environment

Agent creation is disabled by default in development. To enable:

```ruby
# config/environments/development.rb
config.auto_create_elevenlabs_agents = true
```

### Production Environment

Agent creation is enabled by default in production.

### API Key Setup

Set your ElevenLabs API key:

```bash
# Environment variable
export ELEVENLABS_API_KEY="your_api_key_here"

# Or Rails credentials
rails credentials:edit
# Add: elevenlabs_api_key: your_api_key_here
```

## Voice Selection Logic

The system automatically selects voices based on persona characteristics:

- **High temper + chatty** → Assertive voice (Bella)
- **Calm + chatty** → Warm voice (Rachel)  
- **High temper + quiet** → Authoritative voice (Adam)
- **Calm + quiet** → Gentle voice (Domi)
- **Moderate traits** → Balanced voice (Ethan)

## Voice Settings Generation

Voice settings are dynamically generated based on persona characteristics:

```ruby
{
  stability: 0.5 + (temper_level * 0.3),    # Higher temper = less stable
  similarity_boost: 0.7,                    # Fixed
  style: emotional_attachment * 0.5,        # More attachment = more emotional
  use_speaker_boost: true                   # Fixed
}
```

## Error Handling

The system includes comprehensive error handling:

- **API failures** → Logged with detailed error messages
- **Invalid personas** → Validation errors prevent agent creation
- **Missing API keys** → Clear error messages
- **Rate limiting** → Manual delay between requests in rake tasks

## Monitoring

### Logs

Agent creation activities are logged:

```ruby
Rails.logger.info "Creating ElevenLabs agent for persona: #{persona.name}"
Rails.logger.info "Successfully created ElevenLabs agent #{agent_id} for persona #{name}"
Rails.logger.error "Failed to create ElevenLabs agent for persona #{name}: #{error}"
```

## Usage Examples

### Manual Agent Creation

```ruby
# In Rails console
persona = Persona.find(1)

# Check if agent exists
persona.has_elevenlabs_agent?
# => false

# Create agent synchronously (will be slow)
persona.create_elevenlabs_agent!
# => Creates agent and updates persona

persona.elevenlabs_agent_id
# => "J3Pbu5gP6NNKBscdCdwB"
```

### Bulk Agent Creation

```ruby
# Create agents for all personas without them (will be slow!)
Persona.without_agents.each do |persona|
  persona.create_elevenlabs_agent!
  sleep(0.5) # Avoid rate limiting
end

# Or use the rake task (recommended)
system("rails elevenlabs:create_missing_agents")
```

### Integration with Training Sessions

```ruby
# In your training session controller
persona = Persona.find(params[:persona_id])

# Ensure persona has agent before starting session
unless persona.has_elevenlabs_agent?
  # Create synchronously (will cause delay for user)
  persona.create_elevenlabs_agent!
end

# Use the agent ID in ElevenLabs session
agent_id = persona.elevenlabs_agent_id
```

This system provides a robust, idempotent way to manage ElevenLabs agents for all your personas while handling errors gracefully and providing comprehensive monitoring capabilities.