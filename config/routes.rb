Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    # User endpoints
    get 'user', to: 'users#profile'
    post 'user/validate_invite', to: 'users#validate_invite'
    
    # Session setup endpoints
    resources :personas, only: [:index]
    resources :parcels, only: [:index]
    
    # Training session endpoints
    resources :training_sessions, only: [:index, :create, :show] do
      member do
        post :complete
        post :start_conversation
      end
    end
    
    # Feedback endpoint
    post 'feedback', to: 'feedback#create'
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
