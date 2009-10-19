var all_events=[]

function save_input_handler(on,off) {
  if(all_events.length > 0)
    all_events[all_events.length-1].offH()
  on()
  all_events.push({ onH: on, offH: off })
}

function restore_input_handler() {
  all_events.pop().offH()
  all_events[all_events.length-1].onH()
}

var cancel_which=null
var cancel_type=null

function my_event(e) {
  var h=e.originalEvent["handled"]
  e.originalEvent["handled"]=true
  if(cancel_this(e))
    return false
  return h!==true
}

function cancel_this(e) {
  var c=cancel_which==e.which && cancel_type==e.type
  cancel_which=null
  cancel_type=null
  return c
}

function cancel_next(which,type) {
  cancel_which=which
  cancel_type=type
}

function ctrl_dot(e) { return e.which==190 && e.ctrlKey }
function ctrl_del(e) { return e.which==46 && e.ctrlKey }
function esc(e) { return e.which==27 }
function ctrl_enter(e) { return e.which==13 && e.ctrlKey }
function enter(e) { return e.which==13 }

var command=''
function main_key_handler(e) {
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
        item_toggle_expand(is)
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
        item_send_to_next(is,p_mess('item sent to next'))
      command=''
      break

    case 'W':
      if(is!=null && _d.main_tag.value=='in')
        item_send_to_waiting(is,p_mess('item sent to waiting'))
      command=''
      break

    case 'A':
      if(is!=null) {
        var tags=_d.tags.grep(not_has_tag(is)).map(get_value)
        $.selector('Select a tag to add',tags,function(tagv) {
          //log(tagv?'tag:'+tagv:'none')
          if(tagv)
            item_add_tag(is,_d.tag_value(tagv),
              p_mess('tag added to item'))
        })
      }
      command=''
      break

    case 'R':
      if(is!=null) {
        var tags=is.tags.map(get_value)
        $.selector('Select a tag to remove',tags,function(tagv) {
          //log(tagv?'tag:'+tagv:'none')
          if(tagv)
            item_remove_tag(is,_d.tag_value(tagv),
              p_mess('tag removed from item'))
        })
      }
      command=''
      break

    case 'TE':
      var tags=_d.tags.map(get_value)
      $.selector('Select a tag to edit',tags,function(tagv) {
        //log(tagv?'tag:'+tagv:'none')
        if(tagv)
          _d.tag_value(tagv).edit()
      })
      command=''
      break

    case 'FT':
      var tags=_d.tags.grep(not_a_filter).map(get_value)
      $.selector('Select a tag to filter by',tags,function(tagv) {
        //log(tagv?'tag:'+tagv:'none')
        if(tagv)
          tag_filter(_d.tag_value(tagv))
      })
      command=''
      break

    case 'FR':
      var tags=_d.filters.map(get_value)
      $.selector('Select a tag to unfilter',tags,function(tagv) {
        //log(tagv?'tag:'+tagv:'none')
        if(tagv)
          tag_unfilter(_d.tag_value(tagv))
      })
      command=''
      break

    case 'FC':
      _d.tags.concat().each(tag_unfilter)
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
      var tags=_d.tags.grep(not_main_tag).map(get_value)
      tags.push('(none)')
      $.selector('Select a tag to go to',tags,function(tagv) {
        //log(tagv?'tag:'+tagv:'none')
        if(tagv)
          go_to(tagv!='(none)' ? tagv : '/')
      })
      command=''
      break

    case 'C':
      $.calendar_show()
      command=''
      break

    case 'UU':
      undo()
      command=''
      break

    case 'UR':
      redo()
      command=''
      break

    case 'S':
      var sel=window.getSelection().
        toString().
        replace(/\n#/g,"\n -").
        replace(/^# /,'')
      if(is!=null && is.value.test(sel.escapeRegExp()))
        item_split(is,sel)
      command=''
      break;
  }

  setTimeout(function(){ command='' }, 300)
  return false
}
