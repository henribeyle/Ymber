module DB

  DBDIR=File.dirname(__FILE__) + "/../db/gitdb"

  def DB.list(glob)
    Dir.chdir(DBDIR) { return Dir.glob(glob) }
  end

  def DB.exists?(file)
    Dir.chdir(DBDIR) { return File.exists?(file) }
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

  def DB.rm(file)
    git('rm',file)
  end
end

class Item
  attr_reader :id
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

  def destroy
    DB.rm("item_#{id}")
    DB.list("#{id}@*").each { |t| DB.rm(t) }
    DB.commit
  end

  def add_tag_by_id(t)
    @id=DB.next_id('item') if @id.nil?
    tag=Tag.find(t)
    DB.write_to("#{@id}@#{tag.id}")
  end

  def Item.find(id)
    a=DB.list("item_#{id}")
    raise "Item id='#{id}' not found" if a.length != 1
    return Item.new(DB.read_from("item_#{id}"),id)
  end
end

class Tag
  attr_reader :id
  attr_writer :value
  attr_writer :extra

  def initialize(value,extra='',id=nil)
    @id=id
    @extra=extra
    @value=value
  end

  def save
    #validations here!!
    @id=DB.next_id('tag_value') if @id.nil?
    DB.write_to("tag_value_#{@id}",@value)
    DB.write_to("tag_extra_#{@id}",@extra)
    DB.commit
  end

  def destroy
    DB.rm("tag_value_#{id}")
    DB.rm("tag_extra_#{id}")
    DB.list("*@#{id}").each { |t| DB.rm(t) }
    DB.commit
  end

  def Tag.find(id)
    a=DB.list("tag_value_#{id}")
    raise "Tag id='#{id}' not found" if a.length != 1
    val=DB.read_from("tag_value_#{id}")
    ext=DB.read_from("tag_extra_#{id}")
    return Tag.new(val,ext,id)
  end
end
