class TagsController < ApplicationController
#   def index
#     @tags = Tag.all
#
#     respond_to do |format|
#       format.html # index.html.erb
#       format.xml  { render :xml => @tags }
#     end
#   end
#
#   def show
#     @tag = Tag.find(params[:id])
#
#     respond_to do |format|
#       format.html # show.html.erb
#       format.xml  { render :xml => @tag }
#     end
#   end
#
#   def new
#     @tag = Tag.new
#
#     respond_to do |format|
#       format.html # new.html.erb
#       format.xml  { render :xml => @tag }
#     end
#   end
#
#   def edit
#     @tag = Tag.find(params[:id])
#   end

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
    rescue ActiveRecord::RecordNotFound => e
      render :json => { :status => 'error', :error => e.to_s }
      return
    end

    if !@tag.update_attributes(params[:tag])
      render :json => { :status => 'error', :error => 'could not update tag' }
      return
    end

    render :json => @tag
  end

#   def destroy
#     @tag = Tag.find(params[:id])
#     @tag.destroy
#
#     respond_to do |format|
#       format.html { redirect_to(tags_url) }
#       format.xml  { head :ok }
#     end
#   end

  def editor
    value=params[:value]
    if(value) then
      @tag = Tag.find_by_value(value)
      redirect_to('/') if(!@tag)
    end
  end
end
