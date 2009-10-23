require "#{RAILS_ROOT}/lib/git"

class TagsController < ApplicationController
private
  def schedule_into_in()
    tin=Tag.find(1)
    tsomeday=Tag.find(4)
    date_regex=/^@\[(\d{2})\/(\d{2})\/(\d{4})\] */
    today=Date.today
    i=0
    tsomeday.items.each do |item|
      m=item.value.match(date_regex)
      next if m==nil
      if(Date.civil(m[3].to_i,m[2].to_i,m[1].to_i) <= today) then
        item.value.gsub!(date_regex,'[from someday] ')
        item.tags.delete_if { |x| x.id.to_i==tsomeday.id.to_i }
        item.tags << tin
        item.save
        i+=1
      end
    end
    return i
  end

public
  def create
    render :json => Tag.new(params[:tag][:value]).save
  rescue => e
    render :json => { :status => 'error', :error => e.to_s }
  end

  def update
    @tag=Tag.find(params[:id])
    @tag.value=params[:tag][:value]
    render :json => @tag
  rescue => e
    render :json => { :status => 'error', :error => e.to_s }
  end

  def destroy
    Tag.find(params[:id]).destroy
    render :json => { :status => 'ok' }
  rescue Exception => e
    render :json => { :status => 'error', :error => e.to_s }
  end

  def undo
    value=params[:value]
    DB.git('reset','--hard',"HEAD~#{value}")
    render :json => { :status => 'ok' }
  end

  def redo
    a=DB.git('reflog').split(/\n/)
    howmany=0
    for i in 0...a.length do
      break if a[i] !~ /HEAD@\{\d+\}: updating HEAD/
      howmany+=1
    end
    check=true
    for i in howmany...2*howmany
      if(a[i] !~ /HEAD~\d+: updating HEAD/) then
        check=false
        break
      end
    end

    a.shift(howmany*2) if(howmany)
    m=a[0].match(/.* HEAD~(\d+): updating HEAD/)
    n=a[1].match(/.* (HEAD@\{\d+\}): .*/)
    if(check && m && m.size == 2 && n && n.size == 2) then
      DB.git('reset','--hard',n[1])
      render :json => { :status => 'ok', :level => m[1] }
    else
      render :json => { :status => 'error', :error => 'redo not possible' }
    end
  end

  def editor
    @google_key=config_value('google_key')
    @calendar_url=config_value('calendar_url')
    value=params[:value]
    @extra_undo=0
    @tags=Tag.all
    if(value) then
      tag = @tags.find { |x| x.value == value }
      if !tag
        redirect_to('/')
        return
      end
      @extra_undo=schedule_into_in() if(value == 'in')
      @tagname=tag.value
      @items=tag.items
    else
      @tagname='(none)'
      @items=Item.untagged
    end
  end
end
