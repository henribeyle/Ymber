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
    @item = Item.find(params[:id])
    (params[:tag]||[]).each { |tid| @item.tags.delete_if { |x| x.id==tid } }
    @item.save
    render :json => @item
  rescue => e
    render :json => { :status => 'error', :error => e.to_s }
  end
end
