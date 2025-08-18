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
            text: "*User:*\n#{user.email}"
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

      if training_session.report_data.present?
        report_summary = extract_report_summary(training_session.report_data)
        if report_summary
          blocks << {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Session Report Summary:*\n#{report_summary}"
            }
          }
        end
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

  def extract_report_summary(report_data)
    return nil unless report_data.is_a?(Hash)
    
    summary_parts = []
    
    if report_data['score']
      summary_parts << "Score: #{report_data['score']}/100"
    end
    
    if report_data['strengths'].present?
      summary_parts << "Strengths: #{report_data['strengths'].first(2).join(', ')}"
    end
    
    if report_data['improvements'].present?
      summary_parts << "Areas to improve: #{report_data['improvements'].first(2).join(', ')}"
    end
    
    summary_parts.join(" | ") if summary_parts.any?
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