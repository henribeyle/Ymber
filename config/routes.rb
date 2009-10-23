ActionController::Routing::Routes.draw do |map|
  map.resources :items, :only => [:create, :update, :destroy]
  map.connect '/items/:id/tag', :controller => 'items', :action => 'add_tag',
    :conditions => {:method => :put}
  map.connect '/items/:id/tag', :controller => 'items', :action => 'delete_tag',
    :conditions => {:method => :delete }

  map.resources :tags, :only => [:create, :update, :destroy]
  map.connect '/undo/:value', :controller => 'tags', :action => 'undo'
  map.connect '/redo', :controller => 'tags', :action => 'redo'
  map.connect ':value.js', :controller => 'tags', :action => 'editor_js'
  map.connect ':value', :controller => 'tags', :action => 'editor'
  map.connect '/.js', :controller => "tags", :action => 'editor_js'
  map.root :controller => "tags", :action => 'editor'
end
