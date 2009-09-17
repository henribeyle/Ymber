class TagsController < ApplicationController
  def create
    @tag = Tag.new(params[:tag])

    if @tag.save then
      render :json => @tag
    else
      render :json => { :status => 'error', :error => @tag.errors.full_messages[0] }
    end
  end

  def update
    begin
      @tag = Tag.find(params[:id])
      if !@tag.update_attributes!(params[:tag])
        render :json => { :status => 'error', :error => 'could not update tag' }
        return
      end
    rescue Exception => e
      render :json => { :status => 'error', :error => e.to_s }
      return
    end
    render :json => @tag
  end

  def destroy
    begin
      @tag = Tag.find(params[:id])
      @tag.destroy
    rescue Exception => e
      render :json => { :status => 'error', :error => e.to_s }
      return
    end

    render :json => { :status => 'ok' }
  end

  def editor
    value=params[:value]
    @tags=Tag.find(:all)
    if(value) then
      tag = Tag.find_by_value(value)
      if !tag
        redirect_to('/') 
        return
      end
      @tagname=tag.value
      @items=tag.items
    else
      @tagname='(none)'
      @items=Item.find_by_sql "SELECT * from items " +
        "where items.id NOT IN " +
        "(SELECT item_id from items_tags)"
    end
  end
end
