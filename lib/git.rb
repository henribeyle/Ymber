DBDIR=File.dirname(__FILE__) + "/../db/gitdb"

def git(*command)
  gd="--git-dir #{DBDIR}/.git"
  wt="--work-tree #{DBDIR}"
  return %x{git #{gd} #{wt} #{command.join(' ')}}
end

def list(glob)
  Dir.chdir(DBDIR) { return Dir.glob(glob) }
end

def next_id(name)
  a=list(name+'_*').map { |x| x.gsub(/^item_/,'').to_i }.sort
  return a.length==0 ? 1 : a.last+1
end

def next_item_id
  return next_id('item')
end

def next_tag_id
  return next_id('tag')
end

def write_to(file,*value)
  File.open(File.join(DBDIR,file), "w") do |f|
    f.print value.join('')
  end
  git('add',file)
end

def read_from(file)
  return IO.read(File.join(DBDIR,file))
end

def remove(file)
  git('rm',file)
#   File.unlink(File.join(DBDIR,file))
end

def item_new(value)
  id=next_item_id
  write_to("item_#{id}")
  return id
end

# puts git('status')

# p 'item next',next_item_id
# p 'tag next',next_tag_id

# v='hola'
# write_to('item_5',v)
# w=read_from('item_5')
# p v==w

# write_to('5@10')
# remove('5@10')

p item_new('hola')
