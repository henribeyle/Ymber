require "#{RAILS_ROOT}/lib/git"

class Item
  attr_reader :id
  attr_writer :value
  attr_reader :tags
  attr_writer :tags

  def initialize(value,id=nil)
    @id=id
    @value=value
    @tags=[]
    if(!id.nil?) then
      DB.list("#{id}@*").each do |t|
        @tags.push(Tag.find(DB.id(t)[1]))
      end
    end
  end

  def save
    raise "item value can not be empty" if(@value == '')
    if(@tags.map {|t| t.value } & ['in','next','waiting']).size > 1 then
      raise "tags in, next, and waiting are mutually exclusively"
    end
    @id=DB.next_id('item') if @id.nil?
    DB.write_to("item_#{@id}",@value)
    DB.list("#{id}@*").each { |t| DB.rm(t) }
    @tags.each { |x| DB.write_to("#{@id}@#{x.id}") }

    hash=DB.hash(*DB.list("item_*"))
    if(hash.length != hash.uniq.length) then
      DB.rollback
      raise "duplicate item '#{@value}'"
    end
    DB.commit
  end

  def destroy
    DB.rm("item_#{id}")
    DB.list("#{id}@*").each { |t| DB.rm(t) }
    DB.commit
  end

  def Item.find(id)
    a=DB.list("item_#{id}")
    raise "Item id='#{id}' not found" if a.length != 1
    return Item.new(DB.read_from("item_#{id}"),id)
  end
end
