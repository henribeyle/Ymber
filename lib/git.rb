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
    Dir.chdir(DBDIR) { %x{git #{command.join(' ')}} }
  end

  def DB.commit
    git('commit','-m','x')
  end

  def DB.rollback
    git('reset','HEAD')
    git('clean','-f')
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

  def DB.hash(*objects)
    return objects.map { |o| git('hash-object',o).chomp }
  end

  def DB.id(file)
    case file
      when /.*@.*/
        return /^(\d+)@(\d+)$/.match(file).to_a.drop(1)
      when /item_.*/
        return /^item_(\d+)$/.match(file).to_a[1]
      when /tag_.*/
        return /^tag_(value|extra)_(\d+)$/.match(file).to_a[2]
      else
        raise 'unknown id for file '+file
    end
  end
end

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

class Tag
  attr_reader :id
  attr_reader :value
  attr_reader :extra
  attr_writer :extra

  def initialize(value,extra='',id=nil)
    @id=id
    @extra=extra
    @value=value
    if value == '(none)'
      raise "tag (none) can't be used"
    end
  end

  def value=(new_value)
    if @value == 'in' || @value == 'next' || @value == 'waiting'
      raise "tag #{@value} is immutable"
    end
    if new_value == '(none)'
      raise "tag (none) can't be used"
    end
    @value=new_value
  end

  def save
    raise "tag value can not be empty" if(@value == '')
    @id=DB.next_id('tag_value') if @id.nil?
    DB.write_to("tag_value_#{@id}",@value)
    DB.write_to("tag_extra_#{@id}",@extra)

    hash=DB.hash(*DB.list("tag_value_*"))
    if(hash.length != hash.uniq.length) then
      DB.rollback
      raise "duplicate tag '#{@value}'"
    end
    DB.commit
  end

  def destroy
    if @value == 'in' || @value == 'next' || @value == 'waiting'
      raise "tag #{@value} is immutable"
    end

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
