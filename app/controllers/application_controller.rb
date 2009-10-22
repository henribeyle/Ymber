class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time
  #protect_from_forgery # :secret => '831fcb24e5a4541e38353060af951f20'
  @@file=nil
protected
  def config_value(x)
    if @@file == nil
      @@file = YAML::load(File.open(File.join(RAILS_ROOT,'config','config.yml')))
    end
    return @@file[x]
  rescue
    log('caught error loading config.yml')
    nil
  end

  def log(*args)
    RAILS_DEFAULT_LOGGER.error("\n#{args.join("\n")}\n")
  end
end
