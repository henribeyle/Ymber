function disable_ctrl_keys(e) {
  var key=String.fromCharCode(e.which)
  var ctrl_keys = ['S','Q','W','U','I','O',
    'P','D','H','J','K','L','B','N']
  if(e.ctrlKey)
    for(var i=0;i<ctrl_keys.length;i++)
      if(ctrl_keys[i] == key)
        return false
  return true
}

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

function ctrl_e(e) { return e.which==69 && e.ctrlKey }
function ctrl_9(e) { return e.which==57 && e.ctrlKey }
function ctrl_0(e) { return e.which==48 && e.ctrlKey }
function ctrl_j(e) { return e.which==74 && e.ctrlKey }
function ctrl_l(e) { return e.which==76 && e.ctrlKey }
function ctrl_y(e) { return e.which==89 && e.ctrlKey }
function ctrl_dot(e) { return e.which==190 && e.ctrlKey }
function ctrl_del(e) { return e.which==46 && e.ctrlKey }
function esc(e) { return e.which==27 && !e.ctrlKey }
function ctrl_esc(e) { return e.which==27 && e.ctrlKey }
function ctrl_enter(e) { return e.which==13 && e.ctrlKey }
function enter(e) { return e.which==13 }

var command=''
function main_key_handler(e) {
// log('[main]? '+e.which)
  if(!my_event(e)) return
// log('[main] '+e.which)

  if(_d == null) return true
  if(e.which == 8) {
    command=''
    return true
  }
  if(e.which == 16 || e.which == 17 || e.which == 18) return true

  var is=_d.item_show
  var c=String.fromCharCode(e.which)
  if(e.which == 13) c = 'enter'
  if(e.which == 36) c = 'home'
  if(e.which == 35) c = 'end'
  c = e.shiftKey ? c.toUpperCase(c) : c.toLowerCase(c)
  if(e.shiftKey && e.which >= 48 && e.which <= 57 ) { // a number pressed
    c=[')','!','@','#','$','%','^','&','*','('][e.which-48]
  }

  c = e.ctrlKey ? 'ctrl+'+c : c
  c = e.altKey ? 'alt+'+c : c
  command+=c
  //log("value :'"+c+"' = "+e.which+" command:'"+command+"'")

  clear_command=true
  switch(command) {
    case 'gi': go_to('in') ; break
    case 'gn': go_to('next') ; break
    case 'gw': go_to('waiting') ; break
    case 'gs': go_to('someday') ; break
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

    case 'home': item_show_first() ; break
    case 'end':  item_show_last() ; break

    case 'HOME': item_move_selection_first() ; break
    case 'END': item_move_selection_last() ; break

    case '9': item_collapse_all() ; break
    case '0': item_expand_all() ; break

    case 'n': add_item_helper() ;  break
    case 'e': is && is.edit() ; break
    case 'o': is && item_toggle_expand(is) ; break
    case 'dd': is && item_delete(is,p_mess('item deleted')) ; break

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
      if(is!=null && is.value.test(sel.escapeRegExp())) {
        var start=is.value.indexOf(sel)
        var end=start+sel.length
        var ts=new TextSegment(null,is.value,start,end)
        item_split(is,ts,[],p_mess('item has been split'))
      }
      break;

    case 'i':
      is &&
      item_send_to_in(is,p_mess('item sent to in'))
      break

    case 'y':
      if(is) {
        // higuest precedence, tag 'in'... will always
        // send the whole thing to 'next'
        if(['in','waiting','someday'].contains(this_tag)) {
          item_send_to_next(is,p_mess('item sent to next'))
        } else {
          var sel=window.getSelection().
            toString().
            replace(/\n#/g,"\n -").
            replace(/^# /,'')
          if(sel!='' && is.value.test(sel.escapeRegExp())) {
            var start=is.value.indexOf(sel)
            var end=start+sel.length
            var ts=new TextSegment(null,is.value,start,end)
            item_split(is,ts,[_d.tag_value('next')],
              p_mess('item has been split (and sent to next)'))
          } else {
            item_send_to_next(is,p_mess('item sent to next'))
          }
        }
      }
      break

    case 'w':
      is &&
      item_send_to_waiting(is,p_mess('item sent to waiting'))
      break

    case 's':
      is &&
      item_send_to_someday(is,null,p_mess('item sent to someday'))
      break

    case '@s':
    case '2s':
      is &&
      $.select_date(null,function(x) {
        item_send_to_someday(is,x,p_mess('item sent to someday'))
      })
      break

    case 'h':
      show_help()
      break

    case 'R':
      load_data()
      break

    case 'alt+r':
      toggle_review()
      break

    case 'enter':
      var sel=window.getSelection().anchorNode
      var item=_d.item_id(sel ? $(sel).oid() : -1)
      if(item) item_show(item)
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
