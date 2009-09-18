class ItemsController < ApplicationController
  def create
    @item = Item.new(params[:item])

    (params[:tag]||[]).each do |x|
      begin
        @item.tags << Tag.find(x)
      rescue ActiveRecord::RecordNotFound => e
        render :json => { :status => 'error', :error => e.to_s }
        return
      end
    end

    if @item.save then
      render :json => @item
    else
      render :json => { :status => 'error', :error => @item.errors.full_messages[0] }
    end
  end

  def update
    begin
      @item = Item.find(params[:id])
    rescue ActiveRecord::RecordNotFound => e
      render :json => { :status => 'error', :error => e.to_s }
      return
    end

    if @item.update_attributes(params[:item])
      render :json => @item
    else
      render :json => { :status => 'error', :error => @item.errors.full_messages[0] }
    end
  end

  def destroy
    begin
      @item = Item.find(params[:id])
    rescue ActiveRecord::RecordNotFound => e
      render :json => { :status => 'error', :error => e.to_s }
      return
    end

    @item.destroy
    render :json => { :status => 'ok' }
  end

  def add_tag
    begin
      @item = Item.find(params[:id])
    rescue ActiveRecord::RecordNotFound => e
      render :json => { :status => 'error', :error => e.to_s }
      return
    end

    (params[:tag]||[]).each do |x|
      begin
        @item.tags << Tag.find(x)
      rescue ActiveRecord::RecordNotFound => e
        render :json => { :status => 'error', :error => e.to_s }
        return
      end
    end
    if @item.save then
      render :json => @item
    else
      render :json => { :status => 'error', :error => @item.errors.full_messages[0] }
    end
  end

  def delete_tag
    begin
      @item = Item.find(params[:id])
    rescue ActiveRecord::RecordNotFound => e
      render :json => { :status => 'error', :error => e.to_s }
      return
    end

    (params[:tag]||[]).each do |x|
      begin
        @item.tags.delete(Tag.find(x))
      rescue ActiveRecord::RecordNotFound => e
        render :json => { :status => 'error', :error => e.to_s }
        return
      end
    end
    if @item.save then
      render :json => @item
    else
      render :json => { :status => 'error', :error => @item.errors.full_messages[0] }
    end
  end

  def split
    begin
      @item = Item.find(params[:id])
    rescue ActiveRecord::RecordNotFound => e
      render :json => { :status => 'error', :error => e.to_s }
      return
    end

    items=[]
    (params[:value]||[]).each do |x|
      ei = @item.clone
      ei.value=x
      ei.tags=@item.tags
      if !ei.save then
        render :json => { :status => 'error', :error => ei.errors.full_messages[0] }
        return 
      end
      items << ei 
    end

    @item.destroy
    render :json => items
  end
end
