// commands are functions which make all the work in the gui
// but which can be called from different places
// they all accept two functions at the end (may be null)
// which will be called on success or on failure

function item_new(value,mtag,nextT,nextF) {
  var nT=nextT
  var nF=nextF

  var post_data={'item[value]': value}
  if(mtag)
    post_data['tag[]']=mtag.id

  $.ajax({
    type: "POST",
    url: "/items",
    data: post_data,
    success: function(a) {
      if(a=parse(a)) {
        var item=new Item(a.item.value,a.item.id)
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

function item_delete(item,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  var itemO=item
  $.ajax({
    type: "DELETE",
    url: "/items/"+item.id,
    success: function(a) {
      if(a=parse(a)) {
        $.each(itemO.tags.concat(),function(i,x) {
          x.items.splice(x.item(itemO),1)
        })
        _d.rm_item(itemO)
        itemO.ui.remove()
        itemO.uie.remove()
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

function item_update(item,value,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  var itemO=item
  $.ajax({
    type: "PUT",
    url: "/items/"+item.id,
    data: {'item[value]': value},
    success: function(a) {
      if(a=parse(a)) {
        itemO.update(a.item.value)
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

function item_add_tag(item,tag,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  var itemO=item
  var tagO=tag

  if(itemO.has_tag(tagO))
    return

  $.ajax({
    type: "PUT",
    url: "/items/"+item.id+'/tag',
    data: 'tag[]='+tag.id,
    success: function(a) {
      if(a=parse(a)) {
        itemO.add_tag(tagO)
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

function item_remove_tag(item,tag,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  var itemO=item
  var tagO=tag

  $.ajax({
    type: "DELETE",
    url: "/items/"+item.id+'/tag',
    data: 'tag[]='+tag.id,
    success: function(a) {
      if(a=parse(a)) {
        item.tags.splice(item.tag(tag),1)
        tag.items.splice(tag.item(item),1)
        $('.tag-id-'+tag.id,item.ui).remove()
        if(tag == _d.main_tag) {
          _d.rm_item(item)
          item.ui.remove()
          item.uie.remove()
        }
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

function tag_delete(tag,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  var tagO=tag
  $.ajax({
    type: "DELETE",
    url: "/tags/"+tag.id,
    success: function(a) {
      if(a=parse(a)) {
        $.each(tagO.items.concat(),function(i,x) {
          x.tags.splice(x.tag(tagO),1)
          tagO.items.splice(tagO.item(x),1)
          $('.tag-id-'+tag.id,x.ui).remove()
        })
        var main=(tagO == _d.main_tag)
        tag_unfilter(tagO)
        _d.rm_tag(tagO)
        if(main) go_to('')

        tagO.ui.remove()
        tagO.uie.remove()
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

function tag_update(tag,value,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  var tagO=tag
  $.ajax({
    type: "PUT",
    url: "/tags/"+tag.id,
    data: { 'tag[value]' : value },
    success: function(a) {
      if(a=parse(a)) {
        tagO.update(a.tag.value)
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

function tag_filter(tag,nextT,nextF) {
  if(tag == _d.main_tag || _d.has_filter(tag)) {
    nextF && nextF()
    return
  }

  tag.filtering=true
  $('.value',tag.ui).addClass('filter')
  _d.add_filter(tag)
  _d.update_filter()
  nextT && nextT()
}

function tag_unfilter(tag,nextT,nextF) {
  if(tag == _d.main_tag || !_d.has_filter(tag)) {
    nextF && nextF()
    return
  }

  tag.filtering=false
  $('.value',tag.ui).removeClass('filter')
  _d.rm_filter(tag)
  _d.update_filter()
  nextT && nextT()
}

function and_filtering() {
  _d.filter_type=true
  _d.update_filter()
}

function or_filtering() {
  _d.filter_type=false
  _d.update_filter()
}
