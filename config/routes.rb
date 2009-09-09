ActionController::Routing::Routes.draw do |map|
#   map.resources :tags
  map.resources :items, :only => [:create, :update, :destroy]

  map.connect ':value', :controller => 'tags', :action => 'editor'
  map.root :controller => "tags", :action => 'editor'
end
