namespace :elevenlabs do
  desc "Create ElevenLabs agents for all personas that don't have them"
  task create_missing_agents: :environment do
    puts "🎭 Checking for personas without ElevenLabs agents..."
    
    personas_without_agents = Persona.where(elevenlabs_agent_id: nil)
    
    if personas_without_agents.empty?
      puts "✅ All personas already have ElevenLabs agents!"
      next
    end
    
    puts "📝 Found #{personas_without_agents.count} personas without agents:"
    personas_without_agents.each do |persona|
      puts "  - #{persona.name} (ID: #{persona.id})"
    end
    
    print "\n🚀 Create agents for these personas? (y/N): "
    response = STDIN.gets.chomp.downcase
    
    unless ['y', 'yes'].include?(response)
      puts "❌ Aborted."
      next
    end
    
    created_count = 0
    failed_count = 0
    
    personas_without_agents.find_each do |persona|
      print "Creating agent for #{persona.name}... "
      
      begin
        persona.create_elevenlabs_agent!
        puts "✅ Created (Agent ID: #{persona.elevenlabs_agent_id})"
        created_count += 1
      rescue StandardError => e
        puts "❌ Failed: #{e.message}"
        failed_count += 1
      end
      
      # Small delay to avoid rate limiting
      sleep(0.5)
    end
    
    puts "\n📊 Summary:"
    puts "  ✅ Successfully created: #{created_count}"
    puts "  ❌ Failed: #{failed_count}"
    puts "  📈 Total personas with agents: #{Persona.where.not(elevenlabs_agent_id: nil).count}"
  end
  
  
  desc "List all personas and their ElevenLabs agent status"
  task list_agent_status: :environment do
    puts "🎭 ElevenLabs Agent Status Report\n"
    puts "=" * 60
    
    Persona.all.order(:name).each do |persona|
      status = persona.has_elevenlabs_agent? ? "✅ HAS AGENT" : "❌ NO AGENT"
      agent_info = persona.has_elevenlabs_agent? ? " (#{persona.elevenlabs_agent_id})" : ""
      created_info = persona.agent_created_at ? " created #{persona.agent_created_at.strftime('%Y-%m-%d')}" : ""
      
      puts "#{status.ljust(15)} #{persona.name}#{agent_info}#{created_info}"
    end
    
    puts "\n📊 Summary:"
    puts "  ✅ With agents: #{Persona.where.not(elevenlabs_agent_id: nil).count}"
    puts "  ❌ Without agents: #{Persona.where(elevenlabs_agent_id: nil).count}"
    puts "  📈 Total personas: #{Persona.count}"
  end
  
  desc "Recreate agent for a specific persona (force)"
  task :recreate_agent, [:persona_id] => :environment do |t, args|
    persona_id = args[:persona_id]
    
    unless persona_id
      puts "❌ Error: Please provide a persona ID"
      puts "Usage: rails elevenlabs:recreate_agent[123]"
      next
    end
    
    persona = Persona.find_by(id: persona_id)
    unless persona
      puts "❌ Error: Persona with ID #{persona_id} not found"
      next
    end
    
    puts "🎭 Recreating ElevenLabs agent for: #{persona.name}"
    
    if persona.has_elevenlabs_agent?
      puts "⚠️  Warning: This persona already has an agent (#{persona.elevenlabs_agent_id})"
      print "Continue and recreate? (y/N): "
      response = STDIN.gets.chomp.downcase
      
      unless ['y', 'yes'].include?(response)
        puts "❌ Aborted."
        next
      end
      
      # Clear existing agent data
      persona.update!(
        elevenlabs_agent_id: nil,
        voice_id: nil,
        conversation_prompt: nil,
        voice_settings: nil,
        agent_created_at: nil
      )
    end
    
    begin
      persona.create_elevenlabs_agent!
      puts "✅ Successfully created new agent for #{persona.name}"
      puts "   Agent ID: #{persona.elevenlabs_agent_id}"
      puts "   Voice ID: #{persona.voice_id}"
    rescue StandardError => e
      puts "❌ Failed to create agent: #{e.message}"
    end
  end
  
  desc "Test ElevenLabs API connection"
  task test_connection: :environment do
    puts "🔌 Testing ElevenLabs API connection..."
    
    begin
      service = ElevenLabsAgentService.new
      
      # Test with a simple API call (get voices)
      response = HTTParty.get(
        'https://api.elevenlabs.io/v1/voices',
        headers: { 'xi-api-key' => Rails.application.credentials.elevenlabs_api_key || ENV['ELEVENLABS_API_KEY'] }
      )
      
      if response.success?
        voices_count = response.parsed_response['voices']&.count || 0
        puts "✅ Connection successful!"
        puts "   Available voices: #{voices_count}"
      else
        puts "❌ API request failed: #{response.code} - #{response.message}"
      end
      
    rescue StandardError => e
      puts "❌ Connection failed: #{e.message}"
    end
  end
end