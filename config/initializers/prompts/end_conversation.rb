# ElevenLabs end conversation system tool configuration
module Prompts
  # End call system tool configuration for ElevenLabs agents
  END_CALL_TOOL = {
    type: "system",
    name: "end_call",
    description: <<~DESCRIPTION.strip
      End the call when any of these conditions are met:
      
      1) The buyer and seller reach a deal or agreement on price/terms
      2) The seller firmly declines to sell after multiple attempts
      3) The conversation has gone in circles for too long without progress
      4) Either party explicitly says goodbye or wants to end the call
      5) The training objective has been completed (e.g., practicing objection handling, negotiation tactics, or closing techniques)
      
      Use natural conversation endings like "Alright, bye" or "Talk to you later" before ending the call.
    DESCRIPTION
  }
end