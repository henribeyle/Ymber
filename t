#!./script/runner

case ARGV[0]
  when 'item_add_tag'
    item = Item.find(ARGV[1])
    ARGV.drop(2).each do |x|
      begin
        item.tags << Tag.find(x)
      rescue Exception => e
        puts "error: #{e.to_s}"
        exit
      end
    end
    begin
      item.save
    rescue Exception => e
      puts "error: #{e.to_s}"
      exit
    end
    puts item.to_json
  when 'item_delete_tag'
    item = Item.find(ARGV[1])
    ARGV.drop(2).each do |tid|
      begin
        item.tags.delete_if { |x| x.id==tid }
      rescue Exception => e
        puts "error: #{e.to_s}"
        exit
      end
    end
    begin
      item.save
    rescue Exception => e
      puts "error: #{e.to_s}"
      exit
    end
    puts item.to_json
  when 'item_value_empty'
    item=Item.new('')
    item.save
  when 'item_value_unique'
    item=Item.new('hola')
    item.save
    item=Item.new('hola')
    item.save
  when 'tag_value_empty'
    tag=Tag.new('')
    tag.save
  when 'tag_value_unique'
    tag=Tag.new('hola')
    tag.save
    tag=Tag.new('hola')
    tag.save
  when 'tag_immutable'
    tag=Tag.new('next')
    tag.save
    tag.value='next-modified'
    tag.save
  when 'tag_none'
    tag=Tag.new('(none)')
    tag.save
  when 'tag_destroy_immutable'
    tag=Tag.new('next')
    tag.save
    tag.destroy
  when 'just_one_tag'
    tnext=Tag.new('next')
    tnext.save
    tin=Tag.new('in')
    tin.save
    item=Item.new('hola')
    item.tags << tin
    item.tags << tnext
    item.save
  when 'tag_json'
    tag=Tag.new('next')
    tag.save
    puts tag.to_json
  when 'item_json'
    tag=Tag.new('next')
    tag.save
    item=Item.new('hola')
    item.tags << tag
    item.save
    puts item.to_json
  when 'tag_all'
    puts Tag.all.to_json
  when 'items_with_no_tags'
    puts Item.untagged.to_json
  else
    puts "what?"
end
