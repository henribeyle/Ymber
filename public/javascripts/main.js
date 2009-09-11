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
  _items=new E('main item list',-1)
  _tags=new E('main tags list',-1)

  $('#add_item_button').click(function() {
    //var v=$('#add_item_text').val()
    //item_create(v)
    var i1=new E('item1',1)
    var t1=new E('tag1',1)
    i1.log('item1: ')
    i1.add(t1)
    i1.log('item1 + tag1: ')
    t1.value='tag1-mod'
    i1.log('item1 + tag1 mod: ')
    t1.log('tag1: ')
    t1.remove(i1)
    i1.log('item1 after removing: ')
    t1.log('tag1 after removing: ')
  })
})
