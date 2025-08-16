# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_08_16_104710) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "parcels", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "parcel_number"
    t.json "property_features"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "city"
    t.string "state"
    t.index ["id"], name: "index_parcels_on_id", unique: true
  end

  create_table "personas", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "avatar_url"
    t.json "characteristics"
    t.integer "characteristics_version"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "elevenlabs_agent_id"
    t.text "conversation_prompt"
    t.json "voice_settings"
    t.datetime "agent_created_at"
    t.string "voice_id"
    t.index ["elevenlabs_agent_id"], name: "index_personas_on_elevenlabs_agent_id", unique: true
    t.index ["id"], name: "index_personas_on_id", unique: true
  end

  create_table "training_sessions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "conversation_transcript"
    t.string "audio_url"
    t.integer "session_duration"
    t.string "elevenlabs_session_token"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.uuid "persona_id", null: false
    t.uuid "parcel_id", null: false
    t.index ["id"], name: "index_training_sessions_on_id", unique: true
    t.index ["parcel_id"], name: "index_training_sessions_on_parcel_id"
    t.index ["persona_id"], name: "index_training_sessions_on_persona_id"
    t.index ["user_id"], name: "index_training_sessions_on_user_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "clerk_user_id"
    t.integer "sessions_remaining"
    t.string "invite_code"
    t.boolean "invite_code_redeemed"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["id"], name: "index_users_on_id", unique: true
  end

  add_foreign_key "training_sessions", "parcels"
  add_foreign_key "training_sessions", "personas"
  add_foreign_key "training_sessions", "users"
end
