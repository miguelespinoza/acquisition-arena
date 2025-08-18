# ElevenLabs prompt template for land parcel details
module Prompts
  # Sub-prompt template for land parcel details
  LAND_PARCEL_SUB_DETAILS = <<~PROMPT
    Location: {city}, {state}
    Parcel Number: {parcel_number}
    
    PROPERTY FEATURES:
    {property_features_list}
  PROMPT
end