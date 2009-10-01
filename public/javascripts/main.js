var _d=null

var command=''
function key_handler(e) {
//log('[main]? '+e.which)
  if(!my_event(e)) return
//log('[main] '+e.which)
  if(e.ctrlKey || e.altKey || e.metaKey || e.which == 8) {
    command=''
    return true
  }

  var is=_d.item_show
  var c=String.fromCharCode(e.which)
  command+=c
  //log("value :'"+c+"' = "+e.which+" command:'"+command+"'")
  switch(command) {
    case 'J': item_show_next() ; command='' ; break
    case 'K': item_show_prev() ; command='' ; break

    case 'H': item_move_selection_down() ; command='' ; break
    case 'L': item_move_selection_up() ; command='' ; break

    case 'NI':
      add_item_helper()
      command=''
      break

    case 'NT':
      add_tag_helper()
      command=''
      break

    case 'E':
      if(is!=null)
        is.edit()
      command=''
      break

    case 'O':
      if(is!=null)
        is.expanded ? item_collapse(is) : item_expand(is)
      command=''
      break

    case '9':
      item_expand_all()
      command=''
      break

    case '0':
      item_collapse_all()
      command=''
      break

    case 'Y':
      if(is!=null && _d.main_tag.value=='in')
        item_send_to_next(is)
      command=''
      break

    case 'W':
      if(is!=null && _d.main_tag.value=='in')
        item_send_to_waiting(is)
      command=''
      break

    case 'A':
      if(is!=null) {
        var tags=$.map(_d.tags,function(tag) {
          return is.has(tag) ? null : tag.value
        })
        $.selector('Select a tag to add',tags,function(tagv) {
          //log(tagv?'tag:'+tagv:'none')
          if(tagv)
            item_add_tag(is,_d.tag_value(tagv))
        })
      }
      command=''
      break

    case 'R':
      if(is!=null) {
        var tags=$.map(is.tags,function(tag) {
          return tag.value
        })
        $.selector('Select a tag to remove',tags,function(tagv) {
          //log(tagv?'tag:'+tagv:'none')
          if(tagv)
            item_remove_tag(is,_d.tag_value(tagv))
        })
      }
      command=''
      break

    case 'TE':
      var tags=$.map(_d.tags,function(tag) {
        return tag.value
      })
      $.selector('Select a tag to edit',tags,function(tagv) {
        //log(tagv?'tag:'+tagv:'none')
        if(tagv)
          _d.tag_value(tagv).edit()
      })
      command=''
      break

    case 'FT':
      var tags=$.map(_d.tags,function(tag) {
        return _d.has_filter(tag) ? null : tag.value
      })
      $.selector('Select a tag to filter by',tags,function(tagv) {
        //log(tagv?'tag:'+tagv:'none')
        if(tagv)
          tag_filter(_d.tag_value(tagv))
      })
      command=''
      break

    case 'FR':
      var tags=$.map(_d.filters,function(tag) {
        return tag.value
      })
      $.selector('Select a tag to unfilter',tags,function(tagv) {
        //log(tagv?'tag:'+tagv:'none')
        if(tagv)
          tag_unfilter(_d.tag_value(tagv))
      })
      command=''
      break

    case 'FC':
      $.each(_d.tags.concat(),function(i,tag) {
        tag_unfilter(tag)
      })
      command=''
      break

    case 'FO':
      or_filtering()
      command=''
      break
    case 'FA':
      and_filtering()
      command=''
      break

    case 'GT':
      var tags=$.map(_d.tags,function(tag) {
        return tag != _d.main_tag ? tag.value : null
      })
      tags.push('(none)')
      $.selector('Select a tag to go to',tags,function(tagv) {
        //log(tagv?'tag:'+tagv:'none')
        if(tagv)
          go_to(tagv!='(none)' ? tagv : '/')
      })
      command=''
      break
  }

  setTimeout(function(){ command='' }, 300)
  return false
}

function add_item_helper() {
  $.editor({
    title: 'Add item',
    text: '',
    buttons: [ {
        img: './images/Stop_Red_Button.png',
        title: 'cancel',
        accel: function(e) { return e.which==27 }
      }, {
        img: './images/Add.png',
        title: 'add',
        accel:  function(e) { return e.which==13 && e.ctrlKey },
        click: function(x) { item_new(x,_d.main_tag) }
      }
    ]
  })
}

function add_tag_helper() {
  $.editor({
    title: 'Add tag',
    text: '',
    rows: 1,
    buttons: [ {
        img: './images/Stop_Red_Button.png',
        title: 'cancel',
        accel: function(e) { return e.which==27 }
      }, {
        img: './images/Add.png',
        title: 'add',
        accel:  function(e) { return e.which==13 },
        click: function(x) { tag_new(x) }
      }
    ]
  })
}

$(function() {
  //window.onerror=catch_all
  $.fn.extend({
    id: function() {
      var i=this.attr('id')
      if(i) return i
      var p=this.parents('[id]').eq(0)
      if(p) return p.attr('id')
      return null
    },
    oid: function() {
      return this.id().replace(/^(item|tag)-/,'')
    }
  })

  _d=new Data(this_tag,all_tags,all_items)
  _d.order_from_cookie()
  _d.filters_from_cookie()

  if(_d.main_tag)
    $('#title .main').html(_d.main_tag.value_or_extra())

  if(this_tag == 'in') {
    $('<input>').
      attr('type','button').
      attr('value','to Next').
      attr('id','send_to_next').
      appendTo('#title').
      click(function() { if(_d.item_show) item_send_to_next(_d.item_show) })
    $('<input>').
      attr('type','button').
      attr('value','to Waiting').
      attr('id','send_to_waiting').
      appendTo('#title').
      click(function() { if(_d.item_show) item_send_to_waiting(_d.item_show) })
  }

  $('#add_item_button').click(add_item_helper)
  $('#add_tag_button').click(add_tag_helper)

  $('#title').droppable({
    accept: '.tag',
    hoverClass: 'dropping-into-item',
    drop: function(event, ui) {
      tag_filter(_d.tag_id($(ui.draggable).oid()))
    }
  })

  $("#items")
    .sortable({
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

  $('.map-popup').live('click',function() {
    var m=/\{(\d+\.\d+),(\d+\.\d+)\}/.exec($(this).text())
    $.map_show(null,m[1],m[2])
  })

  save_input_handler(
    function() { $(document).bind('keyup', key_handler) },
    function() { $(document).unbind('keyup', key_handler) }
  )
})
