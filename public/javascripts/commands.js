// commands are functions which make all the work in the gui
// but which can be called from different places
// they all accept two functions at the end (may be null)
// which will be called on success or on failure

function load_data(nT,nF) {
  $.message('loading data ...')
  $.ajax({
    type: "GET",
    url: location.pathname+".js",
    success: suc(nT,nF,function(a) {
      $.message('loaded')
      this_tag=a.this_tag
      all_tags=a.all_tags
      all_items=a.all_items
      google_key=a.google_key
      calendar_url=a.calendar_url
      extra_undo=a.extra_undo

      if(_d)
        _d.destroy()

      _d=new Data(this_tag,all_tags,all_items)
      _d.order_from_cookie()
      _d.filters_from_cookie()
      _d.undo_from_cookie()
      if(extra_undo) _d.add_undo(extra_undo)

      if(_d.main_tag)
        $('#title .main').html(_d.main_tag.value_or_extra())

      if(this_tag == 'in') {
        $('<img>').
          attr('src',"/images/empty.png").
          addClass('button').
          appendTo('#title')
        $('<img>').
          attr('src',"/images/add_to_someday.png").
          attr('title','send to Someday').
          addClass('button').
          appendTo('#title').
          click(function() {
            if(_d.item_show) {
              $.select_date(null,function(x) {
                item_send_to_someday(_d.item_show,x,p_mess('item sent to someday'))
              })
            }
          })
         $('<img>').
          attr('src',"/images/add_to_waiting.png").
          attr('title','send to Waiting').
          addClass('button').
          appendTo('#title').
          click(function() {
            if(_d.item_show)
              item_send_to_waiting(_d.item_show,p_mess('item sent to waiting'))
          })
        $('<img>').
          attr('src',"/images/add_to_next.png").
          attr('title','send to Next').
          addClass('button').
          appendTo('#title').
          click(function() {
            if(_d.item_show)
              item_send_to_next(_d.item_show,p_mess('item sent to next'))
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
      return encodeURIComponent('tag[]='+x.id)
    }).join('&')
  }

  $.ajax({
    type: "POST",
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
    url: "/items/"+item.id,
    success: suc(nT,nF,function(a) {
      item.tags.concat().each(function(tag) {
        tag.rm(item)
      })
      if(item==_d.item_show)
        item_show_next()
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
    url: "/items/"+item.id+'/tag',
    data: 'tag[]='+tag.id,
    success: suc(nT,nF,function(a) {
      item.add_tag(tag)
      tag.add(item)
      item.tag_ui(tag)
      _d.add_undo()
    }),
    error: te(nF)
  })
}

function item_remove_tag(item,tag,nT,nF) {
  $.ajax({
    type: "DELETE",
    url: "/items/"+item.id+'/tag',
    data: 'tag[]='+tag.id,
    success: suc(nT,nF,function(a) {
      item.rm(tag)
      tag.rm(item)
      item.rm_ui(tag)
      if(tag == _d.main_tag) {
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
    url: "/tags",
    data: { 'tag[value]': value.replace(/\n/,'') },
    success: suc(nT,nF,function(a) {
      _d.add_tag(new Tag(a.value,a.extra,a.id))
      _d.add_undo()
    }),
    error: te(nF)
  })
}

function tag_delete(tag,nT,nF) {
  $.ajax({
    type: "DELETE",
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

function tag_filter(tag,nT,nF) {
  if(tag == _d.main_tag || _d.has_filter(tag)) {
    is_fun(nF) && nF()
    return
  }

  tag.filter_on()
  _d.add_filter(tag)
  _d.update_filter()
  is_fun(nT) && nT()
}

function tag_unfilter(tag,nT,nF) {
  if(tag == _d.main_tag || !_d.has_filter(tag)) {
    is_fun(nF) && nF()
    return
  }

  tag.filter_off()
  _d.rm_filter(tag)
  _d.update_filter()
  is_fun(nT) && nT()
}

function and_filtering(nT,nF) {
  if(_d.filter_type) {
    is_fun(nF) && nF()
  }
  _d.filter_type=true
  _d.update_filter()
  is_fun(nT) && nT()
}

function or_filtering(nT,nF) {
  if(!_d.filter_type) {
    is_fun(nF) && nF()
  }
  _d.filter_type=false
  _d.update_filter()
  is_fun(nT) && nT()
}

function item_show(item,nT,nF) {
  if(_d.item_show)
    _d.item_show.show_mark(false)
  _d.item_show=item
  if(_d.item_show) {
    _d.item_show.show_mark(true)
    is_fun(nT) && nT()
  } else {
    is_fun(nF) && nF()
  }
}

function item_show_next(nT,nF) {
  var item=_d.next(_d.item_show)
  if(item)
    item_show(item,nT,nF)
  else {
    is_fun(nF) && nF()
  }
}

function item_show_prev(nT,nF) {
  var item=_d.prev(_d.item_show)
  if(item)
    item_show(item,nT,nF)
  else {
    is_fun(nF) && nF()
  }
}

function item_expand(item,nT,nF) {
  item.expand()
  is_fun(nT) && nT()
}

function item_collapse(item,nT,nF) {
  item.collapse()
  is_fun(nT) && nT()
}

function item_toggle_expand(item,nT,nF) {
  item.toggle_expand()
  is_fun(nT) && nT()
}

function item_expand_all(nT,nF) {
  _d.items.each(function(item) { item_expand(item,nT,nF) })
}

function item_collapse_all(nT,nF) {
  _d.items.each(function(item) { item_collapse(item,nT,nF) })
}

function item_move_selection_down(nT,nF) {
  if(_d.item_show==null) {
    is_fun(nF) && nF()
    return
  }
  var item=_d.next(_d.item_show)
  if(item) {
    item_move_after(_d.item_show,item,nT,nF)
  }
  else {
    is_fun(nF) && nF()
  }
}

function item_move_selection_up(nT,nF) {
  if(_d.item_show==null) {
    is_fun(nF) && nF()
    return
  }
  var item=_d.prev(_d.item_show)
  if(item) {
    item_move_before(_d.item_show,item,nT,nF)
  }
  else {
    is_fun(nF) && nF()
  }
}

function item_move_before(item1,item2,nT,nF) {
  //log('want to put '+item1.value+' before '+item2.value)
  if(item1==item2) {
    is_fun(nF) && nF()
    return
  }

  _d.rm_item(item1)
  _d.items.splice(_d.item(item2),0,item1)

  item2.ui.before(item1.ui)
  _d.save_order_cookie()
  is_fun(nT) && nT()
}

function item_move_after(item1,item2,nT,nF) {
  //log('want to put '+item1.value+' after '+item2.value)
  if(item1==item2) {
    is_fun(nF) && nF()
    return
  }
  _d.rm_item(item1)
  _d.items.splice(_d.item(item2)+1,0,item1)

  item2.ui.after(item1.ui)
  _d.save_order_cookie()
  is_fun(nT) && nT()
}

function item_send_to_next(item,nT,nF) {
  var tag_in=_d.tag_value('in')
  var tag_next=_d.tag_value('next')

  if(item.has(tag_in)) {
    item_remove_tag(item,tag_in,function() {
      if(item==_d.item_show && this_tag=='in')
        item_show_next()
      item_add_tag(item,tag_next,function() {
        is_fun(nT) && nT()
        _d.join_undos(2)
      },nF)
    },nF)
  } else {
    item_add_tag(item,tag_next,nT,nF)
  }
}

function item_send_to_waiting(item,nT,nF) {
  var tag_in=_d.tag_value('in')
  var tag_waiting=_d.tag_value('waiting')
  item_update(item,'['+today()+'] '+item.value,function(){
    item_remove_tag(item,tag_in,function() {
      if(item==_d.item_show)
        item_show_next()
      item_add_tag(item,tag_waiting,function() {
        is_fun(nT) && nT()
        _d.join_undos(3)
      },nF)
    },nF)
  },nF)
}

function item_send_to_someday(item,dt,nT,nF) {
  var tag_in=_d.tag_value('in')
  var tag_someday=_d.tag_value('someday')

  function what() {
    if(item.has(tag_in)) {
      item_remove_tag(item,tag_in,function() {
        if(item==_d.item_show && this_tag=='in')
          item_show_next()
        item_add_tag(item,tag_someday,function() {
          is_fun(nT) && nT()
          _d.join_undos(dt ? 3 : 2)
        },nF)
      },nF)
    } else {
      item_add_tag(item,tag_someday,nT,nF)
    }
  }

  if(dt)
    item_update(item,'@['+dt+'] '+item.value,what,nF)
  else
    what()
}

function item_split(item,selection,extra_tags,nT,nF) {
  if(selection=='') {
    //$.warning('selection cant be void in division')
    is_fun(nF) && nF()
    return
  }

  var data=divide(item.value,selection," - ")
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
    url: "/undo/"+howmany,
    success: suc(nT,nF,function(a) {
      console.dir(a)
      $.message('undo produced')
      load_data()
    }),
    error: te(nF)
  })
}

function redo(nT,nF) {
  $.ajax({
    type: "GET",
    url: "/redo",
    success: suc(nT,nF,function(a) {
      $.message('redo produced')
      _d.add_undo(a.level)
      load_data()
    }),
    error: te(nF)
  })
}
