var _d=null

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

  _d=new Data(this_tag,all_tags,all_items)

  $('#add_tag').append(add_button().click(function() { 
    ajax_tag_create($('#add_tag_text').val(),function(x) {
      var t=new Tag(x.tag.value,x.tag.id)
      t.show()
      _d.add_tag(t)
      $('#add_tag_text').val('').focus()
    })
  }))

  $('#add_item').append(add_button().click(function() { 
    ajax_item_create($('#add_item_text').val(),_d.main_tag,function(x) {
      var i=new Item(x.item.value,x.item.id)
      i.show()
      _d.add_item(i)
      $('#add_item_text').val('').focus()
      //missing add all tags
    })
  }))

//   $('#add_tag_button').click(function() {
//     ajax_tag_create($('#add_tag_text').val(),function(x) {
//       var t=new Tag(x.tag.value,x.tag.id)
//       t.show()
//       _d.add_tag(t)
//       $('#add_tag_text').val('').focus()
//     })
//   })

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

  $('#dump').click(function() { _d.log() })
})
