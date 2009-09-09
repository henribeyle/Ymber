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
# 
  def create
    @item = Item.new(params[:item])

    if @item.save then
      render :json => @item.to_json
    else
      render :json => { :status => 'error', :error => @item.errors } 
    end
  end

#   def update
#     @item = Item.find(params[:id])
# 
#     respond_to do |format|
#       if @item.update_attributes(params[:item])
#         flash[:notice] = 'Item was successfully updated.'
#         format.html { redirect_to(@item) }
#         format.xml  { head :ok }
#       else
#         format.html { render :action => "edit" }
#         format.xml  { render :xml => @item.errors, :status => :unprocessable_entity }
#       end
#     end
#   end
# 
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
