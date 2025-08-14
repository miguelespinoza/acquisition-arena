# NOTE: only doing this in development as some production environments (Heroku)
# NOTE: are sensitive to local FS writes, and besides -- it's just not proper
# NOTE: to have a dev-mode tool do its thing in production.
if Rails.env.development?
  require 'annotaterb'
  
  # Configure annotaterb to run after db:migrate
  Rake::Task['db:migrate'].enhance do
    system('bundle exec annotaterb models') if Rails.env.development?
  end
  
  Rake::Task['db:rollback'].enhance do
    system('bundle exec annotaterb models') if Rails.env.development?
  end
end