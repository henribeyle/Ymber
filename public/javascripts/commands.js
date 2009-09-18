// commands are functions which make all the work in the gui
// but which can be called from different places
// they all accept two functions at the end (may be null)
// which will be called on success or on failure

function item_new(value,main_tag,nextT,nextF) {
  var nT=nextT
  var nF=nextF

  var post_data={'item[value]': value}
  if(main_tag)
    post_data['tag[]']=main_tag.id

  $.ajax({
    type: "POST",
    url: "/items",
    data: post_data,
    success: function(a) {
      if(a=parse(a)) {
        var item=new Item(a.item.value,a.item.id)
        item.show()
        _d.add_item(item)
        $.each(a.item.tags,function(i,x) {
          item.add_tag(_d.tag_id(x.id))
        })
        nT && nT()
      } else {
        nF && nF()
      }
    },
    error: function(r,e) {
      terrible_error(r,e)
      nF && nF()
    }
  })
}

function tag_new(value,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  $.ajax({
    type: "POST",
    url: "/tags",
    data: { 'tag[value]': value },
    success: function(a) {
      if(a=parse(a)) {
        var tag=new Tag(a.tag.value,a.tag.id)
        tag.show()
        _d.add_tag(tag)
        nT && nT()
      } else {
        nF && nF()
      }
    },
    error: function(r,e) {
      terrible_error(r,e)
      nF && nF()
    }
  })
}
