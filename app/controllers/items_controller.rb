class ItemsController < ApplicationController
protected
  def add_tag_to_item(item,x)
    tag=Tag.find(x)
    tg=item.tags.map {|t| t.value } << tag.value
    if (tg & ['in','next','waiting']).size > 1 then
      raise "Tags in, next, and waiting are mutually exclusively"
    end
    @item.tags << tag
  end

public
  def create
    @item = Item.new(params[:item])

    (params[:tag]||[]).each do |x|
      begin
        add_tag_to_item(@item,x)
      rescue ActiveRecord::RecordNotFound => e
        render :json => { :status => 'error', :error => e.to_s }
        return
      rescue Exception => e
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
        add_tag_to_item(@item,x)
      rescue ActiveRecord::RecordNotFound => e
        render :json => { :status => 'error', :error => e.to_s }
        return
      rescue Exception => e
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
end
