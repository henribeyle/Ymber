// commands are functions which make all the work in the gui
// but which can be called from different places
// they all accept two functions at the end (may be null)
// which will be called on success or on failure

function load_data(nT,nF) {
  $('#loading').show()
  $.ajax({
    type: "GET",
    cache: false,
    url: location.pathname+".js",
    success: suc(nT,nF,function(a) {
      $('#loading').hide()
      this_tag=a.this_tag
      all_tags=a.all_tags
      all_items=a.all_items
      google_key=a.google_key
      calendar_url=a.calendar_url
      extra_undo=a.extra_undo

      $('#items').children().remove()
      $('#tags').children().remove()

      _d=new Data(this_tag,all_tags,all_items)
      _d.cookie_status()

      if(extra_undo) _d.add_undo(extra_undo)

      if(_d.main_tag) {
        $('#title .main').html(_d.main_tag.value_or_extra())
        _d.review_tag(_d.main_tag.id)
      }

      if(['in','next','waiting','someday'].contains(this_tag)) {
        $('.main-button').remove()
        $('<img>').
          attr('src',"/images/empty.png").
          addClass('button').
          addClass('main-button').
          appendTo('#title')
        if(this_tag != 'someday')
          $('<img>').
            attr('src',"/images/add_to_someday.png").
            attr('title','send to Someday').
            addClass('button').
            addClass('main-button').
            appendTo('#title').
            click(function() {
              if(_d.item_show) {
                $.select_date(null,function(x) {
                  item_send_to_someday(_d.item_show,x,p_mess('item sent to someday'))
                })
              }
            })
        if(this_tag != 'waiting')
          $('<img>').
            attr('src',"/images/add_to_waiting.png").
            attr('title','send to Waiting').
            addClass('button').
            addClass('main-button').
            appendTo('#title').
            click(function() {
              if(_d.item_show)
                item_send_to_waiting(_d.item_show,p_mess('item sent to waiting'))
            })
        if(this_tag != 'next')
          $('<img>').
            attr('src',"/images/add_to_next.png").
            attr('title','send to Next').
            addClass('button').
            addClass('main-button').
            appendTo('#title').
            click(function() {
              if(_d.item_show)
                item_send_to_next(_d.item_show,p_mess('item sent to next'))
            })
        if(this_tag != 'in')
          $('<img>').
            attr('src',"/images/add_to_in.png").
            attr('title','send to In').
            addClass('button').
            addClass('main-button').
            appendTo('#title').
            click(function() {
              if(_d.item_show)
                item_send_to_in(_d.item_show,p_mess('item sent to in'))
            })
      }

      $('#title').droppable({
        accept: '.tag',
        hoverClass: 'dropping-into-item',
        drop: function(event, ui) {
          tag_filter(_d.tag_id($(ui.draggable).oid()))
        }
      })

      $("#items").sortable({
        handle: '.item-handler',
        cursor: 'move',
        opacity: 0.5,
        placeholder: 'items-sortable-placeholder',
        stop: function(e, ui) {
          var prev=null
          var oid=null

          if(ui.item[0].previousElementSibling) {
            oid=$(ui.item[0].previousElementSibling).oid()
            prev=true
          } else if(ui.item[0].nextElementSibling) {
            oid=$(ui.item[0].nextElementSibling).oid()
            prev=false
          }
          var myoid=$(ui.item[0]).oid()
          var item1=_d.item_id(myoid)
          var item2=_d.item_id(oid)
          $(this).sortable('cancel')
          if(prev)
            item_move_after(item1,item2)
          else
            item_move_before(item1,item2)
        }
      })
    }),
    error: te(nF)
  })
}

function item_new(value,mtag,nT,nF) {
  var dp=encodeURIComponent('item[value]='+value)
  if(mtag) {
    dp+='&'+mtag.map(function(x) {
      return x ? encodeURIComponent('tag[]='+x.id) : null
    }).join('&')
  }

  $.ajax({
    type: "POST",
    cache: false,
    url: "/items",
    data: dp,
    success: suc(nT,nF,function(a) {
      var item=new Item(a.value,a.id)
      _d.add_item(item)
      a.tags.each(function(t) {
        var tag=_d.tag_id(t.id)
        item.add_tag(tag)
        tag.add(item)
        item.tag_ui(tag)
      })
      _d.check_filtering(item)
      _d.save_order_cookie()
      _d.add_undo()
    }),
    error: te(nF)
  })
}

function item_delete(item,nT,nF) {
  $.ajax({
    type: "DELETE",
    cache: false,
    url: "/items/"+item.id,
    success: suc(nT,nF,function(a) {
      item.tags.concat().each(function(tag) {
        tag.rm(item)
      })
      item_disappear(item)
      _d.rm_item(item)
      _d.save_order_cookie()
      item.destroy_ui()
      _d.add_undo()
    }),
    error: te(nF)
  })
}

function item_update(item,value,nT,nF) {
  if(item.value == value) {
    $.warning('value has not changed')
    return
  }

  $.ajax({
    type: "PUT",
    cache: false,
    url: "/items/"+item.id,
    data: {'item[value]': value},
    success: suc(nT,nF,function(a) {
      item.update(a.value)
      _d.add_undo()
    }),
    error: te(nF)
  })
}

function item_add_tag(item,tag,nT,nF) {
  if(item.has(tag)) {
    $.warning('item already has tag')
    return
  }

  $.ajax({
    type: "PUT",
    cache: false,
    url: "/items/"+item.id+'/tag',
    data: 'tag[]='+tag.id,
    success: suc(nT,nF,function(a) {
      item.add_tag(tag)
      tag.add(item)
      tag.count++
      item.tag_ui(tag)
      _d.add_undo()
    }),
    error: te(nF)
  })
}

function item_remove_tag(item,tag,nT,nF) {
  $.ajax({
    type: "DELETE",
    cache: false,
    url: "/items/"+item.id+'/tag',
    data: 'tag[]='+tag.id,
    success: suc(nT,nF,function(a) {
      item.rm(tag)
      tag.rm(item)
      tag.count--
      item.rm_ui(tag)
      if(tag == _d.main_tag) {
        item_disappear(item)
        _d.rm_item(item)
        item.destroy_ui()
      }
      _d.check_filtering(item)
      _d.add_undo()
    }),
    error: te(nF)
  })
}

function tag_new(value,nT,nF) {
  $.ajax({
    type: "POST",
    cache: false,
    url: "/tags",
    data: { 'tag[value]': value.replace(/\n/,'') },
    success: suc(nT,nF,function(a) {
      _d.add_tag(new Tag(a.value,a.extra,a.id,a.item_count))
      _d.add_undo()
    }),
    error: te(nF)
  })
}

function tag_delete(tag,nT,nF) {
  $.ajax({
    type: "DELETE",
    cache: false,
    url: "/tags/"+tag.id,
    success: suc(nT,nF,function(a) {
      tag.items.concat().each(function(item) {
        item.rm(tag)
        tag.rm(item)
        item.rm_ui(tag)
      })
      tag_unfilter(tag)
      _d.rm_tag(tag)
      tag.destroy_ui()
      if(tag == _d.main_tag) go_to('')
      _d.add_undo()
    }),
    error: te(nF)
  })
}

function tag_update(tag,value,nT,nF) {
  value=value.replace(/\n/,'')
  if(tag.value == value) {
    $.warning('value has not changed')
    return
  }

  $.ajax({
    type: "PUT",
    cache: false,
    url: "/tags/"+tag.id,
    data: { 'tag[value]' : value },
    success: suc(nT,nF,function(a) {
      tag.update(a.value)
      tag.items.each(function(item) {
        item.update_tag(tag)
      })
      if(tag==_d.main_tag)
        go_to(tag.value)
      if(tag.filtering)
        _d.update_filter()
      _d.add_undo()
    }),
    error: te(nF)
  })
}

function tag_filter(tag) {
  if(tag == _d.main_tag || _d.has_filter(tag)) {
    return
  }

  tag.filter_on()
  _d.add_filter(tag)
  _d.update_filter()
}

function tag_unfilter(tag) {
  if(tag == _d.main_tag || !_d.has_filter(tag)) {
    return
  }

  tag.filter_off()
  _d.rm_filter(tag)
  _d.update_filter()
}

function and_filtering() {
  _d.filter_type=true
  _d.update_filter()
}

function or_filtering() {
  _d.filter_type=false
  _d.update_filter()
}

function item_make_visible(item) {
  var sc=$(document).scrollTop()
  var wheight=$(window).height()
  var height=item.ui.height()
  var top=item.ui.position().top
  var last_point=height+top

  if(last_point-sc >= wheight) {
    window.scrollBy(0,last_point-sc-wheight+5)
  }
  var nsc=$(document).scrollTop()
  if(nsc>top) {
    window.scrollBy(0,top-nsc-5)
  }
}

function item_show(item) {
  if(_d.item_show)
    _d.item_show.show_mark(false)
  _d.item_show=item
  if(_d.item_show) {
    _d.item_show.show_mark(true)
    item_make_visible(item)
  }
}

function item_show_next() {
  var item=_d.next(_d.item_show)
  if(item)
    item_show(item)
}

function item_show_prev() {
  var item=_d.prev(_d.item_show)
  if(item)
    item_show(item)
}

function item_show_first() {
  if(_d.item_show) {
    _d.item_show.show_mark(false)
    _d.item_show=null
  }
  item_show_next()
}

function item_show_last() {
  if(_d.item_show) {
    _d.item_show.show_mark(false)
    _d.item_show=null
  }
  item_show_prev()
}

function item_expand(item) {
  item.expand()
  item_make_visible(item)
  _d.review_item(item.id)
}

function item_collapse(item) {
  item.collapse()
}

function item_toggle_expand(item) {
  item.toggle_expand()
  item_make_visible(item)
  _d.review_item(item.id)
}

function item_expand_all() {
  _d.items.each(function(item) { item_expand(item) })
}

function item_collapse_all() {
  _d.items.each(function(item) { item_collapse(item) })
}

function item_move_selection_down() {
  if(_d.item_show==null) return
  var item=_d.next(_d.item_show)
  if(item) {
    item_move_after(_d.item_show,item)
    item_make_visible(_d.item_show)
  }
}

function item_move_selection_up() {
  if(_d.item_show==null) return
  var item=_d.prev(_d.item_show)
  if(item) {
    item_move_before(_d.item_show,item)
    item_make_visible(_d.item_show)
  }
}

function item_move_selection_last() {
  if(_d.item_show==null)
    return
  var last=_d.prev()
  if(last!=_d.item_show) {
    item_move_after(_d.item_show,last)
    item_make_visible(_d.item_show)
  }
}

function item_move_selection_first() {
  if(_d.item_show==null)
    return
  var first=_d.next()
  if(first!=_d.item_show) {
    item_move_before(_d.item_show,first)
    item_make_visible(_d.item_show)
  }
}

function item_move_before(item1,item2) {
  //log('want to put '+item1.value+' before '+item2.value)
  if(item1==item2) {
    return
  }

  _d.rm_item(item1)
  _d.items.splice(_d.item(item2),0,item1)

  item2.ui.before(item1.ui)
  _d.save_order_cookie()
}

function item_move_after(item1,item2) {
  //log('want to put '+item1.value+' after '+item2.value)
  if(item1==item2) {
    return
  }
  _d.rm_item(item1)
  _d.items.splice(_d.item(item2)+1,0,item1)

  item2.ui.after(item1.ui)
  _d.save_order_cookie()
}

function item_change_basic_types(item,tag_rm,tag_add,prepend,nT,nF) {
  var remove_and_add = function() {
    if(tag_rm!=null) {
      item_remove_tag(item,tag_rm,function() {
        item_add_tag(item,tag_add,function() {
          is_fun(nT) && nT()
          _d.join_undos(prepend ? 3 : 2)
        },nF)
      },nF)
    } else {
      item_add_tag(item,tag_add,nT,nF)
    }
  }

  if(prepend)
    item_update(item,prepend+item.value,remove_and_add,nF)
  else
    remove_and_add()
}

function item_send_to_in(item,nT,nF) {
  var tag_in=_d.tag_value('in')
  var tag_next=_d.tag_value('next')
  var tag_waiting=_d.tag_value('waiting')
  var tag_someday=_d.tag_value('someday')
  var tag_remove=null

  if(item.has(tag_next)) tag_remove=tag_next
  if(item.has(tag_waiting)) tag_remove=tag_waiting
  if(item.has(tag_someday)) tag_remove=tag_someday

  item_change_basic_types(item,tag_remove,tag_in,null,nT,nF)
}

function item_send_to_next(item,nT,nF) {
  var tag_in=_d.tag_value('in')
  var tag_next=_d.tag_value('next')
  var tag_waiting=_d.tag_value('waiting')
  var tag_someday=_d.tag_value('someday')
  var tag_remove=null

  if(item.has(tag_in)) tag_remove=tag_in
  if(item.has(tag_waiting)) tag_remove=tag_waiting
  if(item.has(tag_someday)) tag_remove=tag_someday

  item_change_basic_types(item,tag_remove,tag_next,null,nT,nF)
}

function item_send_to_waiting(item,nT,nF) {
  var tag_in=_d.tag_value('in')
  var tag_next=_d.tag_value('next')
  var tag_waiting=_d.tag_value('waiting')
  var tag_someday=_d.tag_value('someday')
  var tag_remove=null

  if(item.has(tag_in)) tag_remove=tag_in
  if(item.has(tag_next)) tag_remove=tag_next
  if(item.has(tag_someday)) tag_remove=tag_someday

  item_change_basic_types(item,tag_remove,tag_waiting,'['+today()+'] ',nT,nF)
}

function item_send_to_someday(item,dt,nT,nF) {
  var tag_in=_d.tag_value('in')
  var tag_next=_d.tag_value('next')
  var tag_waiting=_d.tag_value('waiting')
  var tag_someday=_d.tag_value('someday')
  var tag_remove=null

  if(item.has(tag_in)) tag_remove=tag_in
  if(item.has(tag_next)) tag_remove=tag_next
  if(item.has(tag_waiting)) tag_remove=tag_waiting

  item_change_basic_types(item,tag_remove,tag_someday,'@['+dt+'] ',nT,nF)
}

function item_split(item,start,end,extra_tags,nT,nF) {
  if(start==end) {
    is_fun(nF) && nF()
    return
  }

  var data=divide(item.value,start,end," - ")
  if(data==null) {
    //$.warning('division produced errors')
    is_fun(nF) && nF()
    return
  }

//   for(var i=0;i<data.length;i++)
//      log("data ["+i+"]= '"+data[i]+"'")
  var tags=item.tags.concat()
  if(extra_tags && extra_tags.length!=0)
    tags=tags.concat(extra_tags)

  function process_new_data_items() {
    function process_one_data_item(element) {
      item_new(data[element],tags,function() {
        item_move_after(_d.items.last(),item, function() {
          if(element>1)
            process_one_data_item(element-1)
          else {
            _d.join_undos(data.length)
            is_fun(nT) && nT()
          }
        })
      })
    }
    process_one_data_item(data.length-1)
  }
  item_update(item,data[0],process_new_data_items,nF)
}

function undo(nT,nF) {
  var howmany=_d.last_undo()
  if(howmany == 0) {
    $.warning('nothing to undo')
    return
  }

  $.ajax({
    type: "GET",
    cache: false,
    url: "/undo/"+howmany,
    success: suc(nT,nF,function(a) {
      //console.dir(a)
      $.message('undo produced')
      load_data()
    }),
    error: te(nF)
  })
}

function redo(nT,nF) {
  $.ajax({
    type: "GET",
    cache: false,
    url: "/redo",
    success: suc(nT,nF,function(a) {
      $.message('redo produced')
      _d.add_undo(a.level)
      load_data()
    }),
    error: te(nF)
  })
}

function toggle_review() {
  if(_d.review)
    _d.review_off()
  else
  _d.review_on()
}

function item_disappear(item) {
  if(item==_d.item_show)
    item_show_next()
  if(item==_d.item_show)
    item_show_prev()
  if(item==_d.item_show) {
    item.show_mark(false)
    _d.item_show=null
  }
}
