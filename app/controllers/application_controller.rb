class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time
  protect_from_forgery # :secret => '831fcb24e5a4541e38353060af951f20'
protected
  def log(*args)
    RAILS_DEFAULT_LOGGER.error("\n#{args.join("\n")}\n")
  end
end
