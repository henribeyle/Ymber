var _d=null
// var _items=null
// var _tags=null
// var _this_tag=null

// function parse_new_tag(x) {
//   var e=new E(x.tag.value,x.tag.id)
//   _tags.add(e)
//   return e
// }
// 
// function parse_new_item(x) {
//   var e=new E(x.item.value,x.item.id)
//   _items.add(e)
//   $.each(x.item.tags,function(it,xt) {
//     var tid=_tags.find_by_id(xt.id)
//     if(tid==-1) {
//       assert_failed('unknown tag id: '+xt.id)
//       return
//     }
//     e.add(_tags.g[tid])
//   })
//   return e
// }
// 
// function show_item(e) {
//   var i=$('<img>').attr('src','/images/Minus_Red_Button.png').
//     addClass('delete').click(function() {
//     item_destroy(get_id($(this).id()))
//   })
//   var d=$('<div>').attr('id','item-'+e.id).addClass('item')
//   d.append(i)
//   d.append($('<span>').addClass('value').html(e.value))
//   $.each(e.sub.g,function(i,x) {
//     var t1=$('<span>').addClass('tag').addClass('tag-id-'+x.id)
//     var t2=$('<span>').addClass('content').html(x.value)
//     t1.append(t2)
//     d.append(t1)
//   })
//   d.appendTo('#items')
// }
// 
 
function build_db() {
  _d=new Data()

  if(this_tag == undefined) {
    assert_failed('this_tag is not defined')
    return
  }
  if(all_tags == undefined) {
    assert_failed('all_tags is not defined')
    return
  }
  if(all_items == undefined) {
    assert_failed('all_items is not defined')
    return
  }

  $.each(all_tags,function(i,x) { 
    var t=new Tag(x.tag.value,x.tag.id)
    t.show()
    _d.add_tag(t)
  })

  _d.set_main_tag(this_tag)


//   $.each(all_items,function(i,x) { show_item(parse_new_item(x)) })
}
// 
// function item_create(x) {
//   var post_data={'item[value]': x}
//   if(_this_tag) {
//     post_data['tag[]']=_this_tag.id
//   }
// 
//   $.ajax({
//     type: "POST",
//     url: "/items",
//     data: post_data,
//     success: function(a) {
//       if(a=parse(a))
//         show_item(parse_new_item(a))
//     },
//     error: terrible_error
//   })
// }
// 
// function item_update(i,x) {
//   var post_data=$.param({'item[value]': x})
//   $.each(_items.g[i].sub.g,function(j,x) {
//     post_data+='&'+'tag[]='+x.id
//   })
//   $.ajax({
//     type: "PUT",
//     url: "/items/"+_items.g[i].id,
//     data: post_data,
//     success: function(a) {
//       if(a=parse(a)) {
//         _items.remove(i)
//         show_item(parse_new_item(a))
//       }
//     },
//     error: terrible_error
//   })
// }
// 
// function item_destroy(id) {
//   $.ajax({
//     type: "DELETE",
//     url: "/items/"+id,
//     success: function(a) {
//       if(a=parse(a)) {
//         var pos=_items.find_by_id(id)
//         if(pos==-1) {
//           assert_failed('unknown items id: '+id)
//           return
//         }
//         _items.remove(pos)
//         $('#item-'+id).empty()
//       }
//     },
//     error: terrible_error
//   })
// }
// 
// function item_add_tag(ii,ti) {
//   $.ajax({
//     type: "PUT",
//     url: "/items/"+_items.g[ii].id+'/tag',
//     data: 'tag[]='+_tags.g[ti].id,
//     success: function(a) {
//       if(a=parse(a)) {
//         _items.g[ii].add(_tags.g[ti])
//       }
//     },
//     error: terrible_error
//   })
// }
// 
// function item_remove_tag(ii,ti) {
//   var tid=_items.g[ii].sub.g[ti].id
//   $.ajax({
//     type: "DELETE",
//     url: "/items/"+_items.g[ii].id+'/tag',
//     data: 'tag[]='+tid,
//     success: function(a) {
//       if(a=parse(a)) {
//         var tidpos=_tags.find_by_id(tid)
//         if(tidpos==-1) {
//           assert_failed('unknown tag id: '+tid)
//           return
//         }
//         _items.g[ii].remove(_tags.g[tidpos])
//       }
//     },
//     error: terrible_error
//   })
// }
// 
// function item_split(i) {
//   var els=_items.g[i].value.split("\n")
//   var post_data=$.map(els,function(x,j) { return 'value[]='+x }).join('&')
// 
//   $.ajax({
//     type: "POST",
//     url: "/items/"+_items.g[i].id+'/split',
//     data: post_data,
//     success: function(a) {
//       if(a=parse(a)) {
//         _items.remove(i)
//         $.each(a,function(i,x) { parse_new_item(x) } )
//       }
//     },
//     error: terrible_error
//   })
// }
// 
// function tag_update(i,x) {
//   $.ajax({
//     type: "PUT",
//     url: "/tags/"+_tags.g[i].id,
//     data: { 'tag[value]' : x },
//     success: function(a) {
//       if(a=parse(a)) {
//         _tags.g[i].value=a.tag.value
//       }
//     },
//     error: terrible_error
//   })
// }

$(function() {
  $.fn.extend({
    id: function() { 
      var i=this.attr('id')
      if(i) return i
      var p=this.parents('[id]').eq(0)
      if(p) return p.attr('id')
      return null
    }
  })

  build_db()

  $('#add_tag_button').click(function() {
    ajax_tag_create($('#add_tag_text').val(),function(x) {
      var t=new Tag(x.tag.value,x.tag.id)
      t.show()
      _d.add_tag(t)
      $('#add_tag_text').val('').focus()
    })
  })

//   $('#add_item_button').click(function() {
//     item_create($('#add_item_text').val())
//     $('#add_item_text').val('')
//   })
// 

//   $('#update_item_text').val(_items.g[0].value)
//   $('#update_item_button').click(function() {
//     item_update(0,$('#update_item_text').val())
//   })
// 
//   $('#add_tag_item_button').click(function() {
//     item_add_tag(0,0)
//   })
// 
//   $('#remove_tag_item_button').click(function() {
//     item_remove_tag(0,0)
//   })
// 
//   $('#split_item_button').click(function() {
//     item_split(0)
//   })
// 

//   $('#update_tag_button').click(function() {
//     var x=$('#update_tag_text').val()
//     var tid=_tags.find('tag-one')
//     if(tid==-1)
//       log('tag-one not found')
//     else
//       tag_update(tid,x)
//   })

  $('#dump').click(function() { _d.log() })
})
