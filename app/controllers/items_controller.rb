class ItemsController < ApplicationController
#   def index
#     @items = Item.all
#
#     respond_to do |format|
#       format.html # index.html.erb
#       format.xml  { render :xml => @items }
#     end
#   end
#
#   def show
#     @item = Item.find(params[:id])
#
#     respond_to do |format|
#       format.html # show.html.erb
#       format.xml  { render :xml => @item }
#     end
#   end
#
#   def new
#     @item = Item.new
#
#     respond_to do |format|
#       format.html # new.html.erb
#       format.xml  { render :xml => @item }
#     end
#   end
#
#   def edit
#     @item = Item.find(params[:id])
#   end

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
      render :json => @item.json
    else
      render :json => { :status => 'error', :error => @item.errors }
    end
  end

  def update
    begin
      @item = Item.find(params[:id])
    rescue ActiveRecord::RecordNotFound => e
      render :json => { :status => 'error', :error => e.to_s }
      return
    end

    if !@item.update_attributes(params[:item])
      render :json => { :status => 'error', :error => 'could not update item' }
      return
    end

    @item.tags.clear

    params[:tag].each do |x|
      begin
        @item.tags << Tag.find(x)
      rescue ActiveRecord::RecordNotFound => e
        render :json => { :status => 'error', :error => e.to_s }
        return
      end
    end
    render :json => @item.json
  end

#   def destroy
#     @item = Item.find(params[:id])
#     @item.destroy
#
#     respond_to do |format|
#       format.html { redirect_to(items_url) }
#       format.xml  { head :ok }
#     end
#   end
end
