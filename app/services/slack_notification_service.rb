require 'net/http'
require 'json'

class SlackNotificationService
  def initialize
    @webhook_url = ENV['SLACK_WEBHOOK_URL']
  end

  def send_feedback(feedback:, user:, training_session: nil)
    return false if @webhook_url.blank?

    message = build_feedback_message(feedback, user, training_session)
    send_to_slack(message)
  rescue StandardError => e
    Rails.logger.error "Failed to send Slack notification: #{e.message}"
    false
  end

  def send_more_sessions_request(user_email:, user:, message:, sessions_completed:)
    return false if @webhook_url.blank?

    slack_message = build_more_sessions_message(user_email, user, message, sessions_completed)
    send_to_slack(slack_message)
  rescue StandardError => e
    Rails.logger.error "Failed to send Slack notification: #{e.message}"
    false
  end

  private

  def build_feedback_message(feedback, user, training_session)
    blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📝 New Feedback Received",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*User:*\n#{user.email_address || 'No email'}"
          },
          {
            type: "mrkdwn",
            text: "*User ID:*\n#{user.clerk_user_id}"
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Feedback:*\n#{feedback}"
        }
      }
    ]

    if training_session
      session_fields = []
      
      session_fields << {
        type: "mrkdwn",
        text: "*Session ID:*\n#{training_session.id}"
      }
      
      session_fields << {
        type: "mrkdwn",
        text: "*Status:*\n#{training_session.status}"
      }
      
      if training_session.persona
        session_fields << {
          type: "mrkdwn",
          text: "*Persona:*\n#{training_session.persona.name}"
        }
      end
      
      if training_session.parcel
        session_fields << {
          type: "mrkdwn",
          text: "*Parcel:*\n#{training_session.parcel.parcel_number}\n#{training_session.parcel.city}, #{training_session.parcel.state}"
        }
      end

      blocks.insert(2, {
        type: "section",
        fields: session_fields
      })

      blocks.insert(2, {
        type: "divider"
      })

      blocks.insert(2, {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "🎯 *Training Session Details*"
        }
      })
    end

    blocks << {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "Submitted at #{Time.current.strftime('%B %d, %Y at %I:%M %p %Z')}"
        }
      ]
    }

    { blocks: blocks }
  end

  def build_more_sessions_message(user_email, user, message, sessions_completed)
    blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🚀 More Sessions Request",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*User Email:*\n#{user_email}"
          },
          {
            type: "mrkdwn",
            text: "*User ID:*\n#{user.clerk_user_id}"
          }
        ]
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Sessions Completed:*\n#{sessions_completed}"
          },
          {
            type: "mrkdwn",
            text: "*Current Sessions Remaining:*\n#{user.sessions_remaining}"
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Message:*\n#{message}"
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Submitted at #{Time.current.strftime('%B %d, %Y at %I:%M %p %Z')}"
          }
        ]
      }
    ]

    { blocks: blocks }
  end

  def send_to_slack(message)
    uri = URI(@webhook_url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    
    request = Net::HTTP::Post.new(uri.path)
    request.content_type = 'application/json'
    request.body = message.to_json
    
    response = http.request(request)
    response.is_a?(Net::HTTPSuccess)
  end
end