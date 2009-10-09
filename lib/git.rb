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


# puts git('status')
# p 'item next',next_item_id
# p 'tag next',next_tag_id
