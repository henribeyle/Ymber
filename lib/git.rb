module DB

  DBDIR=File.dirname(__FILE__) + "/../db"

  def DB.list(glob)
    Dir.chdir(DBDIR) { return Dir.glob(glob) }
  end

  def DB.exists?(file)
    Dir.chdir(DBDIR) { return File.exists?(file) }
  end

  def DB.next_id(name)
    a=list(name+'_*').map { |x| x.gsub(/^#{name}/,'').to_i }.sort
    return a.length==0 ? 1 : a.last+1
  end

  def DB.git(*command)
    Dir.chdir(DBDIR) { %x{git #{command.join(' ')}} }
  end

  def DB.commit
    git('commit','-m','x')
  end

  def DB.rollback
    git('reset','HEAD')
    git('clean','-f')
  end

  def DB.write_to(file,*value)
    File.open(File.join(DBDIR,file), "w") do |f|
      f.print value.join('')
    end
    git('add',file)
  end

  def DB.read_from(file)
    return IO.read(File.join(DBDIR,file))
  end

  def DB.rm(file)
    git('rm',file)
  end

  def DB.hash(*objects)
    return objects.map { |o| git('hash-object',o).chomp }
  end

  def DB.id(file)
    case file
      when /.*@.*/
        return /^(\d+)@(\d+)$/.match(file).to_a.drop(1)
      when /item_.*/
        return /^item_(\d+)$/.match(file).to_a[1]
      when /tag_.*/
        return /^tag_(value|extra)_(\d+)$/.match(file).to_a[2]
      else
        raise 'unknown id for file '+file
    end
  end
end
