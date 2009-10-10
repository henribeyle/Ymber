require "#{RAILS_ROOT}/lib/git"

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

  def Tag.all
    DB.list("tag_value_*").map do |i|
      id=DB.id(i)
      val=DB.read_from("tag_value_#{id}")
      ext=DB.read_from("tag_extra_#{id}")
      Tag.new(val,ext,id)
    end
  end
end
