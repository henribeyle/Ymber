require "#{RAILS_ROOT}/lib/git"

namespace :db do
  namespace :gitdb do

    desc "Create gitdb infrastructure"
    task :create => :environment do
      raise "gitdb directory exists" if File.exists?(DB::DBDIR)
      FileUtils.mkdir(DB::DBDIR)
      Dir.chdir(DB::DBDIR) do
        %x{git init}
      end
      Tag.new("in","<img src='/images/in.png' title='in'/>",1).save
      Tag.new("next","<img src='/images/next.png' title='next'/>",2).save
      Tag.new("waiting","<img src='/images/waiting.png' title='waiting'/>",3).save
      Tag.new("someday","<img src='/images/someday.png' title='someday'/>",4).save
    end

    desc "Put in some common stuff"
    task :common => :environment do
      Tag.new("computer","<img src='/images/computer.png' title='computer'/>",5).save
      Tag.new("email","<img src='/images/email.png' title='email'/>",6).save
      Tag.new("home","<img src='/images/home.png' title='home'/>",7).save
      Tag.new("internet","<img src='/images/internet.png' title='internet'/>",8).save
      Tag.new("phone","<img src='/images/phone.png' title='phone'/>",9).save
      Tag.new("errands","<img src='/images/errand.png' title='errands'/>",10).save
      Tag.new("talk","<img src='/images/talk.png' title='talk'/>",11).save
      Tag.new("friends","<img src='/images/wine.png' title='friends'/>",12).save
      Tag.new("small things","<img src='/images/cafe.png' title='small things'/>",13).save
    end

    desc "Delete gitdb infrastructure"
    task :drop => :environment do
      FileUtils.rm_rf(DB::DBDIR)
    end

    desc "Load seed data (for initial testing)"
    task :seed => :environment do
      t1=Tag.new("tag-one").save
      t2=Tag.new("tag-two").save
      tin=Tag.find(1)
      tnext=Tag.find(2)
      twaiting=Tag.find(3)
      i1=Item.new('item-one')
      i1.tags << tin << t2
      i1.save
      i2=Item.new('item-two')
      i2.tags << tnext << t1 << t2
      i2.save
      i3=Item.new('item-three')
      i3.save
      i4=Item.new("item-four is a location in a map: {41.3896,2.1725} at a 21/10/2009\n - hola\n - adios")
      i4.tags << t1 << t2
      i4.save
      i5=Item.new('item-five')
      i5.tags << tin << t1
      i5.save
    end

  end
end
