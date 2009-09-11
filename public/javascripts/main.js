var _items=null
var _tags=null

function item_create(x) { // missing tags
   $.ajax({
      type: "POST",
      url: "/items",
      data: {'item[value]': x},
      success: function(a) {
        var b=get_response(a)
        if(is_error(b)) {
          normal_error(b.error)
        } else {
          log('no error' + a)
        }
      },
      error: terrible_error
   })
}

$(function() {
  _items=new G()
  _tags=new G()

  $('#add_item_button').click(function() {
    //var v=$('#add_item_text').val()
    //item_create(v)
    var i1=new E('item1',1)
    _items.add(i1)
    _items.log('items:')
    //i1.log('item1: ')

    var t1=new E('tag1',1)
    _tags.add(t1)
    _tags.log('tags:')

    i1.add(t1)
//     i1.log('item1 after tag1: ')
    _items.logr('items after connection: ')
    _tags.logr('items after connection: ')





//     _items.log('items after tag:')
//     _tags.log('tags after tag:')
// 
//     i1.add(t1)
//     _items.log('items after connection:')
//     _tags.log('tags after connection:')
//     i1.log('item1 + tag1: ')
// 
// 
//     t1.value='tag1-mod'
//     _items.log('items after mod:')
//     _tags.log('tags after mod:')
//     //i1.log('item1 + tag1 mod: ')
//     //t1.log('tag1: ')
//     t1.remove(i1)
//     _items.log('items after removing:')
//     _tags.log('tags after removing:')
//     //i1.log('item1 after removing: ')
//     //t1.log('tag1 after removing: ')
  })
})
