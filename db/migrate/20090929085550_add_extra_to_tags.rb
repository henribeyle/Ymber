class AddExtraToTags < ActiveRecord::Migration
  def self.up
    add_column :tags, :extra, :string
  end

  def self.down
    remove_column :tags, :extra
  end
end
