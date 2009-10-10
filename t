#!/usr/bin/ruby -w

require 'lib/git'

case ARGV[0]
  when 'item_create'
    item=Item.new("item#{ARGV[1]}")
    ARGV.drop(2).each do |x|
      begin
        item.add_tag_by_id(x)
      rescue Exception => e
        puts "error: #{e.to_s}"
        exit
      end
    end
    begin
      item.save
    rescue Exception => e
      puts "error: #{e.to_s}"
      exit
    end
    p item
  when 'item_update'
    item=Item.find('1')
    item.value='item.mod'
    item.save
    p item
  when 'item_destroy'
    item=Item.find('1')
    item.destroy
  when 'tag_create'
    tag=Tag.new("tag#{ARGV[1]}")
    tag.save
    p tag
  when 'tag_update_value'
    tag=Tag.find(ARGV[1])
    tag.value+='.mod'
    tag.save
    p tag
  when 'tag_update_extra'
    tag=Tag.find(ARGV[1])
    tag.extra+='.mod'
    tag.save
    p tag
  when 'tag_destroy'
    tag=Tag.find(ARGV[1])
    tag.destroy
  else
    puts "what?"
end

#
#   def add_tag
#     begin
#       @item = Item.find(params[:id])
#     rescue ActiveRecord::RecordNotFound => e
#       render :json => { :status => 'error', :error => e.to_s }
#       return
#     end
#
#     (params[:tag]||[]).each do |x|
#       begin
#         add_tag_to_item(@item,x)
#       rescue ActiveRecord::RecordNotFound => e
#         render :json => { :status => 'error', :error => e.to_s }
#         return
#       rescue Exception => e
#         render :json => { :status => 'error', :error => e.to_s }
#         return
#       end
#     end
#     if @item.save then
#       render :json => @item
#     else
#       render :json => { :status => 'error', :error => @item.errors.full_messages[0] }
#     end
#   end
#
#   def delete_tag
#     begin
#       @item = Item.find(params[:id])
#     rescue ActiveRecord::RecordNotFound => e
#       render :json => { :status => 'error', :error => e.to_s }
#       return
#     end
#
#     (params[:tag]||[]).each do |x|
#       begin
#         @item.tags.delete(Tag.find(x))
#       rescue ActiveRecord::RecordNotFound => e
#         render :json => { :status => 'error', :error => e.to_s }
#         return
#       end
#     end
#     if @item.save then
#       render :json => @item
#     else
#       render :json => { :status => 'error', :error => @item.errors.full_messages[0] }
#     end
#   end
# end
