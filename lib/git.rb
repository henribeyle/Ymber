module DB

  DBDIR=File.dirname(__FILE__) + "/../db/gitdb"

  def DB.list(glob)
    Dir.chdir(DBDIR) { return Dir.glob(glob) }
  end

  def DB.next_id(name)
    a=list(name+'_*').map { |x| x.gsub(/^#{name}/,'').to_i }.sort
    return a.length==0 ? 1 : a.last+1
  end

  def DB.git(*command)
    gd="--git-dir #{DBDIR}/.git"
    wt="--work-tree #{DBDIR}"
    return %x{git #{gd} #{wt} #{command.join(' ')}}
  end

  def DB.commit
    git('commit','-m','x')
  end

  def DB.write_to(file,*value)
    File.open(File.join(DBDIR,file), "w") do |f|
      f.print value.join('')
    end
    git('add',file)
  end

  def DB.read_from(file)
    return IO.read(File.join(DBDIR,file))
  end


#
#   def Utils.remove(file)
#     git('rm',file)
#   end
#
#
#
#   def Utils.item_tag_new(item_id,tag_id)
#     write_to("#{item_id}@#{tag_id}")
#   end
#
#   def Utils.item_tag_destroy(item_id,tag_id)
#     remove("#{item_id}@#{tag_id}")
#   end
#
# # puts git('status')
#
# # p 'item next',next_item_id
# # p 'tag next',next_tag_id
#
# # v='hola'
# # write_to('item_5',v)
# # w=read_from('item_5')
# # p v==w
#
# # write_to('5@10')
# # remove('5@10')
#
# # p item_new('item')
# # p tag_new('tag1')
# # p tag_new('tag2','extra2')
#
# # i=item_new('item')
# # t=tag_new('tag1')
# # item_tag_new(i,t)
# # p list('*')
# # save
# # item_tag_destroy(i,t)
# # save
end

class Item
  attr_writer :value

  def initialize(value,id=nil)
    @id=id
    @value=value
  end

  def save
    #validations here!!
    @id=DB.next_id('item') if @id.nil?
    DB.write_to("item_#{@id}",@value)
    DB.commit
  end

  def Item.find(id)
    a=DB.list("item_#{id}")
    raise "Item id='#{id}' not found" if a.length != 1
    return Item.new(DB.read_from("item_#{id}"),id)
  end
end

class Tag
  attr_writer :value
  attr_writer :extra

  def initialize(value,extra=nil,id=nil)
    @id=id
    @extra=extra
    @value=value
  end

  def save
    #validations here!!
    @id=[DB.next_id('tag_value'),DB.next_id('tag_extra')].max if @id.nil?
    DB.write_to("tag_value_#{@id}",@value)
    DB.write_to("tag_extra_#{@id}",@extra) if !@extra.nil? and @extra != ''
    DB.commit
  end

  def Tag.find(id)
    a=DB.list("tag_value_#{id}")
    raise "Tag id='#{id}' not found" if a.length != 1
    return Tag.new(
      DB.read_from("tag_value_#{id}"),
      DB.read_from("tag_extra_#{id}"),
      id)
  end
end

# item=Item.new('hola')
# item.save
# p item
#
# item=Item.find(1)
# p item
# item.value='adios'
# item.save
# p item
