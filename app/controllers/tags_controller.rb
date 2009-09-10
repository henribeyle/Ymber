class TagsController < ApplicationController
  def create
    @tag = Tag.new(params[:tag])

    if @tag.save then
      render :json => @tag
    else
      render :json => { :status => 'error', :error => @tag.errors }
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
    if(value) then
      @tag = Tag.find_by_value(value)
      redirect_to('/') if(!@tag)
    end
  end
end
