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
    @item = Item.new(params[:item][:value])
    (params[:tag]||[]).each { |x| @item.tags << Tag.find(x) }
    @item.save
    render :json => @item
  rescue => e
    render :json => { :status => 'error', :error => e.to_s }
  end

  def update
    @item = Item.find(params[:id])
    @item.value=params[:item][:value]
    @item.save
    render :json => @item
  rescue => e
    render :json => { :status => 'error', :error => e.to_s }
  end

  def destroy
    Item.find(params[:id]).destroy
    render :json => { :status => 'ok' }
  rescue => e
    render :json => { :status => 'error', :error => e.to_s }
  end

  def add_tag
    @item = Item.find(params[:id])
    (params[:tag]||[]).each { |x| @item.tags << Tag.find(x) }
    @item.save
    render :json => @item
  rescue => e
    render :json => { :status => 'error', :error => e.to_s }
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
