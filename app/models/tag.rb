class Tag < ActiveRecord::Base
  has_and_belongs_to_many :items

  validates_presence_of :value
  validates_uniqueness_of :value, :case_sensitive => false

  def value=(new_value)
    if self[:value] == 'in' || self[:value] == 'next' || self[:value] == 'waiting' 
      raise "Tag #{self[:value]} is inmutable"
      return
    end
    if new_value == '(none)' 
      raise "Tag (none) can't be used"
    end
    self[:value]=new_value
  end

  def destroy
    if self[:value] == 'in' || self[:value] == 'next' || self[:value] == 'waiting' 
      raise "Tag #{self[:value]} is inmutable"
    else
      super
    end
  end

  def to_json(options = {})
    super(:only => [:value, :extra, :id])
  end
end
