require "#{RAILS_ROOT}/lib/git"

class Tag
private
  def new_value(value)
    if value == '(none)'
      raise "tag (none) can't be used"
    end
    value.strip!
    if value =~ /\n/
      raise "tags cant have multiple lines"
    end
    return value
  end

public
  attr_reader :id
  attr_reader :value
  attr_reader :extra
  attr_writer :extra

  def initialize(value,extra='',id=nil)
    @id=id
    @extra=extra
    @value=new_value(value)
  end

  def value=(value)
    if @value == 'in' || @value == 'next' || @value == 'waiting'
      raise "tag #{@value} is immutable"
    end
    @value=new_value(value)
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
    return self
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

  def items
    it=[]
    DB.list("*@#{id}").each do |t|
      it.push(Item.find(DB.id(t)[0]))
    end
    it
  end

  def Tag.find(id)
    a=DB.list("tag_value_#{id}")
    raise "Tag id='#{id}' not found" if a.length != 1
    val=DB.read_from("tag_value_#{id}")
    ext=DB.read_from("tag_extra_#{id}")
    return Tag.new(val,ext,id)
  end

  def Tag.all
    DB.list("tag_value_*").map do |i|
      id=DB.id(i)
      val=DB.read_from("tag_value_#{id}")
      ext=DB.read_from("tag_extra_#{id}")
      Tag.new(val,ext,id)
    end
  end
end
