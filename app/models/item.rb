class Item < ActiveRecord::Base
  has_and_belongs_to_many :tags

  validates_presence_of :value
  validates_uniqueness_of :value

  def validate
    tg=tags.map {|t| t.value }
    if (tg & ['in','next','waiting']).size > 1 then
      errors.add_to_base "Tags in, next, and waiting are mutually exclusively" 
    end
  end

  def to_json(options = {})
    super(:except => [:created_at, :updated_at],
        :include => { :tags => { :only => :id }})
  end
end
