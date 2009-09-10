ActionController::Routing::Routes.draw do |map|
  map.resources :items, :only => [:create, :update, :destroy]
  map.connect '/items/:id/tag', :controller => 'items', :action => 'add_tag',
    :conditions => {:method => :put}
  map.connect '/items/:id/tag', :controller => 'items', :action => 'delete_tag',
    :conditions => {:method => :delete }
  map.connect '/items/:id/split', :controller => 'items', :action => 'split', 
    :conditions => {:method => :post}

  map.resources :tags, :only => [:create] 
  map.connect ':value', :controller => 'tags', :action => 'editor'
  map.root :controller => "tags", :action => 'editor'
end
