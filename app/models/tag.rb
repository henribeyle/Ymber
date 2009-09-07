class Tag < ActiveRecord::Base
  has_and_belongs_to_many :items

  validates_presence_of :value
  validates_uniqueness_of :value, :case_sensitive => false
end
