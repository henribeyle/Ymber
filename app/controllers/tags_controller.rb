require "#{RAILS_ROOT}/lib/git"

class TagsController < ApplicationController
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
    @tags=Tag.all
    if(value) then
      tag = @tags.find { |x| x.value == value }
      if !tag
        redirect_to('/')
        return
      end
      @tagname=tag.value
      @items=tag.items
    else
      @tagname='(none)'
      @items=Item.untagged
    end
  end
end
