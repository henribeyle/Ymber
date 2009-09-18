class Item < ActiveRecord::Base
  has_and_belongs_to_many :tags

  validates_presence_of :value
  validates_uniqueness_of :value

  def to_json(options = {})
    super(:only => [:value, :id],
        :include => { :tags => { :only => :id }})
  end
end
