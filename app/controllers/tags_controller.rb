class TagsController < ApplicationController
  def create
    render :json => Tag.new(params[:tag][:value]).save
  rescue => e
    render :json => { :status => 'error', :error => e.to_s }
  end

  def update
    @tag=Tag.find(params[:id])
    @tag.value=params[:tag][:value]
    render :json => @tag
  rescue => e
    render :json => { :status => 'error', :error => e.to_s }
  end

  def destroy
    Tag.find(params[:id]).destroy
    render :json => { :status => 'ok' }
  rescue Exception => e
    render :json => { :status => 'error', :error => e.to_s }
  end

  def editor
    value=params[:value]
    @tags=Tag.all
    if(value) then
      tag = @tags.find { |x| x.value == value }
      if !tag
        redirect_to('/') 
        return
      end
      @tagname=tag.value
      @items=tag.items
    else
      @tagname='(none)'
      @items=Item.untagged
    end
  end
end
