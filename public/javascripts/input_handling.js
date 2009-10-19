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
// log('[main]? '+e.which)
  if(!my_event(e)) return
// log('[main] '+e.which)
  if(e.which == 8) {
    command=''
    return true
  }
  if(e.which == 16 || e.which == 17 || e.which == 18) return true

  var is=_d.item_show
  var c=String.fromCharCode(e.which)
  c = e.shiftKey ? c.toUpperCase(c) : c.toLowerCase(c)
  c = e.ctrlKey ? 'ctrl+'+c : c
  c = e.altKey ? 'alt+'+c : c
  command+=c
// log("value :'"+c+"' = "+e.which+" command:'"+command+"'")

  clear_command=true
  switch(command) {
    case 'gi': go_to('in') ; break
    case 'gn': go_to('next') ; break
    case 'gw': go_to('waiting') ; break
    case 'gt':
      var tags=_d.tags.grep(not_main_tag).map(get_value)
      tags.push('(none)')
      $.selector('Select a tag to go to',tags,function(tagv) {
        if(tagv)
          go_to(tagv!='(none)' ? tagv : '/')
      })
      break

    case 'j': item_show_next() ; break
    case 'k': item_show_prev() ; break
    case 'J': item_move_selection_down() ; break
    case 'K': item_move_selection_up() ; break

    case '9': item_collapse_all() ; break
    case '0': item_expand_all() ; break

    case 'n': add_item_helper() ;  break
    case 'e': is && is.edit() ; break
    case 'o': is && item_toggle_expand(is) ; break

    case 'a':
      if(is!=null) {
        var tags=_d.tags.grep(not_has_tag(is)).map(get_value)
        $.selector('Select a tag to add',tags,function(tagv) {
          if(tagv)
            item_add_tag(is,_d.tag_value(tagv),
              p_mess('tag added to item'))
        })
      }
      break

    case 'r':
      if(is!=null) {
        var tags=is.tags.map(get_value)
        $.selector('Select a tag to remove',tags,function(tagv) {
          if(tagv)
            item_remove_tag(is,_d.tag_value(tagv),
              p_mess('tag removed from item'))
        })
      }
      break

    case 'tn': add_tag_helper() ; break

    case 'te':
      var tags=_d.tags.map(get_value)
      $.selector('Select a tag to edit',tags,function(tagv) {
        if(tagv)
          _d.tag_value(tagv).edit()
      })
      break

    case 'ft':
      var tags=_d.tags.grep(not_a_filter).map(get_value)
      $.selector('Select a tag to filter by',tags,function(tagv) {
        if(tagv)
          tag_filter(_d.tag_value(tagv))
      })
      break

    case 'fr':
      var tags=_d.filters.map(get_value)
      $.selector('Select a tag to unfilter',tags,function(tagv) {
        if(tagv)
          tag_unfilter(_d.tag_value(tagv))
      })
      break

    case 'fc':
      _d.tags.concat().each(tag_unfilter)
      break

    case 'fo': or_filtering() ; break
    case 'fa': and_filtering() ; break

    case 'c': $.calendar_show() ; break

    case 'uu':
      undo()
      break

    case 'ur':
      redo()
      break

    case 'ctrl+¾':
      var sel=window.getSelection().
        toString().
        replace(/\n#/g,"\n -").
        replace(/^# /,'')
      if(is!=null && is.value.test(sel.escapeRegExp()))
        item_split(is,sel)
      break;

    case 'y':
      is &&
      this_tag=='in' &&
      item_send_to_next(is,p_mess('item sent to next'))
      break

    case 'w':
      is &&
      this_tag=='in' &&
      item_send_to_waiting(is,p_mess('item sent to waiting'))
      break

    default:
      clear_command=false
      break
  }

  if(clear_command)
    command=''
  else
    setTimeout(function(){ command='' }, 300)
  return false
}
